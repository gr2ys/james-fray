/*
 * 	This file is part of ELCube.
 *	ELCube is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as published by
 *	the Free Software Foundation, either version 3 of the License, or
 *	(at your option) any later version.
 *	ELCube is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *	You should have received a copy of the GNU Affero General Public License
 *	along with ELCube.  If not, see <https://www.gnu.org/licenses/>.
 */
import axios from 'axios'
import qs from 'qs'
import crypto from 'crypto'
import AuthUtils from "./AuthUtils";
import User from "../stores/StateUser";
import UI from "../stores/StateUI";
import StateDebug from "../stores/StateDebug";
import TextUtils from "../../utils/TextUtils";
import {v1 as uuidv1} from "uuid";

export default (Vue) => {

  // 密码加密
  function sha1(password){
    return crypto.createHash('sha1').update(
        crypto.createHash('sha1').update(password).digest('hex')
    ).digest('hex');
  }

  // 设置请求头
  let onRequestNoneToken = config => {
    if(StateDebug.state.debugId){ config.headers.common['NK-Debug'] = StateDebug.state.debugId; }
    config.headers.common['NK-App']   = 'elcube';
    return Promise.resolve(config)
  };
  const onRequestFulfilled = config => {
    let token = AuthUtils.getToken();
    if(token){

      let timestamp = Math.floor(new Date().getTime()/1000);

      const str = config.url.split('?');
      const array = str[1] ? str[1].split('&').map(i=>decodeURIComponent(i)) : [];

      if(config.headers['Content-Type']){
        if(config.headers['Content-Type'].indexOf('application/x-www-form-urlencoded;')>-1){
          if(config.data){
            config.data.split('&').forEach(item=>array.push(decodeURIComponent(item)))
          }
        }
      }

      let nonce = uuidv1();

      array.push(`timestamp=${timestamp}`)
      array.push(`secret=${token}`)
      array.push(`nonce=${nonce}`)

      // substr(4) 移除/api 前缀
      const unsign = str[0].substr(4)+'?'+array.sort().join('&');

      const signature = crypto.createHash('sha1')
          .update(unsign)
          .digest('hex');


      config.headers.common['elcube-client']    = AuthUtils.getClientId(uuidv1);
      config.headers.common['elcube-user']      = AuthUtils.getUsername();
      config.headers.common['elcube-timestamp'] = timestamp;
      config.headers.common['elcube-nonce']     = nonce;
      config.headers.common['elcube-signature'] = signature;

    }
    return onRequestNoneToken(config)
  };
  const onRequestRejected = error => {
    return Promise.reject(error)
  };

  // 设置响应配置
  let errorTime = 0;
  let errorMsg = null;
  const onResponseSuccessAuthed = res => {
    AuthUtils.expandToken();
    return onResponseSuccess(res)

  }
  const onResponseSuccess = res => {


    // 解码返回的数据
    if(res.data && typeof res.data === 'string' && res.data.startsWith("H4s")){
      res.data = JSON.parse(TextUtils.uncompress(res.data));
    }

    const logId = res.headers['nk-debug-log'];
    if(logId){
      axios.post("/api/debug/log/"+logId,{},{
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'NK-App': 'elcube',
          'NK-Token': AuthUtils.getToken()
        }
      }).then(log=>{
        if(log.data){
          console.debug(`\nRequest URL : ${res.request.responseURL}\n\n${log.data}`)
        }
      })
    }

    return Promise.resolve(res)
  };

  // 系统错误
  const onSystemError = error => {
    let now = new Date().getTime();

    const msg = error.response.data.msg || error.response.data;

    if(now-errorTime > 2000 || errorMsg !== msg){
      errorTime = now;
      errorMsg = msg;

      if(error.response.data.causeStackTrace)
        console.error(error.response.data.causeStackTrace.join('\n'))

      if(UI.state.errorVisible===false){
        UI.state.errorVisible = true;
        UI.state.errors = []
      }
      UI.state.errors.push(errorMsg);
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }

  const onDebugContextNotFound = () => {
    StateDebug.mutations.suspendDebug(StateDebug.state);
    Vue.prototype.$error({
      centered: true,
      title: '系统错误',
      content: '当前调试上下文不存在，系统将以普通模式重新载入',
      onOk() {
        location.reload();
      },
    });
  }

  // 没有权限，拒绝访问
  const onForbiddenError = error => {
    Vue.prototype.$error({
      centered: true,
      title: '访问受限',
      content: error.response.data.msg,
    });
    return Promise.reject(error);
  }

  // 用户操作错误或警告提示
  const onCaution = error => {
    Vue.prototype.$notification.error({
      message: '错误',
      description:error.response.data.msg
    })
    //Vue.prototype.$message.error(error.response.data.msg)
    return Promise.reject(error)
  }
  let onResponseError = error => {
    if(      error.response.status >=  500 &&
             error.response.status <   600) { return onSystemError(error);
    }else if(error.response.status === 701) { return onDebugContextNotFound(error);
    }else if(error.response.status === 400) { return onCaution(error);
    }else if(error.response.status === 403) { return onForbiddenError(error);
    }else if(error.response.status === 401) { return Promise.reject(error);
    }else if(error.response.status === 901) { return Promise.reject(error);
    }else{                                    return Promise.reject(error); // 其他未知的错误
    }
  };

  let defaultConfig = {
    baseURL: '',
    crossDomain: true,
    withCredentials: true,
    timeout: 120 * 1000,
  };

  const instanceForm = axios.create(Object.assign({headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'}},defaultConfig));
  const instanceJSON = axios.create(Object.assign({headers: {'Content-Type': 'application/json; charset=utf-8'}},defaultConfig));
  const instanceNone = axios.create(Object.assign({headers: {'Content-Type': 'application/json; charset=utf-8'}},defaultConfig));

  instanceForm.interceptors.request.use(onRequestFulfilled, onRequestRejected);
  instanceForm.interceptors.response.use(onResponseSuccessAuthed, onResponseError);
  instanceJSON.interceptors.request.use(onRequestFulfilled, onRequestRejected);
  instanceJSON.interceptors.response.use(onResponseSuccessAuthed, onResponseError);
  instanceNone.interceptors.request.use(onRequestNoneToken, onRequestRejected);
  instanceNone.interceptors.response.use(onResponseSuccess, onResponseError);


  const doRequest = (targetRequestFunction,args) => {

    let self = this;
    let state = AuthUtils.state();

    if(state.authed){
      return new Promise((resolve,reject)=>{
        targetRequestFunction.apply(self,args)
            .then(resolve)
            .catch((error)=>{
              if(error.response.status===401){
                reLogin(()=>{
                  targetRequestFunction.apply(self,args)
                      .then(resolve)
                      .catch(reject)
                });
              }else{
                reject(error);
              }
            })
      })
    }else{
      return new Promise((resolve,reject)=>{
        reLogin(()=>{
          targetRequestFunction.apply(self,args)
              .then(resolve)
              .catch(reject)
        });
      });
    }
  }

  function reLogin(callback){
    if(User.state.user.id){
      // 否则弹出重新登陆对话框
      User.state.reLogin = true;
      User.state.reLoginMessage = '由于长时间未操作，需要您重新验证身份';
      // 缓存用户调用的方法
      User.state.reLoginSuccess.push(callback);

      clearReLoginInterval();
      User.state.reLoginTime = reLoginCountdown;
      reLoginInterval = setInterval(() => {
        User.state.reLoginTime = --reLoginCountdown;
        if (reLoginCountdown === 0) {
          clearReLoginInterval();
          location.href = '';
        }
      }, 1000);
    }else{
      AuthUtils.clear();
      clearReLoginInterval();
      location.href = '';
    }
  }


  let reLoginInterval = undefined;
  let reLoginCountdown = 90;

  const clearReLoginInterval = ()=>{
    if(reLoginInterval)clearInterval(reLoginInterval);
    reLoginCountdown = 90;
  }

  function sendSMS(phone,verKey){
    return axios.get(`/api/ver/phone/${phone}/${verKey}?`);
  }
  function loginSMS(username, verKey, verCode){
    return new Promise((resolve, reject)=>{
      axios.post("api/authentication/token",null,{
        headers: {
          "elcube-client": AuthUtils.getClientId(uuidv1),
          "elcube-phone":  username,
          "elcube-verkey":verKey,
          "elcube-vercode":verCode,
          'NK-App': 'elcube',
        }
      }).then(res=>{
        User.state.reLogin=false;
        AuthUtils.setToken(res.data);
        clearReLoginInterval();
        resolve.apply(this,[res]);
      }).catch(e=>{
        reject.apply(this,[e.response])
        reLoginCountdown = 91;
      }).finally(()=>{
      });
    });
  }

  function login(username, password, verKey, verCode){

    const timestamp = Math.floor(new Date().getTime()/1000);
    const signature = crypto.createHash('sha1')
        .update(`password=${sha1(password)}&timestamp=${timestamp}`).digest('hex');

    return new Promise((resolve, reject)=>{
      axios.post("api/authentication/token",qs.stringify({
        systemId: "NK",
        client: AuthUtils.getClientId(uuidv1),
        os: "Browser",
        timestamp: timestamp,
        username:  username,
        password:  signature,
        verKey,
        verCode,
      }),{
        headers: {
          'NK-App': 'elcube',
        }
      }).then(res=>{
        User.state.reLogin=false;
        AuthUtils.setToken(res.data);
        clearReLoginInterval();
        resolve.apply(this,[res]);
      }).catch(e=>{
        reject.apply(this,[e.response])
        reLoginCountdown = 91;
      }).finally(()=>{
      });
    });
  }

  function logout(){
    clearReLoginInterval();
    AuthUtils.clear();
    return Promise.resolve();
  }

  return {
    login,
    loginSMS,
    sendSMS,
    logout,
    reLogin,
    instanceNone,
    instanceForm,
    instanceJSON,
    // eslint-disable-next-line no-unused-vars
    loadVue  (url,config)      { return doRequest.apply(this,[instanceNone.get,     arguments]) },
    // eslint-disable-next-line no-unused-vars
    request  (config)          { return doRequest.apply(this,[instanceForm.request, arguments]) },
    // eslint-disable-next-line no-unused-vars
    get      (url,config)      { return doRequest.apply(this,[instanceForm.get,     arguments]) },
    // eslint-disable-next-line no-unused-vars
    delete   (url,config)      { return doRequest.apply(this,[instanceForm.delete,  arguments]) },
    // eslint-disable-next-line no-unused-vars
    head     (url,config)      { return doRequest.apply(this,[instanceForm.head,    arguments]) },
    // eslint-disable-next-line no-unused-vars
    options  (url,config)      { return doRequest.apply(this,[instanceForm.options, arguments]) },
    // eslint-disable-next-line no-unused-vars
    post     (url,data,config) { return doRequest.apply(this,[instanceForm.post,    arguments]) },
    // eslint-disable-next-line no-unused-vars
    put      (url,data,config) { return doRequest.apply(this,[instanceForm.put,     arguments]) },
    // eslint-disable-next-line no-unused-vars
    patch    (url,data,config) { return doRequest.apply(this,[instanceForm.patch,   arguments]) },
    // eslint-disable-next-line no-unused-vars
    postJSON (url,data,config) { return doRequest.apply(this,[instanceJSON.post,    arguments]) },
    // eslint-disable-next-line no-unused-vars
    putJSON  (url,data,config) { return doRequest.apply(this,[instanceJSON.put,     arguments]) },
  }
}

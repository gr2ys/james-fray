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
export default {

  getClientId(create){
    let clientId = localStorage.getItem("$NK-Auth-ClientId");
    if(!clientId){
      clientId = 'web-'+create();
      localStorage.setItem("$NK-Auth-ClientId",clientId);
    }
    return clientId;
  },
  getUsername(){
    return localStorage.getItem("$NK-Auth-Username")||'';
  },
  getToken(){
    return localStorage.getItem("$NK-Auth-AccessToken")||'';
  },
  expandToken(){
    localStorage.setItem("$NK-Auth-ExpireTime",new Date().getTime() + parseInt(localStorage.getItem("$NK-Auth-Expire") - 5000));
  },
  state(){

    let now     = new Date().getTime();
    let token   = localStorage.getItem("$NK-Auth-AccessToken")||'';
    let expire  = localStorage.getItem("$NK-Auth-ExpireTime") - now;

    return {
      authed: token && expire > 0,  //有效期大于0
    };
  },
  setToken(data){
    localStorage.setItem("$NK-Auth-Expire",data.expire);
    localStorage.setItem("$NK-Auth-ExpireTime",new Date().getTime() + data.expire);
    localStorage.setItem("$NK-Auth-AccessToken",data.token);
    localStorage.setItem("$NK-Auth-Username",data.username);
  },
  clear(){
    localStorage.removeItem("$NK-Auth-Expire");
    localStorage.removeItem("$NK-Auth-ExpireTime");
    localStorage.removeItem("$NK-Auth-AccessToken");
    localStorage.removeItem("$NK-Auth-Username");
  }
}

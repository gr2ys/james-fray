<template>
    <a-spin :spinning="!!spinning">
        <a-alert v-if="error" type="error" :message="error.data" banner style="margin-bottom: 20px;border-radius: 4px;" />
        <a-form :form="form" @submit="submit">
            <a-form-item :validate-status="userNameError() ? 'error' : ''" :help="userNameError() || ''">
                <a-input-group compact>
                    <a-input
                        style="width: 60%;"
                        v-decorator="[
                                      'username',
                                      {
                                          rules: [
                                                { required: true,     message: '请输入手机号码' },
                                                { pattern: /1\d{10}/, message: '请输入正确的手机号码' },
                                          ],
                                          initialValue: username
                                      },
                                    ]"
                        :placeholder="$t('username')"
                        :disabled="usernameReadonly"
                    >
                        <a-icon slot="prefix" type="mobile" style="color:rgba(0,0,0,.25)" />
                    </a-input>
                    <a-button style="width: 40%;padding: 0;" @click="send" :disabled="!!time">
                        发送验证码{{time?('('+time+')'):''}}
                    </a-button>
                </a-input-group>
            </a-form-item>
            <a-form-item :validate-status="verCodeError() ? 'error' : ''" :help="verCodeError() || ''" class="ver-code">
                <a-input
                    v-decorator="[
                                  'verCode',
                                  { rules: [{ required: true, message: '请输入验证码' }] },
                                ]"
                    type="text"
                    :placeholder="$t('verCode')"
                >
                    <a-icon slot="prefix" type="safety-certificate" style="color:rgba(0,0,0,.25)" />
                </a-input>
            </a-form-item>
            <a-button type="primary" html-type="submit" v-show="false"></a-button>
            <a-form-item v-if="$slots.actions">
                <slot name="actions"></slot>
            </a-form-item>
        </a-form>
    </a-spin>
</template>

<script>

import NkUtil from "../../utils/NkUtil";

function hasErrors(fieldsError) {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
}
export default {
    props: {
        username:String,
        password:String,
        usernameReadonly:Boolean
    },
    data(){
        return{
            spinning:false,
            valid:false,
            error:undefined,
            verKey:undefined,
            hasErrors,
            form: this.$form.createForm(this,
                {
                    name: 'horizontal_login',
                    onValuesChange : this.onValuesChange
                }
            ),
            formError:undefined,

            time:0,
            timer:undefined
        }
    },
    mounted() {
    },
    destroyed() {
        clearInterval(this.timer)
    },
    methods:{
        // Only show error after a field is touched.
        userNameError() {
            const { getFieldError,isFieldTouched } = this.form;
            const error = isFieldTouched('username') && getFieldError('username');
            this.change({error:this.formError||error});
            return error;
        },
        // Only show error after a field is touched.
        verCodeError() {
            const { getFieldError,isFieldTouched } = this.form;
            const error =  isFieldTouched('verCode') && getFieldError('verCode');
            this.change({error:this.formError||error})
            return error;
        },
        change(e){
            this.formError = e.error;
            this.$emit("change",Object.assign({
                error: undefined,
                username: this.form.getFieldValue("username"),
                verCode: this.form.getFieldValue("verCode"),
                logging:false
            },e));
        },
        onValuesChange(){
            this.$nextTick(()=>{
                this.form.validateFields((err) => {
                    if(err){
                        this.change({error:err})
                    }else{
                        this.change({error:undefined})
                    }
                });
            })
        },
        submit(e){
            e.preventDefault();
            this.login();
        },
        clear(){
            this.form.setFieldsValue({
                verCode:undefined,
            });
            this.verKey = undefined;
            this.error = undefined;
        },
        send(e){
            e.preventDefault();
            this.form.validateFields(['username'],(err,values) => {
                if (!err) {
                    this.verKey = this.verKey||NkUtil.uuid();
                    this.$http.sendSMS(values.username,this.verKey)
                        .then(()=>{
                            this.time = 90;
                            this.timer = setInterval(()=>{
                                this.time--;
                                if(this.time===0){
                                    clearInterval(this.timer)
                                }
                            },1000)
                        }).catch((error)=>{
                            this.error = error
                        });
                }
            });
        },
        login(username){
            if(username){
                this.form.setFieldsValue({username});
            }
            this.spinning = true;
            this.form.validateFields((err, values) => {
                if (!err) {
                    this.change({logging:true})
                    this.$http.loginSMS(values.username,this.verKey,values.verCode)
                        .then(()=>{
                            this.$emit("success");
                            this.change({logging:false})
                            this.spinning = false;
                            this.clear();
                        }).catch((error)=>{
                            this.form.setFieldsValue({
                                verCode:undefined,
                            });

                            this.error = error;
                            this.spinning = false;

                            this.change({logging:false})
                        });
                }else
                    this.spinning = false;
            });
        },
    }
}
</script>

<style scoped>
::v-deep.ver-code .ant-input-group-addon{
    padding: 0;
}
::v-deep.ver-code .ant-input-group-addon img{
    border-bottom-right-radius: 4px;
    border-top-right-radius: 4px;
}
</style>


<i18n>
{
"zh_CN": {
"login": "登陆",
"username": "手机号",
"password": "密码",
"verCode": "验证码"
},
"en": {
"login": "Login",
"username": "Phone",
"password": "Password",
"verCode": "VerCode"
}
}
</i18n>
<!--
	This file is part of ELCube.
	ELCube is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	ELCube is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	You should have received a copy of the GNU Affero General Public License
	along with ELCube.  If not, see <https://www.gnu.org/licenses/>.
-->
<template>
    <nk-card title="审批意见">
        <nk-bpmn-view ref="bpmn"
                      v-if="bpmnVisible"
                      :process-definition-id="task.processDefinitionId"
                      :task-definition-key="task.taskDefinitionKey"
                      style="margin-bottom: 10px;" />

        <nk-bpm-timeline :task="task" :histories="task.historicalTasks" style="margin-left: 10px;margin-top: 15px;"></nk-bpm-timeline>

        <div v-if="task && completeTask" style="border-top: dashed 1px #ccc;padding-bottom: 20px;"></div>
        <nk-form ref="form" :col="1" v-if="task && completeTask && completeTask.form" :edit="true">
            <nk-form-item v-for="(item,index) in this.task.formFields"
                          :key="index"
                          :term="item.label"
                          :validate-for="completeTask.form[item.id]"
                          :required="!!(formValidations[item.id].required)"
                          :message="item.properties&&item.properties.errorMessage"
                          :validator="(toFunction(formValidations[item.id]['function'],item.properties))"
            >
                <a-input             v-if="item.typeName==='string'"  slot="edit" size="small" style="width: 70%;" v-model="completeTask.form[item.id]"/>
                <a-input-number v-else-if="item.typeName==='long'"    slot="edit" size="small" style="width: 30%;" v-model="completeTask.form[item.id]"/>
                <a-switch       v-else-if="item.typeName==='boolean'" slot="edit" size="small" v-model="completeTask.form[item.id]"/>
                <a-date-picker  v-else-if="item.typeName==='date'"    slot="edit" size="small" v-model="completeTask.form[item.id]" valueFormat="DD/MM/YYYY"></a-date-picker>
                <a-select       v-else-if="item.typeName==='enum'"    slot="edit" size="small" style="width: 30%;" v-model="completeTask.form[item.id]" :options="item.options"></a-select>
                <component     v-else :is="item.typeName"             slot="edit" :editMode=true v-model="completeTask.form[item.id]" :properties="item.properties" :options="item.options"></component>
            </nk-form-item>
            <nk-form-item title="办理意见" :required="true" :validate-for="completeTask.comment" message="请输入办理意见">
                <a-input slot="edit" type="textarea" v-model="completeTask.comment" :auto-size="{ minRows: 4, maxRows: 6 }" placeholder="请输入办理意见"></a-input>
            </nk-form-item>
        </nk-form>

        <div v-if="task && completeTask" slot="actions" style="padding: 0 20px 0;text-align: right">
            <a-button-group>
                <a-popconfirm v-for="transition in task.transitions"
                              :key="transition.id" :title="`确定${transition.name}?`"
                              :disabled="buttonDisabled"
                              @confirm="completeTaskOk(transition)">
                    <a-button type="primary" :disabled="buttonDisabled">{{ transition.name }}</a-button>
                </a-popconfirm>
                <a-button :disabled="!task || task.delegationState === 'PENDING'" type="default" @click="toForward" >转办</a-button>
                <a-button :disabled="!task || task.delegationState === 'PENDING'" type="default" @click="toDelegate" >委派</a-button>
            </a-button-group>
        </div>
        <a-button v-if="hasAuthority(['DEF:*','OPS:*'])"
                  slot="extra"
                  type="link"
                  size="small"
                  @click="$router.push(`/apps/devops/process/instances/detail/${task.processInstanceId}`)">流程实例</a-button>
        <a-button  v-if="!bpmnVisible"
                   slot="extra"
                   type="link"
                   size="small"
                   @click="bpmnVisible=true">查看流程图</a-button>
        <a-button-group size="small" slot="extra"  v-if="bpmnVisible">
            <a-button @click="$refs.bpmn.zoom( 1)"><a-icon type="zoom-in" /></a-button>
            <a-button @click="$refs.bpmn.zoom(-1)"><a-icon type="zoom-out" /></a-button>
            <a-button size="small" @click="bpmnVisible=false"><a-icon type="close-circle" /></a-button>
        </a-button-group>

        <a-modal v-model="modal.visible" :title="modal.title" centered @ok="modalOk" :ok-button-props="{ props: { disabled: okButtonDisabled } }">
            <nk-form-item title="用户" :width="80">
                <a-auto-complete
                    size="small"
                    v-model="modal.accountIdInput"
                    :data-source="modal.accounts"
                    style="width: 200px"
                    placeholder="请输入用户名称选择"
                    @select="accountSelected"
                    @search="accountSearch"
                    @change="accountChange"
                />
            </nk-form-item>
            <nk-form :col="1" :edit="true">
                <nk-form-item title="办理意见" :width="80">
                    <a-textarea v-model="modal.comment" :rows="5"
                                placeholder="请输入办理意见"></a-textarea>
                </nk-form-item>
            </nk-form>
        </a-modal>

    </nk-card>
</template>

<script>
import NkBpmnView from "./NkBpmnView";
import {mapGetters} from "vuex";
import { Interpreter } from "eval5";


export default {
    components: {NkBpmnView},
    props:{
        task:Object,
        doc:Object,
        editMode:Boolean,
        value:Boolean
    },
    data(){
        return {
            userIdsOp:[],
            param:{},
            bpmnVisible: false,
            completeTask: undefined,
            modal:{
                visible:false,
                title:undefined,
                accounts:[],
                accountIdInput:undefined,
                accountId:undefined,
                comment:undefined
            }
        }
    },
    created(){
        this.initFrom();
    },
    watch:{
        taskId(){
            this.initFrom();
        }
    },
    computed:{
        ...mapGetters('User',[
            'hasAuthority'
        ]),
        taskId(){
            return this.task && this.task.id;
        },
        buttonDisabled(){
            return this.editMode || !(this.completeTask && this.completeTask.comment && this.completeTask.comment.replace(/\s/g,''));
        },
        okButtonDisabled(){
            return this.editMode || !this.modal.accountId || !(this.modal.comment && this.modal.comment.replace(/\s/g,''));
        },
        formValidations(){
            const validations = {};
            if(this.task.formFields){
                this.task.formFields.forEach(field=>{
                    validations[field.id]={};
                    if(field.validationConstraints){
                        field.validationConstraints.forEach(item=>{
                            validations[field.id][item.name]=item.configuration;
                        })
                    }
                });
            }
            return validations
        }
    },
    methods:{
        initFrom(){
            let form = {};
            if(this.task.formFields && this.task.formFields.length){
                this.task.formFields.forEach(item=>{
                    form[item.id]=(item.value&&item.value.value) || item.defaultValue;
                });
            }
            this.completeTask = {form:{}};
        },
        completeTaskOk(transition){

            let error = undefined;
            if((error = this.$refs.form.hasError())){
                this.$message.error(error);
                return;
            }
            this.$emit("input",true);

            this.completeTask = Object.assign(this.completeTask,{
                taskId:this.task.id,
                transition,
                processInstanceId:this.task.processInstanceId
            });

            this.$http.postJSON(`/api/task/complete`,this.completeTask)
                .then(()=>{
                    this.$emit("complete",true);
                    this.completeTask = undefined;
                    this.bpmnVisible = false;
                })
                .catch(()=> {
                    this.$emit("input",false);
                });
        },
        toForward(){
            this.modal.accountIdInput = undefined;
            this.modal.title = '转办';
            this.modal.comment = this.completeTask.comment;
            this.modal.visible = true;
            this.modal.callback = this.doForward;
        },
        toDelegate(){
            this.modal.accountIdInput = undefined;
            this.modal.title = '委派';
            this.modal.comment = this.completeTask.comment;
            this.modal.visible = true;
            this.modal.callback = this.doDelegate;
        },
        doForward(){
            this.$emit("input",true);
            const completeTask = {taskId:this.task.id, accountId:this.modal.accountId, comment: this.modal.comment};
            this.$http.postJSON(`/api/task/forward`,completeTask)
                .then(()=>{
                    this.$emit("complete",true);
                    this.completeTask = undefined;
                    this.bpmnVisible = false;
                })
                .catch(()=> {
                    this.$emit("input",false);
                });
        },
        doDelegate(){
            this.$emit("input",true);
            const completeTask = {taskId:this.task.id, accountId:this.modal.accountId, comment: this.modal.comment};
            this.$http.postJSON(`/api/task/delegate`,completeTask)
                .then(()=>{
                    this.$emit("complete",true);
                    this.completeTask = undefined;
                    this.bpmnVisible = false;
                })
                .catch(()=> {
                    this.$emit("input",false);
                });
        },
        accountSearch(e){
            if(e){
                this.$http.post(`/api/task/accounts?keyword=${e}`)
                    .then(res=>{
                        this.modal.accounts = res.data.map(item=>{return {value:item.id,text:item.username}});
                    });
            }
        },
        accountChange(){
            this.modal.accountId = undefined
        },
        accountSelected(e){
            this.modal.accountId = e
        },
        modalOk(){
            this.modal.visible = false;
            this.modal.callback();
        },
        toFunction(script,props){
            if(script){
                const interpreter = new Interpreter({props,console});
                return interpreter.evaluate(`(${script})`);
            }
            return undefined;
        }
    },
    mounted() {
    }
}
</script>

<style scoped lang="less">
</style>

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
    <nk-card title="模拟器">
        <div style="display: flex">
            <div style="width: 50%">
                <div style="font-weight: 600;margin-bottom: 15px;text-align: right;width: 94px;font-size: 1.1em;">Inputs</div>
                <nk-form :col="1" :edit="edit">
                    <nk-form-item title="决策">
                        {{selectedDecision}}
                        <a-select slot="edit" size="small" v-model="selectedDecision" @change="decisionChange">
                            <a-select-option v-for="item in decisions" :key="item.id">
                                {{item.name || '&lt;Unnamed&gt;'}}
                            </a-select-option>
                        </a-select>
                    </nk-form-item>

                    <template v-for="(item) in inputs">
                        <nk-form-divider :key="item.decisionId" :term="item.decisionName" />
                        <nk-form-item    :key="item.decisionId+'-'+i.key" :title="i.name || '&lt;Unnamed&gt;'" v-for="(i) in item.items">
                            {{inputVariables[i.key]}}
                            <a-input-group slot="edit" compact size="small">
                                <a-select style="width: 30%" size="small" v-model="i.type" @change="changed($event,i.key,i)">
                                    <a-select-option value="string">string</a-select-option>
                                    <a-select-option value="integer">integer</a-select-option>
                                    <a-select-option value="long">long</a-select-option>
                                    <a-select-option value="double">double</a-select-option>
                                    <a-select-option value="boolean">boolean</a-select-option>
                                    <a-select-option value="date">date</a-select-option>
                                </a-select>
                                <a-input-number size="small" v-if="i.type==='integer'||i.type==='long'" style="width: 70%" :placeholder="i.key" v-model="inputVariables[i.key]" :precision="0"></a-input-number>
                                <a-input-number size="small" v-else-if="i.type==='double'"              style="width: 70%" :placeholder="i.key" v-model="inputVariables[i.key]" :precision="2" :step="0.01"></a-input-number>
                                <nk-a-date-picker            v-else-if="i.type==='date'"                style="width: 70%" :placeholder="i.key" v-model="inputVariables[i.key]" ></nk-a-date-picker>
                                <a-select size="small"       v-else-if="i.type==='boolean'"             style="width: 70%" :placeholder="i.key" v-model="i[i.key+'_boolean']" @change="inputVariables[i.key]=$event==='true'">
                                    <a-select-option value="false" >false</a-select-option>
                                    <a-select-option value="true"  >true</a-select-option>
                                </a-select>
                                <a-input size="small"        v-else                                     style="width: 70%" :placeholder="i.key" v-model="inputVariables[i.key]"></a-input>
                            </a-input-group>
                        </nk-form-item>
                    </template>
                </nk-form>
            </div>
            <div style="width: 50%">
                <div style="font-weight: 600;margin-bottom: 15px;text-align: right;width: 94px;font-size: 1.1em;">Outputs</div>
                <nk-form :col="1">
                    <template v-for="(item) in outputs">
                        <nk-form-divider :key="item.decisionId" :term="item.decisionName" />
                        <nk-form-item    :key="item.decisionId+'-'+index" :title="item.label || '&lt;Unnamed&gt;'" v-for="(item,index) in item.items">
                            <div style="height:24px;line-height:22px;background-color:#f3f3f3 ; padding:0 5px;border:1px solid #d9d9d9;border-radius: 5px;">
                                <span v-if="outputVariables[item.decisionId+'-'+item.name]">{{outputVariables[item.decisionId+'-'+item.name]}}</span>
                                <span style="color: #aaa;" v-else>{{item.decisionId+'&lt;'+item.typeRef+'&gt;'}}</span>
                            </div>
                        </nk-form-item>
                    </template>
                </nk-form>
            </div>
        </div>
        <div slot="actions" style="text-align: right;margin-right: 26px;">
            <a-button @click="run">Run</a-button>
        </div>
    </nk-card>
</template>

<script>
import dmnParser from "@/modules/task/ref/dmnParser";

export default {
    name: "NkDefDmnTestCard",
    props:{
        edit:{
            type:Boolean,
            default:true,
        },
        modeler:Object,
        xml: {}
    },
    data(){
        return {
            decisions:[],
            inputs: [],
            outputs: [],
            inputVariables: {},
            outputVariables: {},
            selectedDecision: undefined,
        }
    },
    created() {
    },
    methods:{
        decisionChange(e){
            try{
                const desc = dmnParser(this.modeler,e);
                this.selectedDecision = desc.id;
                this.decisions = desc.decisions;
                this.inputs = desc.inputs;
                this.outputs = desc.outputs;
                this.inputVariables = {};
                this.outputVariables = {};
                this.$emit("decision-change",this.selectedDecision);
            }catch (e){
                this.$message.error(e)
            }
        },
        run(){
            this.xml().then(({xml})=>{
                this.$http.postJSON("/api/def/dmn/run",{
                    decisionKey: this.selectedDecision,
                    xml,
                    variables: this.inputVariables
                }).then((res)=>{

                    let outputMatchedRules = {};
                    let outputVariables = {};
                    for(let decisionKey in res.data){
                        if(res.data.hasOwnProperty(decisionKey)){
                            const decisionExecuted = res.data[decisionKey];
                            decisionExecuted.result.forEach(item=>{
                                for(let key in item){
                                    if(item.hasOwnProperty(key)) {
                                        const k = decisionKey + '-' + key;
                                        if(!outputVariables[k]){
                                            outputVariables[k] = [item[key]];
                                        }else{
                                            outputVariables[k].push(item[key]);
                                        }
                                    }
                                }
                            })
                            outputMatchedRules[decisionKey] = decisionExecuted.matchedRules;
                        }
                    }

                    for(let k in outputVariables){
                        if(outputVariables.hasOwnProperty(k)){
                            outputVariables[k] = outputVariables[k].join(',');
                        }
                    }

                    this.outputVariables = outputVariables
                    this.loading = false;

                    this.$emit("run",{outputMatchedRules})
                });
            });

        },
        changed(e,key,i){
            if(e==='boolean'){
                this.$set(this.inputVariables,key,false);
                this.$set(i,key+'_boolean',"false");
            }else{
                this.$set(this.inputVariables,key,null);
            }
        }
    }
}
</script>

<style scoped>

</style>
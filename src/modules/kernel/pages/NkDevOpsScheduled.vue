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
    <nk-page-layout title="计划管理" sub-title="管理计划任务" :loading="loading">

        <a-layout>
            <a-layout-sider theme="light" bordered width="300">
                <a-list item-layout="horizontal" :data-source="jobs" class="filter">
                    <a-input slot="header" placeholder="filter..." style="border: none" allow-clear v-model="filter"></a-input>
                    <a-list-item slot="renderItem"
                                 slot-scope="i"
                                 @click="itemClick(i)"
                                 :class="i===item?'selected':''">

                        <div>
                            <label style="display: block;font-size: 12px;margin-bottom: 5px;">{{i.key.name}}</label>
                            <span style="color: #aaa">{{i.description}}</span>
                        </div>
                    </a-list-item>
                </a-list>
            </a-layout-sider>
            <a-layout-content>
                <nk-card class="card" title="执行任务" style="margin-left: 20px;">
                    <a-button slot="extra" size="small" type="primary" @click="execute">运行</a-button>
                    <a-textarea v-model="options" placeholder="运行参数" :rows="3"></a-textarea>
                </nk-card>

                <nk-card class="card" title="添加计划" style="margin-left: 20px;">
                    <nk-form :col="1">
                        <nk-form-item :width="140" title="name">
                            <a-input size="small" v-model="trigger.name"></a-input>
                        </nk-form-item>
                        <nk-form-item :width="140" title="cron">
<!--                            <a-input size="small" v-model="trigger.cron"></a-input>-->
                            <div style="display: flex">
                                <a-input size="small" addon-after="秒" style="width: 16%" v-model="trigger.s" placeholder="秒"></a-input>
                                <a-input size="small" addon-after="分" style="width: 16%" v-model="trigger.m" placeholder="分"></a-input>
                                <a-input size="small" addon-after="时" style="width: 16%" v-model="trigger.h" placeholder="时"></a-input>
                                <a-input size="small" addon-after="日" style="width: 16%" v-model="trigger.d" placeholder="日"></a-input>
                                <a-input size="small" addon-after="月" style="width: 16%" v-model="trigger.M" placeholder="月"></a-input>
                                <a-input size="small" addon-before="星期" style="width: 20%" v-model="trigger.w" placeholder="星期"></a-input>
                            </div>
                        </nk-form-item>
                    </nk-form>
                    <a-button slot="extra" type="primary" size="small" @click="addTrigger" :disabled="(!trigger.name || !cron)">添加计划</a-button>
                </nk-card>
                <a-list v-if="jobDetail" item-layout="horizontal" :data-source="jobDetail.triggers" style="margin-left: 20px;"  :rowKey="rowKey">
                    <div slot="header" style="padding: 2px 14px;">执行计划</div>
                    <a-list-item slot="renderItem" slot-scope="t">
                        <nk-form :col="1">
                            <nk-form-item    :width="180" title="name" >{{t.key.name}}</nk-form-item>
                            <nk-form-item    :width="180" title="startTime">{{t.startTime | nkDatetimeISO}}</nk-form-item>
                            <nk-form-item    :width="180" title="previousFireTime">{{t.previousFireTime | nkDatetimeISO}}</nk-form-item>
                            <nk-form-item    :width="180" title="nextFireTime">{{t.nextFireTime | nkDatetimeISO}}</nk-form-item>
                            <nk-form-item    :width="180" title="cronExpression" v-if="t.cronExpression">
                                {{t.cronExpression}} <a-button v-if="t.expressionSummary&&!t.expressionSummary2" type="link" size="small" @click="$set(t,'expressionSummary2',t.expressionSummary)">解读</a-button>
                                <pre v-if="t.expressionSummary2">{{t.expressionSummary2}}</pre>
                            </nk-form-item>
                        </nk-form>
                        <div slot="extra" style="border-left: dashed 1px #ccc;height:100px;display: flex;align-items: center;">
                            <a-popconfirm @confirm="removeTrigger(t)" title="确认移除计划？" placement="topRight">
                                <a-button type="link" >移除计划</a-button>
                            </a-popconfirm>
                        </div>
                    </a-list-item>
                </a-list>
            </a-layout-content>
        </a-layout>

    </nk-page-layout>
</template>

<script>
    const defaultTrigger = {
        name: undefined,
        s:'0',
        m:'*',
        h:'*',
        d:'*',
        M:'*',
        w:'?',
    };
    import qs from 'qs';
    export default {
        data() {
            return {
                loading:false,
                filter:undefined,
                jobs:[],
                item:{},
                jobDetail:undefined,
                options:undefined,
                trigger:Object.assign({},defaultTrigger)
            }
        },
        computed:{
            cron(){
                if(this.trigger.s&&this.trigger.m&&this.trigger.h&&this.trigger.d&&this.trigger.M&&this.trigger.w){
                    return [this.trigger.s,this.trigger.m,this.trigger.h,this.trigger.d,this.trigger.M,this.trigger.w].join(' ');
                }
                return undefined;
            }
        },
        created() {
            this.loading=true;
            this.$http.get('/api/ops/scheduled/jobs')
                .then((res)=>{
                    this.jobs = res.data;
                    if(this.jobs[0]){
                        this.itemClick(this.jobs[0]);
                    }
                })
        },
        methods: {
            itemClick(i){
                this.loading=true;
                this.item = i;
                this.$http.get(`/api/ops/scheduled/job/${i.key.group}/${i.key.name}`)
                    .then((res)=>{
                        this.jobDetail = res.data;
                        this.loading=false;
                    })
            },
            execute(){
                this.loading=true;
                this.$http.postJSON(`/api/ops/scheduled/execute/${this.item.key.group}/${this.item.key.name}`,this.options||'')
                    .then(()=>{
                        this.options = undefined;
                        this.$notification.info({
                            message:"提示",
                            description:"任务已提交"
                        });
                        this.loading=false;
                    })
            },
            addTrigger(){
                this.loading=true;
                this.$http.post(`/api/ops/scheduled/trigger/add/${this.item.key.group}/${this.item.key.name}`,qs.stringify({
                    name:this.trigger.name,
                    cron:this.cron
                })).then(()=>{
                    this.trigger = Object.assign({},defaultTrigger);
                    this.itemClick(this.item);
                })
            },
            removeTrigger(trigger){
                this.loading=true;
                this.$http.post(`/api/ops/scheduled/trigger/remove`,qs.stringify(trigger.key))
                    .then(()=>{
                        this.itemClick(this.item);
                    })
            },
            rowKey(e){
                return e.key
            }
        }
    }
</script>

<style scoped lang="less">
</style>

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
    <nk-page-layout title="计划管理" sub-title="管理计划任务">

        <a-layout>
            <a-layout-sider theme="light" bordered width="300">
                <a-list item-layout="horizontal" :data-source="jobs" class="filter">
                    <a-input slot="header" placeholder="filter..." style="border: none" allow-clear v-model="filter"></a-input>
                    <a-list-item slot="renderItem"
                                 slot-scope="i"
                                 @click="itemClick(i)"
                                 :class="i===item?'selected':''">

                        <div>
                            <label style="display: block;font-size: 12px;margin-bottom: 5px;">{{i.name}}</label>
                            <span style="color: #aaa">{{i.group}}</span>
                        </div>
                    </a-list-item>
                </a-list>
            </a-layout-sider>
            <a-layout-content>
                <nk-card class="card" title="计划详情" style="margin-left: 20px;">

                    <a-button slot="extra" size="small" type="primary" @click="execute">运行</a-button>

                    <a-textarea v-model="options" placeholder="运行参数" :rows="3"></a-textarea>

                    <nk-form v-if="jobDetail" :col="1">
                        <template v-for="(trigger,index) in jobDetail.triggers">
                            <nk-form-divider :key="'a'+index" :title="trigger.key.name" ></nk-form-divider>
                            <nk-form-item    :key="'b'+index" :width="140" title="startTime">{{trigger.startTime | nkDatetimeISO}}</nk-form-item>
                            <nk-form-item    :key="'c'+index" :width="140" title="previousFireTime">{{trigger.previousFireTime | nkDatetimeISO}}</nk-form-item>
                            <nk-form-item    :key="'d'+index" :width="140" title="nextFireTime">{{trigger.nextFireTime | nkDatetimeISO}}</nk-form-item>
                            <nk-form-item    :key="'e'+index" :width="140" title="cronExpression" v-if="trigger.cronExpression">{{trigger.cronExpression}}</nk-form-item>
                            <nk-form-item    :key="'f'+index" :width="140" title="expressionSummary" v-if="trigger.cronExpression"><pre>{{trigger.expressionSummary}}</pre></nk-form-item>
                        </template>
                    </nk-form>

                </nk-card>
            </a-layout-content>
        </a-layout>

    </nk-page-layout>
</template>

<script>

    export default {
        data() {
            return {
                filter:undefined,
                jobs:[],
                item:{},
                jobDetail:undefined,
                options:undefined
            }
        },
        created() {
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
                this.item = i;
                this.$http.get(`/api/ops/scheduled/job/${i.group}/${i.name}`)
                    .then((res)=>{
                        this.jobDetail = res.data;
                    })
            },
            execute(){
                this.$http.postJSON(`/api/ops/scheduled/execute/${this.item.group}/${this.item.name}`,this.options||'')
                    .then(()=>{
                        this.options = undefined;
                        this.$notification.info({
                            message:"提示",
                            description:"任务已提交"
                        });
                    })
            }
        }
    }
</script>

<style scoped lang="less">
</style>

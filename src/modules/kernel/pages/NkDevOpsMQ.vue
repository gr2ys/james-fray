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
    <nk-page-layout title="消息队列" sub-title="管理消息队列" :loading="loading">

        <a-layout>
            <a-layout-sider theme="light" bordered width="300">
                <a-list item-layout="horizontal" :data-source="queues">
                    <div slot="header">队列</div>
<!--                    <a-input slot="header" placeholder="filter..." style="border: none" allow-clear v-model="filter"></a-input>-->
                    <a-list-item slot="renderItem"
                                 slot-scope="i"
                                 @click="itemClick(i)"
                                 :class="i===selected?'selected':''">
                        {{i.name}}
                    </a-list-item>
                </a-list>
            </a-layout-sider>
            <a-layout-content>
                <nk-card class="card" title="队列详情" style="margin-left: 20px;">
                    <nk-form :col="1" v-if="selected">
                        <nk-form-item :width="180" title="vhost">{{selected.vhost}}</nk-form-item>
                        <nk-form-item :width="180" title="name">{{selected.name}}</nk-form-item>
                        <nk-form-item :width="180" title="x-dead-letter-exchange" v-if="selected.arguments['x-dead-letter-exchange']">{{selected.arguments['x-dead-letter-exchange']}}</nk-form-item>
                        <nk-form-item :width="180" title="x-dead-letter-routing-key" v-if="selected.arguments['x-dead-letter-routing-key']">{{selected.arguments['x-dead-letter-routing-key']}}</nk-form-item>
                        <nk-form-item :width="180" title="message_total">{{messages&&messages[0]?(messages[0].message_count+1):0}}</nk-form-item>
                    </nk-form>
                    <div style="margin-top: 10px;text-align: right;">
                        <a-textarea v-model="payload" placeholder="payload" :rows="3"></a-textarea>
                        <a-button @click="send" type="link" style="">投递</a-button>
                    </div>
                </nk-card>

                <a-list item-layout="horizontal" :data-source="messages" style="margin-left: 20px;">
                    <div slot="header">消息列表</div>
                    <a-list-item slot="renderItem"
                                 slot-scope="i, index">
                        <nk-form :col="1">
                            <nk-form-item :width="180" title="message_count">{{i.message_count}}</nk-form-item>
                            <nk-form-item :width="180" title="headers">
                                <nk-form :col="1">
                                    <nk-form-item :width="180" title="x-first-death-exchange" v-if="i.properties.headers['x-first-death-exchange']">
                                        {{i.properties.headers['x-first-death-exchange']}}
                                    </nk-form-item>
                                    <nk-form-item :width="180" title="x-first-death-queue" v-if="i.properties.headers['x-first-death-queue']">
                                        {{i.properties.headers['x-first-death-queue']}}
                                    </nk-form-item>
                                </nk-form>
                            </nk-form-item>
                            <nk-form-item :width="180" title="routing_key">{{i.routing_key}}</nk-form-item>
                            <nk-form-item :width="180" title="payload">{{i.payload}}</nk-form-item>
                        </nk-form>
                        <div v-if="index===0
                        && i.properties.headers
                        && i.properties.headers['x-first-death-queue']" slot="extra" style="border-left: dashed 1px #ccc;">
                            <a-button type="link" style="height: 100px;" @click="resume">重新投递</a-button>
                        </div>
                    </a-list-item>
                </a-list>
            </a-layout-content>
        </a-layout>

    </nk-page-layout>
</template>

<script>

    export default {
        data() {
            return {
                loading:false,
                filter:undefined,
                queues:[],
                selected:undefined,
                messages:undefined,
                payload:undefined,
            }
        },
        created() {
            this.loading=true
            this.$http.get('/api/ops/mq/queues')
                .then((res)=>{
                    this.queues = res.data;
                    if(this.queues[0]){
                        this.itemClick(this.queues[0]);
                    }else{
                        this.loading=false
                    }
                })
        },
        methods: {
            itemClick(i){
                this.loading=true
                this.selected = i;
                this.$http.get(`/api/ops/mq/queues/${i.name}/get`)
                    .then((res)=>{
                        this.messages = res.data;
                        this.loading=false
                    })
            },
            resume(){
                this.loading=true
                this.$http.post(`/api/ops/mq/queues/${this.selected.name}/resume`)
                    .then(()=>{
                        this.itemClick(this.selected);
                    })
            },
            send(){
                this.loading=true
                this.$http.postJSON(`/api/ops/mq/queues/${this.selected.name}/send`,this.payload)
                    .then(()=>{
                        this.payload = undefined;
                        this.itemClick(this.selected);
                    })
            }
        }
    }
</script>

<style scoped lang="less">
</style>

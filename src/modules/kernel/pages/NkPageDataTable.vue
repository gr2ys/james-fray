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
    <nk-query-layout
        ref="layout"
        :title="custom.title"
        :sub-title="custom.subTitle"
        :search-items-default="custom.searchItemsDefault"
        :search-items-more-def="custom.searchItemsMoreDef"
        :dataTableColumns="custom.columns"
        :save-as-source="$route.params.id"
        :init-rows="custom.defaultRows"
        :border="custom.border"
        :sortConfig="custom.sortConfig"
        :exportConfig="custom.exportConfig"
        :lazy="true"
        :selectable="false"
        @change="search"
        @exportExcel="exportExcel"
        @suggest="suggest"
        @click="selected"
        @setTab="$emit('setTab',$event)"
    >
        <a-button  slot="action"
                   type="primary"
                   v-if="creatableFilter && creatableFilter.length===1"
                   @click="createDoc(creatableFilter[0])">{{creatableFilter[0].docName}}</a-button>
        <a-button-group slot="action" v-else-if="creatableFilter && creatableFilter.length">
            <a-dropdown :trigger="['click']">
                <a-menu slot="overlay" >
                    <a-menu-item v-for="docDef in creatableFilter" :key="docDef.docType" @click="createDoc(docDef)">
                        <a-icon type="file" />{{docDef.docName}}
                    </a-menu-item>
                </a-menu>
                <a-button type="primary"> 新建 <a-icon type="down" /> </a-button>
            </a-dropdown>
        </a-button-group>

        <transition name="slide-fade">
            <nk-page-preview :params="previewParams" v-if="previewVisible" @close="previewClose" @to="to"></nk-page-preview>
        </transition>
        <iframe ref="download" style="display: none"></iframe>
    </nk-query-layout>
</template>

<script>
import NkPagePreview from "../../docengine/page/NkPagePreview";
import {mapMutations,mapGetters} from "vuex";
import NkUtil from "@/utils/NkUtil";
import moment from 'moment';

export default {
    components: {NkPagePreview},
    data(){
        return {

            custom:{},

            previewParams: {},
            previewVisible: false,

            params:undefined,
        }
    },
    created(){
        this.loadCustom();
    },
    computed:{
        ...mapGetters('User',[
            'user'
        ]),
        creatableFilter(){
            return this.custom.creatable && this.custom.creatable.filter(item=>{
                return this.user.authorities
                    .find(authority=>
                        authority.authority==='@'+item.docType+':WRITE'||
                        authority.authority==='@'+item.docType+':*'||
                        authority.authority==='@*:*'||
                        authority.authority==='*:*')
            })
        }
    },
    methods:{
        ...mapMutations('UI',['doLoading']),
        loadCustom(){
            this.$http.get(`/api/webapp/menu/${this.$route.params.id}`)
                .then(res=>{
                    this.custom = Object.assign({
                        title:"自定义查询报表",
                        subTitle:"",
                        $debug:false,
                        index:"document",
                        postSql:undefined,
                        postCondition:undefined,
                        searchItemsDefault:[],
                        searchItemsMoreDef:[],
                        defaultRows:10,
                        columns:[],
                        sortConfig:undefined,
                        border:undefined,
                        creatable:undefined,
                    },NkUtil.parseJSON(res.data));
                    this.$emit("setTab",this.custom.title);

                    this.$nextTick(()=>{
                        this.$refs.layout.init();
                    })

                    this.$emit("setTab",this.custom.title);

                }).catch((e)=>{
                    console.error(e);
                    this.$error({
                        title: '初始化失败',
                        content: '自定义的选项错误！',
                    });
                });
        },
        suggest(params){
            if(!this.custom.postSql){
                this.$http.postJSON(`/api/doc/suggest/${this.custom.index}`,Object.assign({
                        postCondition: this.custom.postCondition,
                        $debug: this.custom.$debug,
                    },params)
                ).then((res)=>{
                    if(this.$refs.layout){
                        this.$refs.layout.setSuggest(res.data.suggests)
                    }
                });
            }
        },
        search(params){

            this.params = params;

            if(this.custom.postSql){
                this.$http.postJSON(`/api/data/analyse/query`,Object.assign({
                        sqlList: (this.custom.postSql instanceof Array) ? this.custom.postSql : [this.custom.postSql],
                        $debug: this.custom.$debug,
                    },params)
                ).then((res)=>{
                    if(this.$refs.layout)
                        this.$refs.layout.setData(res.data)
                });
            }else{
                this.$http.postJSON(`/api/doc/list/${this.custom.index}`,Object.assign({
                            postCondition: this.custom.postCondition,
                            $debug: this.custom.$debug,
                        },params)
                ).then((res)=>{
                    if(this.$refs.layout)
                        this.$refs.layout.setData(res.data)
                });
            }
        },
        exportExcel(params){
            this.params = params;

            if(this.custom.postSql){
                this.$http.postJSON(`/api/data/analyse/export`,Object.assign({
                        sqlList: (this.custom.postSql instanceof Array) ? this.custom.postSql : [this.custom.postSql],
                        $debug: this.custom.$debug,
                        columns: this.custom.columns
                    },params)
                ).then((res)=>{
                    const fileName = this.custom.title +"_" + moment().format("YYYY-MM-DD");
                    this.$notification.info({
                        duration: 10,
                        message: '提示',
                        description:`准备下载"${fileName}.xlsx"`
                    })
                    this.$refs.download.setAttribute("src",`/api/data/analyse/download/${res.data}/${fileName}?${new Date().getTime()}`);
                }).finally(()=>{
                    if(this.$refs.layout)
                        this.$refs.layout.setExportDown()
                })
            }else{
                this.$http.postJSON(`/api/doc/export/${this.custom.index}`,Object.assign({
                        postCondition: this.custom.postCondition,
                        $debug: this.custom.$debug,
                        columns: this.custom.columns
                    },params)
                ).then((res)=>{
                    const fileName = this.custom.title +"_" + moment().format("YYYY-MM-DD");
                    this.$notification.info({
                        duration: 10,
                        message: '提示',
                        description:`准备下载"${fileName}.xlsx"`
                    })
                    this.$refs.download.setAttribute("src",`/api/doc/download/${res.data}/${fileName}?${new Date().getTime()}`);
                }).finally(()=>{
                    if(this.$refs.layout)
                        this.$refs.layout.setExportDown()
                })
            }
        },
        selected({row,$event}){
            if($event.target.tagName!=='A'){
                this.previewVisible = true;
                this.previewParams  = {
                    mode: "detail",
                    docId:row.docId,
                    row
                }
            }
        },
        nk$hide(){
            this.previewVisible = false;
        },
        to(e){
            let row = this.previewParams.row;
            this.previewParams = undefined
            this.$nextTick(()=>{
                const index = this.$refs.layout.page.list.indexOf(row)
                row   = this.$refs.layout.page.list[index+e]
                if(row){
                    this.previewParams = {
                        mode: "detail",
                        docId: row.docId,
                        row
                    }
                }else{
                    this.previewVisible = false;
                }
            })
        },
        previewClose(){
            this.previewVisible = false;
            this.$refs.layout.grid().clearCurrentRow();
        },
        createDoc(def){
            this.$router.push(`/apps/docs/create/`+def.docType);
        }
    }
}
</script>

<style lang="less" scoped>
</style>

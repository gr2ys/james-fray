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
    <nk-page-layout :title="def.docType || '模型'" :sub-title="def.docName" :spinning="loading">

        <div slot="top" v-if="def.debug" style="padding: 10px 10px 0 10px;">
            <a-alert message="单据配置正在调试" type="warning" show-icon />
        </div>

        <div slot="action">
            <a-button-group>
                <a-tooltip title="调试">
                    <a-button type="primary" @click="doRun"       :disabled="!debugId || def.state!=='InActive'" >
                        <a-icon type="play-circle" />
                    </a-button>
                </a-tooltip>
                <a-tooltip title="停止">
                    <a-button @click="doStop"                      :disabled="!def.debug" >
                        <a-icon type="border" />
                    </a-button>
                </a-tooltip>
                <a-tooltip title="激活">
                    <a-button type="danger"  @click="doActive"    :disabled="isCreate || def.state!=='InActive'" >
                        <a-icon type="exclamation-circle" />
                    </a-button>
                </a-tooltip>
                <a-tooltip title="编辑">
                    <a-button                @click="doEdit"      :disabled="editMode || def.state!=='InActive'">
                        <a-icon type="edit" />
                    </a-button>
                </a-tooltip>
                <a-tooltip title="保存">
                    <a-button                @click="doUpdate"    :disabled="!editMode || def.debug"            >
                        <a-icon type="save" />
                    </a-button>
                </a-tooltip>
                <a-dropdown :trigger="['click']" placement="bottomRight">
                    <a-menu slot="overlay" @click="handleMenuClick">
                        <a-menu-item key="doBreach" :disabled="isCreate">
                            <a-icon type="branches" /> 新版本
                        </a-menu-item>
                        <a-menu-item key="doCopy" :disabled="isCreate">
                            <a-icon type="copy" /> 复制为新类型
                        </a-menu-item>
                        <a-menu-item key="doDelete" :disabled="isCreate">
                            <a-icon type="delete" /> 删除
                        </a-menu-item>
                        <a-menu-item key="doRandom" :disabled="!(def.debug || def.state==='Active')">
                            <a-icon type="robot" /> 生成随机数据
                        </a-menu-item>
                    </a-menu>
                    <a-button><a-icon type="ellipsis" /></a-button>
                </a-dropdown>
            </a-button-group>
        </div>
        <a-layout>
            <a-layout-sider bordered theme="light">
                <a-list item-layout="horizontal" :data-source="defaultCards">
                    <a-list-item slot="renderItem"
                                 slot-scope="i"
                                 @click="menuClick(i)"
                                 :class="i===selected?'selected':''">
                        {{i.name}}
                    </a-list-item>
                </a-list>
                <a-list v-if="def.cards&&def.cards.length" item-layout="horizontal" :data-source="def.cards" style="margin-top: 2px">
                    <a-list-item slot="renderItem"
                                 slot-scope="i"
                                 @click="menuClick(i)"
                                 :class="i===selected?'selected':''">
                        {{i.cardName || '未命名卡片'}}
                    </a-list-item>
                </a-list>
                <a-list item-layout="horizontal" :data-source="histories" style="margin-top: 2px">
                    <div slot="header">
                        <a @click="menuClick(historiesListMenu)" style="color: rgba(0, 0, 0, 0.85)">
                            版本记录
                        </a>
                        <a @click="openDefTree">Graph</a>
                    </div>
                    <div slot="footer" style="text-align: center;color: #999;cursor: pointer;">
                        查看全部
                    </div>
                    <a-list-item slot="renderItem"
                                 slot-scope="i"
                                 :class="{'history-item':true,active:i.version===def.version}"
                                 @click="toVersion(i)">
                            <div>
                                <div>
                                    <a-tag v-if="i.state==='Active'"   color="green"  class="version-tag">{{i.state.charAt(0)}}</a-tag>
                                    <a-tag v-if="i.state==='InActive'" color="orange" class="version-tag">{{i.state.charAt(0)}}</a-tag>
                                    <a-tag v-if="i.state==='History'"  class="version-tag">{{i.state.charAt(0)}}</a-tag>
                                    <span v-if="i.versionDesc">{{i.versionDesc}}</span>
                                    <span v-else>{{i.version | formatVersion}}</span>
                                </div>
                                <a v-if="def.version!==i.version" class="diff" @click="diffVersion(i,$event)">Diff</a>
                            </div>
                    </a-list-item>
                </a-list>
            </a-layout-sider>
            <a-layout-content style="padding-left: 20px;padding-bottom: 100px;">
                <component
                           v-for="(item,index) in selected.defComponentNames"
                           :key="index"
                           :is="item"
                           :doc-def="def"
                           :card-key="selected.cardKey"
                           :doc-options="options"
                           :edit-mode="editMode"
                           @replace="$emit('replace',$event)"
                           @diff="diffVersion"
                />
                <a-card v-if="selected.beanName" title="文档"
                        :key="'document-'+selected.cardKey"
                        class="doc">
                    <a slot="extra" v-if="editMode" @click="mavonEdit = true" style="font-size: 12px;">编辑</a>
                    <div @click="mavonEdit = editMode">
                        <nk-empty v-if="!mavonEdit && !selected.markdown" :data="selected.markdown" style="margin: 40px 0;"></nk-empty>
                        <mavon-editor v-else
                                      v-model="selected.markdown"
                                      :subfield="false"
                                      :toolbarsFlag="mavonEdit"
                                      :defaultOpen="mavonEdit?'edit':'preview'"
                                      :toolbars="markdownOption"
                                      style="min-height: 360px;box-shadow:none;"
                                      :style="mavonEdit?'':'box-shadow:none;'"
                                      @click="mavonEdit=true"
                        />
                    </div>
                </a-card>
                <a-card v-if="selected.beanName" title="信息" :key="'base-'+selected.cardKey">
                    <nk-form :col="2">
                        <nk-form-item title="KEY">
                            {{selected.cardKey}}
                        </nk-form-item>
                        <nk-form-item title="逻辑对象">
                            <nk-script-label :value="selected.beanName"></nk-script-label>
                        </nk-form-item>
                        <nk-form-item title="计算次数">
                            {{selected.calcTimes}}
                        </nk-form-item>
                        <nk-form-item title="计算顺序">
                            {{selected.calcOrder}}
                        </nk-form-item>
                        <nk-form-item title="编辑条件">
                            {{selected.editableSpEL}}
                        </nk-form-item>
                        <nk-form-item title="显示条件">
                            {{selected.visibleSpEL}}
                        </nk-form-item>
                    </nk-form>
                </a-card>
            </a-layout-content>
        </a-layout>
        <a-modal v-model="visibleCreateRandom" centered title="请输入生成的单据数量" @ok="doRandom" width="320px" :confirm-loading="createRandomLoading">
            <a-input-number v-model="createRandomCount" placeholder="请输入生成的单据数量" style="width:100%"></a-input-number>
        </a-modal>

        <a-modal v-model="visibleDiff" centered width="80%" :dialogStyle="{'margin-top':'20px','max-height':'100%'}"
                 :destroyOnClose="true">
            <template slot="title">
                <div style="display: flex; justify-content: space-between">
                    <span>版本对比</span>
                    <a-radio-group v-model="diffMode" size="small" button-style="solid" style="margin-right: 20px;">
                        <a-radio-button value="unified">
                            Unified
                        </a-radio-button>
                        <a-radio-button value="split">
                            Split
                        </a-radio-button>
                    </a-radio-group>
                </div>
            </template>
            <a-skeleton :loading="!diff">
                <nk-diff v-if="diff"  :data="diff" :mode="diffMode" style="height: calc(100vh - 190px)" />
            </a-skeleton>
            <template slot="footer">
                <a-button key="back" type="primary" @click="visibleDiff=false">
                    关闭
                </a-button>
            </template>
        </a-modal>

        <a-modal v-model="visibleActiveDiff" centered width="80%"
                 :closable="false"
                 :destroyOnClose="true"
                 :maskClosable="false"
                 :ok-text="versionConflict?'版本冲突已确认无误，继续激活':'确定激活'"
                 @ok="doConfirmActive"
                 :confirm-loading="confirmLoadingActive"
                 :cancelButtonProps="{props:{disabled:confirmLoadingActive}}"
                 :okButtonProps="{props:{
                     disabled:!(def.versionDesc && def.versionDesc.trim()),
                     type:versionConflict?'danger':'primary'
                 }}"
        >
            <template slot="title" v-if="versionConflict">
                <a-icon type="exclamation-circle" />
                版本冲突，请确认
            </template>
            <template slot="title" v-else>
                激活版本
            </template>
            <a-skeleton :loading="!diff">
                <nk-diff v-if="diff" :data="diff" mode="split" :mergeable="true" @change="diffChange" style="height: calc(100vh - 270px)"  />
            </a-skeleton>
            <a-textarea placeholder="请输入版本描述" style="height: 80px;" v-model="def.versionDesc"></a-textarea>
        </a-modal>


        <a-modal v-model="visibleDefTree" centered width="80%" title="版本历史"
                 :destroyOnClose="true"
        >
            <nk-doc-def-tree v-if="historiesRoot" :data="historiesRoot" @g-click="gClick"></nk-doc-def-tree>
            <template slot="footer">
                <a-button key="back" type="primary" @click="visibleDefTree=false">
                    关闭
                </a-button>
            </template>
        </a-modal>
    </nk-page-layout>
</template>

<script>
import NkDefDocTypeBase from "./NkDefDocTypeBase";
import NkDefDocTypeCloud from "./NkDefDocTypeCloud";
import NkDefDocTypeStatus from "./NkDefDocTypeStatus";
import NkDefDocTypeHelpDoc from "./NkDefDocTypeHelpDoc";
import NkDefDocTypeBizFlow from "./NkDefDocTypeBizFlow";
import NkDefDocTypeCycle from "./NkDefDocTypeCycle";
import NkDefDocTypeIndex from "./NkDefDocTypeIndex";
import NkDefDocTypeDataSyncs from "./NkDefDocTypeDataSyncs";
import NkDefDocTypeBPM from "./NkDefDocTypeBPM";
import NkDefDocTypeCards from "./NkDefDocTypeCards";
import NkDefDocTypeHistories from "./NkDefDocTypeHistories";
import NkDocDefTree from "../components/NkDocDefTree";
import NkUtil from "../../../utils/NkUtil";
import {mapMutations, mapState} from "vuex";

import diffJson from "../components/docDefDiff";

const defaultCards = [
    {key:"doc",     name:"基本信息",    defComponentNames: [NkDefDocTypeBase,    NkDefDocTypeStatus,NkDefDocTypeHelpDoc]},
    {key:"cycle",   name:"业务逻辑",    defComponentNames: [NkDefDocTypeBizFlow, NkDefDocTypeCycle, NkDefDocTypeIndex]},
    {key:"bpm",     name:"审批流程",    defComponentNames: [NkDefDocTypeBPM,                        ]},
    {key:"cloud",   name:"云Cloud",    defComponentNames: [NkDefDocTypeCloud, NkDefDocTypeDataSyncs                      ]},
    {key:"cards",   name:"功能卡片",    defComponentNames: [NkDefDocTypeCards,                      ]},
];

const markdownOption = {
    bold: true, // 粗体
    italic: true, // 斜体
    header: true, // 标题
    underline: true, // 下划线
    strikethrough: true, // 中划线
    mark: true, // 标记
    superscript: true, // 上角标
    subscript: true, // 下角标
    quote: true, // 引用
    ol: true, // 有序列表
    ul: true, // 无序列表
    link: true, // 链接
    imagelink: true, // 图片链接
    code: true, // code
    table: true, // 表格
    fullscreen: true, // 全屏编辑
    readmodel: false, // 沉浸式阅读
    htmlcode: true, // 展示html源码
    help: true, // 帮助
    undo: true, // 上一步
    redo: true, // 下一步
    trash: false, // 清空
    save: false, // 保存（触发events中的save事件）
    navigation: false, // 导航目录
    alignleft: true, // 左对齐
    aligncenter: true, // 居中
    alignright: true, // 右对齐
    subfield: true, // 单双栏模式
    preview: false, // 预览
};

const diffDisabledPrefixes = [
    '  "updatedAccount"',
    '  "prevVersion"',
    '  "state"',
    '    "state"',
    '      "state"',
    '  "version": "',
    '    "version": "',
    '      "version": "',
    '  "versionDesc": "',
    '  "updatedTime": ',
    '    "updatedTime": ',
    '      "updatedTime": ',
    '  "createdTime": ',
];
const diffClear = line=>{
    if((line.added||line.removed) && line.value){
        let disabled = true;
        const items = line.value.split('\n');
        for(let j in items){
            if(items[j]){
                let itemDisabled = false;
                for(let i in diffDisabledPrefixes){
                    if(items[j].startsWith(diffDisabledPrefixes[i])){
                        itemDisabled = true;
                        break;
                    }
                }
                disabled = disabled&&itemDisabled;
            }
        }
        line.disabled = disabled;
    }
    return line;
}

export default {
    components:{
        NkDocDefTree
    },
    filters:{
        formatVersion : (v)=>{
          return v.substring(v.length-9,v.length);
        }
    },
    data(){
        return {
            isCreate: false,
            defaultCards,
            markdownOption,
            def:{
                docType: undefined,
                refObjectType:'',
                status:[{
                    docState:'S001',
                    docStateDesc:'新创建',
                    editPerm:1,
                    preDocState:'@',
                    refObjectType:''
                }],
                flows:[{
                    preDocType:'@',
                    preDocStatus:'@',
                    refObjectType:''
                }],
                cards:[],
                cardsDef:{},
                updatedTime: undefined,
                version: '',
                bpm:{},
                validFrom:'',
                validTo:'',
                state:'InActive'
            },

            loading:true,
            editMode:false,
            mavonEdit:false,
            routeParams: {},
            routeQueries:{},
            histories:[],
            historiesMore:true,
            options:{},
            selected: {},
            cards:[{
                key:"bpm",
                name:"审批流",
            },{
                key:"mapping",
                name:"数据映射",
            },{
                key:"index",
                name:"索引规则",
            },{
                key:"nkCardDate",
                name:"日期",
            },{
                key:"nkCardPartner",
                name:"交易伙伴",
            },{
                key:"nkCardPrice",
                name:"价格",
            },{
                key:"nkCardFlow",
                name:"交易历史",
            }],
            visibleCreateRandom:false,
            createRandomLoading:false,
            createRandomCount:10,

            visibleDiff:false,
            diff:undefined,
            diffMode: 'unified',
            diffMerged: undefined,

            visibleActiveDiff:false,
            confirmLoadingActive:false,
            versionConflict:false,

            visibleDefTree:false,
            historiesRoot:undefined,

            historiesListMenu:{defComponentNames:[NkDefDocTypeHistories]}
        }
    },
    computed:{
        ...mapState('Debug',[
            'debugId'
        ])
    },
    created() {
        this.routeParams = Object.assign({},this.$route.params);
        this.routeQueries = Object.assign({},this.$route.query);
        this.isCreate = this.routeParams.mode==='create';
        this.selected = this.defaultCards[0]||{};
    },
    mounted() {

        this.loading = true;
        let promises = [];
        //promises.push(this.$http.get(`/api/def/doc/type/options?classify=${this.def.docClassify||''}`));

        if(this.isCreate){
            if(this.routeQueries.fromType && this.routeQueries.fromVersion){
                promises.push(this.$http.get(`/api/def/doc/type/detail/${this.routeQueries.fromType}/${this.routeQueries.fromVersion}`));
            }
        }else{
            promises.push(this.$http.get(`/api/def/doc/type/detail/${this.routeParams.type}/${this.routeParams.version}`));
            promises.push(this.$http.get(`/api/def/doc/type/list/${this.routeParams.type}/1`));
        }

        Promise.all(promises)
            .then((res)=>{
                if(this.isCreate){
                    this.editMode = true;
                    this.$emit('setTab',`新建模型`);
                    if(res[0] && res[0].data){
                        this.def = res[0].data
                        this.def.docName = this.def.docName+'-副本';
                        this.def.docType = undefined;
                        this.def.version = undefined;
                        this.def.pervVersion = undefined;
                        this.def.updatedTime = undefined;
                        this.def.state = 'InActive';
                    }
                }else{
                    this.def = res[0].data;
                    this.histories = res[1].data;
                    this.historiesMore = res[1].data.length === 10;
                    this.editMode = this.def.state === 'InActive' || this.editMode;
                    this.$emit('setTab',`模型类型:${this.def.docType}`);
                }
                this.$http.get(`/api/def/doc/type/options?classify=${this.def.docClassify||''}`)
                    .then(res=>{
                        this.options = res.data;
                        this.loading = false;
                    });
            })
    },
    methods:{
        ...mapMutations('User',[
            'setReLogin'
        ]),
        init(){
        },
        menuClick(menu){
            this.mavonEdit = false;
            this.selected = menu;
        },
        doRun(){
            this.loading = true;
            this.$http.postJSON(`/api/def/doc/type/debug?run=true`,this.def)
                .then((res)=>{
                    if(this.isCreate){
                        this.$emit("replace",`/apps/def/doc/detail/${this.def.docType}/${res.data.version}`)
                    }else {
                        this.def = res.data;
                        this.$message.info("配置已运行")
                    }
                })
                .finally(()=>{
                    this.loading = false;
                })
        },
        doStop(){
            this.loading = true;
            this.$http.postJSON(`/api/def/doc/type/debug?run=false`,this.def)
                .then((res)=>{
                    this.def = res.data;
                    this.$message.info("配置已停止运行")
                })
                .finally(()=>{
                    this.loading = false;
                })
        },
        doDelete(force){
            this.loading = true;
            this.$http.postJSON(`/api/def/doc/type/delete${force&&'?force=true'||''}`,this.def)
                .then(()=>{
                    if(this.def.state==='Active'){
                        this.$emit("close");
                    }else{
                        this.$http.get(`/api/def/doc/type/detail/${this.def.docType}/@`)
                            .then(res=>{
                                this.$emit('replace',`/apps/def/doc/detail/${res.data.docType}/${res.data.version}`);
                                this.loading = false;
                            });
                    }
                })
                .catch(()=>{
                    this.loading = false;
                })
        },
        doForceDelete(){
            if(this.def.state==='Active'){
                let self = this;
                this.setReLogin({
                    callback(){
                        self.doDelete(true);
                    },
                    title:'安全确认',
                    message:'请注意，删除单据配置后不可恢复，需进行二次身份验证',
                    okText:'确认无误，继续删除',
                    okType:'danger',
                    reLoginTime:undefined
                })
            }else{
                let self = this;
                this.setReLogin({
                    callback(){
                        self.doDelete();
                    },
                    title:'安全确认',
                    message:'请注意，删除单据配置后不可恢复，需进行二次身份验证',
                    okText:'确认删除',
                    reLoginTime:undefined
                })
            }
        },
        diffChange(value){
            try{
                this.diffMerged = JSON.parse(value);
                this.diffMerged.docType        = this.def.docType;
                this.diffMerged.docClassify    = this.def.docClassify;
                this.diffMerged.version        = this.def.version;
                this.diffMerged.versionHead    = this.def.versionHead;
                this.diffMerged.prevVersion    = this.def.prevVersion;
                this.diffMerged.createdTime    = this.def.createdTime;
                this.diffMerged.createdAccount = this.def.createdAccount;
            }catch (e){
                this.diffMerged = undefined;
                this.$message.error("配置无效："+e);
            }
        },
        doConfirmActive(){
            if(this.diffMerged){
                this.diffMerged.versionDesc=this.def.versionDesc;
                this.valid().then(()=>{
                    this.confirmLoadingActive=true;
                    this.$http.postJSON(`/api/def/doc/type/active`,this.diffMerged)
                        .then((res)=>{
                            this.editMode = false;
                            this.def = res.data;
                            this.visibleActiveDiff = false;
                            this.$message.info("配置已激活");
                            this.loadHistories(true);
                        })
                        .finally(()=>{
                            this.loading = false;
                            this.confirmLoadingActive=false;
                        })
                });
            }else{
                this.$error({
                    title: '错误',
                    content: '配置无效',
                });
            }
        },
        doActive(){
            let self = this;
            this.loading = true;
            // 获取当前激活版本
            this.$http.get(`/api/def/doc/type/detail/${this.def.docType}/@`)
                .then(res=>{
                    if(res.data){ // 如果激活的版本存在 且 父版本不一致
                        const old = res.data;
                        this.visibleActiveDiff = true;
                        this.versionConflict = old.version!==this.def.prevVersion
                        this.diff = diffJson(old,this.def,diffOptions).map(diffClear);
                        this.loading = false;
                    }else{
                        this.$confirm({
                            title: '确认激活当前版本?',
                            centered : true,
                            onOk() {
                                self.diffMerged=self.def;
                                self.doConfirmActive();
                            },
                            onCancel(){
                                self.loading = false;
                            }
                        });
                    }
                });
        },
        doBreach(){
            this.valid().then(()=>{
                this.loading = true;
                this.$http.postJSON(`/api/def/doc/type/breach`,this.def)
                    .then((res)=>{
                        this.$emit("replace",`/apps/def/doc/detail/${res.data.docType}/${res.data.version}`)
                    })
                    .catch(()=>{
                        this.loading = false;
                    })
            });
        },
        doEdit(){
            this.editMode = true;
        },
        doUpdate(){
            this.valid().then(()=>{
                this.loading = true;
                this.$http.postJSON(`/api/def/doc/type/update`,this.def)
                    .then((res)=>{
                        if(this.isCreate){
                            this.$emit("replace",`/apps/def/doc/detail/${this.def.docType}/${res.data.version}`)
                        }else{
                            this.def = res.data;
                            this.loading = false;
                        }
                    })
                    .catch(()=>{
                        this.loading = false;
                    })
            });
        },
        toVersion(i){
            if(i.version!==this.def.version){
                this.loading = true;
                this.$emit('replace',`/apps/def/doc/detail/${i.docType}/${i.version}`);
            }
        },
        diffVersion(i,e){
            if(e)e.stopPropagation();
            this.visibleDiff = true;
            this.diff = undefined;
            this.$http.get(`/api/def/doc/type/detail/${i.docType}/${i.version}`)
                .then(res=>{
                    this.diff = diffJson(res.data,this.def).map(diffClear);
                });
        },
        valid(){
            return new Promise((resolve)=>{
                if(!this.def.docType){
                    this.$message.error("模型类型不能为空"); return;
                }
                if(!this.def.docName){
                    this.$message.error("单据描述不能为空"); return;
                }
                // if(!this.def.validFrom || !this.def.validTo){
                //     this.$message.error("单据有效期限不能为空"); return;
                // }
                if(!this.def.refObjectType){
                    this.$message.error("单据处理程序不能为空"); return;
                }
                if(!this.def.refObjectType){
                    this.$message.error("单据处理程序不能为空"); return;
                }
                if(!this.def.status.length){
                    this.$message.error("单据状态不能为空"); return;
                }
                if(NkUtil.hasBlack(this.def.cards,["cardKey"])){
                    this.$message.error(`卡片KEY不能为空，请注意调整`); return;
                }
                if(NkUtil.isRepeat(this.def.cards,["cardKey"])){
                    this.$message.error(`卡片KEY重复，请注意调整`); return;
                }
                resolve();
            })
        },
        doRandom(){
            this.createRandomLoading = true;
            this.$http.post(`/api/def/doc/random/${this.def.docType}/${this.createRandomCount}`)
                .then(()=>{
                    this.visibleCreateRandom = false;
                    this.createRandomLoading = false;
                });
        },
        loadHistories(clear){
            if(clear){
                this.histories = [];
            }
            let page = Math.ceil(this.histories.length / 10);
            this.$http.get(`/api/def/doc/type/list/${this.routeParams.type}/${page + 1}`)
                .then(res=>{
                    this.histories.push.apply(this.histories, res.data)
                    this.historiesMore = res.data.length === 10;
                });
        },
        handleMenuClick({key}){
            switch (key){
                case "doDelete":this.doForceDelete();break;
                case "doBreach":this.doBreach();break;
                case "doCopy":this.$emit('replace',`/apps/def/doc/create?fromType=${this.def.docType}&fromVersion=${this.def.version}`);break;
                case "doRandom":this.visibleCreateRandom = true;break;
                case "showHistory":break;
            }
        },
        openDefTree(){
            this.visibleDefTree = true;
            this.historiesRoot = undefined;
            this.$http.get(`/api/def/doc/type/list/${this.def.docType}/1?rows=1000`)
                .then(res=>{
                    let list = res.data;
                    let root = [];

                    list.forEach(item=>{
                        if(item.prevVersion){
                            const prev = list.find(i=>i.version===item.prevVersion);
                            if(prev){
                                if(item.version===this.def.version){
                                    item.color='red'
                                }
                                prev.children = prev.children||[];
                                prev.children.push(item);

                                if(!prev.prevVersion){
                                    if(root.indexOf(prev)===-1)
                                        root.push(prev);
                                }
                            }else{
                                if(root.indexOf(item)===-1)
                                    root.push(item);
                            }
                        }else{
                            if(root.indexOf(item)===-1)
                                root.push(item);
                        }
                    })

                    if(root.length===1){
                        this.historiesRoot = root[0];
                    }else if(root.length===0){
                        this.historiesRoot = {};
                    }else{
                        this.historiesRoot = {
                            version: this.def.docType,
                            versionDesc: this.def.docName,
                            children: root
                        };
                    }
                });
        },
        gClick(e){
            this.toVersion(e.item.getModel())
        }
    },
}
</script>

<style scoped lang="less">
    ::v-deep {
        .ant-card + .ant-card{
            margin-top: 20px;
        }
        .v-note-wrapper{
            z-index: 1;
        }
        .ant-card.doc .ant-card-body{
            padding: 1px;
        }
        ::v-deep .ant-list-footer{
            padding: 5px 10px;
        }
    }
    .history-item{
        display: block;
        cursor: pointer;
        padding: 5px 10px;
        & > div{
            display: flex;
            align-items: center;
            justify-items: center;
            justify-content: space-between;
            div{
                display: block;
                width: 80%;
                span{
                    width: 120px;
                    padding-left: 5px;
                    display: inline-block;
                    margin: 5px 0 0 0;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    word-break: break-all;
                }
            }
        }
        &.active{
            div{
                color: #1890ff;
            }
        }
        .version-tag{
            width: 18px;
            text-align: center;
            padding: 0;
        }
        a.diff{
            user-select: none;
            display: none;
        }
        &:hover a.diff{
            display: block;
        }
    }

</style>
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
    <nk-page-layout title="用户组" :spinning="spinning">
        <a-button-group slot="action">
            <a-button type="primary" @click="itemNew">新建</a-button>
        </a-button-group>
        <a-layout>
            <a-layout-sider theme="light" bordered>
                <a-list item-layout="horizontal" :data-source="listFilter" class="filter">
                    <a-input slot="header" placeholder="filter..." style="border: none" allow-clear v-model="filter"></a-input>
                    <a-list-item slot="renderItem"
                                 slot-scope="i"
                                 @click="itemClick(i)"
                                 :class="i.groupId===item.groupId?'selected':''">
                        {{i.groupDesc}}
                    </a-list-item>
                </a-list>
            </a-layout-sider>
            <a-layout-content>
                <a-card :title="item.groupDesc||'未选中...'" style="margin-left: 20px;"
                >

                    <a-button-group slot="extra" v-if="item.groupDesc && (!item.groupId || !item.groupId.startsWith('nk-default-'))">
                        <a-button type="primary" @click="itemUpdate">保存</a-button>
                        <a-popconfirm placement="topLeft" ok-text="Yes" cancel-text="No" @confirm="itemRemove">
                            <template slot="title">
                                <p>确认删除 '{{item.groupDesc}}'?</p>
                            </template>
                            <a-button v-if="item.groupId">删除</a-button>
                        </a-popconfirm>
                    </a-button-group>

                    <nk-form :col="1" :edit="item.groupDesc !== undefined && (!item.groupId || !item.groupId.startsWith('nk-default-'))">
                        <nk-form-item term="KEY">
                            {{item.groupKey}}
                            <a-input slot="edit" v-model="item.groupKey" placeholder="用户组Key"></a-input>
                        </nk-form-item>
                        <nk-form-item term="描述">
                            {{item.groupDesc}}
                            <a-input slot="edit" v-model="item.groupDesc" placeholder="权限描述"></a-input>
                        </nk-form-item>
                        <nk-form-item term="关联账号" v-if="item.groupId">
                            <div class="accounts">
                                <div class="a" v-for="a in item.accounts" :key="a.id">
                                    {{a.username}}
                                    <a-popconfirm v-if="!(item.groupId && item.groupId.startsWith('nk-default-') && a.id.startsWith('nk-default-'))"
                                                  placement="topLeft" ok-text="Yes" cancel-text="No" @confirm="accountRemove(a)">
                                        <template slot="title">
                                            <p>确认移除 '{{a.username}}'?</p>
                                        </template>
                                        <a-icon type="close" />
                                    </a-popconfirm>

                                </div>
                                <a-auto-complete
                                    size="small"
                                    v-model="accountSelect"
                                    :data-source="accounts"
                                    style="width: 200px"
                                    placeholder="添加账号到用户组"
                                    @select="accountAdd"
                                    @search="accountSearch"
                                />
                            </div>
                        </nk-form-item>
                        <nk-form-item term="权限">
                            <vxe-toolbar v-if="editMode">
                                <template v-slot:buttons>
                                    <vxe-button status="perfect" size="mini" @click="addPerm()">新增</vxe-button>
                                </template>
                            </vxe-toolbar>
                            <vxe-table border="inner" size="mini" :data="item.permissions" ref="xTable"
                                       :edit-config="{trigger: 'click', mode: 'row', showIcon: editMode, activeMethod}">
                                <vxe-column width="25%" title="权限定义"   field="permDesc" :edit-render="{}">
                                    <template v-slot:edit="{row}">
                                        <a-select
                                            placeholder="请选择权限"
                                            style="width: 100%"
                                            showSearch
                                            :filter-option="filterOption"
                                            v-model="row.permId"
                                            @change="permItemChange(row)"
                                        >
                                            <a-select-option v-for="d in perms" :key="d.permId">
                                                {{ d.permDesc }}
                                            </a-select-option>
                                        </a-select>
                                    </template>
                                </vxe-column>
                                <vxe-column width="28%" title="资源"      field="permResource"></vxe-column>
                                <vxe-column width="10%" title="操作"      field="permOperate"></vxe-column>
                                <vxe-column width="12%" title="Level"    field="permLevel"></vxe-column>
                                <vxe-column width="15%" title="限制"      field="limitId" :edit-render="{}">
                                    <template v-slot="{row}">
                                        {{row.limitId | nkFromList(limitsOptions,'limitDesc','limitId')}}
                                    </template>
                                    <template v-slot:edit="{row}">
                                        <a-select
                                            placeholder="请选择限制"
                                            style="width: 100%"
                                            :filter-option="false"
                                            v-model="row.limitId"
                                        >
                                            <a-select-option v-for="d in limitsOptions" :key="d.limitId">
                                                {{ d.limitDesc }}
                                            </a-select-option>
                                        </a-select>
                                    </template>
                                </vxe-column>
                                <vxe-column title="Action">
                                    <template v-slot="{seq}">
                                        <span v-if="editMode" style="margin-left: 10px;" @click="removePerm(seq)">
                                            <i class="vxe-icon--remove"></i>
                                        </span>
                                    </template>
                                </vxe-column>
                            </vxe-table>

                        </nk-form-item>
                    </nk-form>

                </a-card>
            </a-layout-content>
        </a-layout>
    </nk-page-layout>
</template>

<script>
export default {
    name: "NkSettingsAuthgroup",
    data(){
        return {
            list:[],
            item: {},
            perms:[],
            limits:[],
            filter: '',

            accountSelect: '',
            accounts: [],

            spinning:true
        }
    },
    created() {
        this.reload();
        this.$http.get("/api/settings/auth/perm/list")
            .then(res=>this.perms = res.data);
        this.$http.get("/api/settings/auth/limit/list")
            .then(res=>this.limits = res.data);
    },
    computed:{
        itemPermIds(){
            return this.item.permissions && this.item.permissions.map(authority=>authority.permId)
        },
        limitsOptions(){
            let limits = [{limitId:'@',limitDesc:'无限制'}];
            this.limits.forEach(item=>limits.push(item))
            return limits;
        },
        listFilter(){
            return this.list.filter((i)=>i.groupDesc.toLowerCase().indexOf(this.filter.toLowerCase())>-1);
        },
        editMode(){
            return this.item.groupDesc !== undefined && (!this.item.groupId || !this.item.groupId.startsWith('nk-default-'));
        }
    },
    methods:{
        activeMethod(){return this.editMode;},
        reload(){
            this.$http.get("/api/settings/auth/group/list")
                .then(res=>{
                    this.list = res.data;
                    if(!this.item.groupId && this.list[0]){
                        this.itemClick(this.list[0]);
                    }
                });
        },
        itemClick(e){
            this.spinning=true;
            this.$http.get("/api/settings/auth/group/detail?groupId="+e.groupId)
                .then(res=>{
                    this.item = Object.assign({permissions:undefined},res.data);
                    this.spinning=false;
                });
        },
        itemUpdate(){
            this.spinning=true;
            this.$http.postJSON("/api/settings/auth/group/check",this.item)
                .then(res=>{
                    if(res.data){
                        this.$http.postJSON("/api/settings/auth/group/update",this.item)
                            .then(res=>{
                                this.item = res.data;
                                this.reload();
                                this.$message.success('保存成功', 2.5)
                                this.spinning=false;
                            });
                    }else{
                        this.$message.warning('用户组id重复，请重新填写', 1.5);
                        this.spinning=false;
                    }
                });
        },
        itemRemove(){
            this.$http.postJSON("/api/settings/auth/group/remove?groupId="+this.item.groupId)
                .then(()=>{
                    this.item = {};
                    this.reload();
                    this.$message.success('删除成功', 2.5)
                });
        },
        itemNew(){
            this.item = {groupDesc:"未命名用户组",permissions:undefined};
        },
        addPerm(){
            this.item.permissions = this.item.permissions||[];
            let newItem = {
                permId : undefined,
                limitId: '@'
            };
            this.item.permissions.push(newItem);
            this.$refs.xTable.loadData(this.item.permissions).then(() => this.$refs.xTable.setActiveRow(newItem));
        },
        removePerm(seq){
            this.item.permissions.splice(seq-1,1)
        },
        permItemChange(perm){
            const find = this.perms.find(p=>p.permId === perm.permId);
            Object.assign(perm,find);
        },
        accountAdd(e){
            this.$http.post(`/api/settings/auth/group/add/account?groupId=${this.item.groupId}&accountId=${e}`)
                .then(res=>{
                    this.item = res.data;
                    this.$message.success('添加成功', 2.5)
                }).finally(()=>{
                    this.accountSelect = ''
                });
        },
        accountRemove(e){
            this.$http.post(`/api/settings/auth/group/remove/account?groupId=${this.item.groupId}&accountId=${e.id}`)
                .then(res=>{
                    this.item = res.data;
                    this.$message.success('移除成功', 2.5)
                })
        },
        accountSearch(e){
            if(e){
                this.$http.post(`/api/settings/auth/accounts?keyword=${e}`)
                    .then(res=>{
                        this.accounts = res.data.map(item=>{return {value:item.id,text:item.username}});
                    });
            }
        },
        filterOption(value, option){
            return option.componentOptions.children[0].text.indexOf(value) >= 0
        }
    }
}
</script>

<style scoped lang="less">

::v-deep .ant-layout-sider{
    background: inherit;
}
.accounts{
    margin: 5px 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;

    > .a{
        background-color:#fafafa;
        border:1px solid #e8e8e8;
        border-radius:2px;
        padding:1px 8px;
        margin-left: 5px;
        height: 24px;

        ::v-deep .anticon{
            line-height:1;
            transform: scale(0.83333333) rotate(0deg);
            cursor: pointer;
            user-select: none;
            margin-left: 2px;
            color: rgba(0, 0, 0, 0.45);
        }
    }

    ::v-deep .ant-select{
        margin-left: 5px;
    }
}
</style>

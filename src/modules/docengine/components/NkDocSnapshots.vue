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
    <a-card class="nk-page-layout-card nk-card-doc-snapshots" >
        <span slot="title">
            变更历史
        </span>
        <vxe-table
            auto-resize
            size="mini"
            :loading="loading"
            border=inner
            :data="list">
            <vxe-table-column title="Ver."   field="version"       width="8%" >
                <template v-slot="{row}">
                    {{row.version}}
                </template>
            </vxe-table-column>
            <vxe-table-column title="原始状态"   field="stateOriginal"  width="10%" />
            <vxe-table-column title="变更状态"   field="state"          width="10%" />
            <vxe-table-column title="操作人"     field="userRealname"   width="12%" />
            <vxe-table-column title="操作来源"   field="source"         width="28%" />
            <vxe-table-column title="变更时间"   field="updatedTime"    width="20%" formatter="nkDatetimeFriendly" />
            <vxe-table-column title="Action">
                <template v-slot="{ row,rowIndex }">
                    <a class="a" @click="to(row)">查看</a>
                    <a class="a" @click="diff(row)" v-if="rowIndex>0" style="margin-left: 5px;">对比</a>
                </template>
            </vxe-table-column>
        </vxe-table>
        <span slot="actions" v-if="hasMore">
            <a-button type="link" @click="load">加载更多...</a-button>
        </span>
    </a-card>
</template>

<script>

export default {
    props:{
        doc:Object
    },
    data(){
        return {
            list:[],
            hasMore:undefined,
            loading:true
        }
    },
    mounted() {
        this.load();
    },
    methods:{
        to(item){
            this.$router.push(`/apps/docs/snapshot/${item.id}`)
        },
        diff(item){
            this.$router.push(`/apps/docs/diff/${this.doc.docId}/snapshot:${item.id}`)
        },
        load(){
            this.$http.get(`/api/doc/detail/snapshots/${this.doc.docId}/${this.list.length}`)
                .then(res=>{
                    this.list.push(...res.data.slice(0,5));
                    this.hasMore = res.data.length > 5;
                    this.loading = false;
                });
        }
    }
}
</script>

<style scoped lang="less">
::v-deep.nk-card-doc-snapshots{
    .ant-list-item{
        font-size:12px;

        a{
            color: rgba(0, 0, 0, 0.65);
        }
        &:hover{
            a{
                color:#1890ff;
            }
        }
    }
    .ant-list-footer{
        padding: 10px 0 0 0;
        a{
            font-size:10px;
            color:#1890ff;
        }
    }
}
</style>
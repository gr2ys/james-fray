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
    <nk-page-layout title="原生组件">
        <a-card>
            <vxe-grid
                ref="grid"
                auto-resize
                resizable
                highlight-hover-row
                border="inner"
                show-header-overflow="tooltip"
                show-overflow="tooltip"
                size="mini"
                :columns="columns"
                :data="list"
                :loading="loading"
            >
            </vxe-grid>
        </a-card>
    </nk-page-layout>
</template>

<script>


export default {
    data(){
        return {
            loading:false,
            list:undefined,
        }
    },
    computed:{
        columns(){
            return [
                { type: 'seq',          title: '#',      width: '4%', },
                { field: 'scriptType',  title: '类型',    width: '10%', sortable:true, params:{ orderField: 'SCRIPT_TYPE'}},
                { field: 'scriptName',  title: '组件',    width: '22%', sortable:true, params:{ orderField: 'SCRIPT_NAME'}},
                { field: 'scriptDesc',  title: '描述',    width: '55%', sortable:true, params:{ orderField: 'SCRIPT_DESC'}},
                {                       title: 'ACTION',
                    slots: { default: ({row},h) => {
                            return [h(
                                'router-link',
                                {
                                    props:{to: `/apps/def/component/detail/${row.scriptName}/${row.version}`}
                                },
                                "详情"
                            )]
                        }}
                },
            ];
        }
    },
    created() {
        this.loading = true;
        this.$http.post("/api/def/script/ide/list")
            .then((res)=>{
                this.list = res.data;
                this.$emit("setTab","原生组件");
                this.loading = false;
            });
    }
}
</script>

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
    <nk-card card-key="nk-card-doc-type-histories" class="nk-page-layout-card" title="版本历史">
        <vxe-table
            row-key
            auto-resize
            size="mini"
            border=inner
            resizable
            highlight-hover-row
            :data="histories">
            <vxe-table-column   title="Ver."       field="version"              width="13%" :sortable="true" :formatter="formatVersion"/>
            <vxe-table-column   title="描述"        field="versionDesc"          width="27%" :sortable="true"/>
            <vxe-table-column   title="状态"        field="state"                width="10%" :sortable="true"/>
            <vxe-table-column   title="创建"        field="createdAccount"       width="10%" :sortable="true"/>
            <vxe-table-column   title="创建时间"     field="createdTime"          width="10%" :sortable="true" formatter="nkDatetimeFriendly"/>
            <vxe-table-column   title="修改"        field="updatedAccount"       width="10%" :sortable="true"/>
            <vxe-table-column   title="修改时间"    field="updatedTime"          width="10%" formatter="nkDatetimeFriendly"/>
            <vxe-table-column   title=""           field=""               >
                <template v-slot="{seq,row}">
                    <a v-if="docDef.version!==row.version" style="margin-right: 5px;" @click="toVersion(row)">
                        打开
                    </a>
                    <a v-if="docDef.version!==row.version" @click="diff(row)">
                        Diff
                    </a>
                </template>
            </vxe-table-column>
        </vxe-table>
    </nk-card>
</template>

<script>

const formatVersion = ({cellValue})=>{
    return cellValue.substring(cellValue.length-9,cellValue.length);
}
export default {
    mixins:[],
    props:{
        editMode:Boolean,
        docDef:Object,
        docOptions:Object
    },
    data(){
        return {
            page:1,
            histories:undefined
        }
    },
    computed:{
    },
    created() {
        this.$http.get(`/api/def/doc/type/list/${this.docDef.docType}/${this.page}?rows=100`)
            .then(res=>{
                this.histories=res.data;
            });
    },
    methods:{
        formatVersion,
        toVersion(i){
            if(i.version!==this.docDef.version){
                this.$emit('replace',`/apps/def/doc/detail/${i.docType}/${i.version}`);
            }
        },
        diff(i){
            if(i.version!==this.docDef.version){
                this.$emit('diff',i);
            }
        },
    }
}
</script>

<style scoped>

</style>
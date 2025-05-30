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
    <a-card title="业务流">
        <vxe-toolbar v-if="editMode">
            <template v-slot:buttons>
                <vxe-button icon="fa fa-plus" status="perfect" size="mini" @click="add()">新增</vxe-button>
            </template>
        </vxe-toolbar>
        <vxe-table
            ref="xTableDocs"
            row-key
            auto-resize
            size="mini"
            border=inner
            resizable
            highlight-hover-row
            show-header-overflow="tooltip"
            show-overflow="tooltip"
            header-cell-class-name="headerCellClassName"
            :edit-config="{trigger: 'click', mode: 'row', showIcon: editMode, activeMethod: ()=>{return editMode}}"
            :data="docDef.flows">
            <vxe-table-column field="preDocType"    width="15%" :edit-render="{name: '$input',props: {type: 'text',maxlength:4}}" title="前置模型"/>
            <vxe-table-column field="preDocState"   width="15%" :edit-render="{name: '$input',props: {type: 'text',maxlength:4}}" title="前置模型状态" />
            <vxe-table-column field="refObjectType" width="20%" :edit-render="{name:'$select',options: docOptions.docFlowInterceptors,optionProps: {value: 'key', label: 'name'},}" title="扩展程序" >
                <template v-slot="{ row }">
                    <nk-script-label :value="row.refObjectType"></nk-script-label>
                </template>
            </vxe-table-column>
            <vxe-table-column field="refObjectParams"   width="20%" :edit-render="{}" title="参数" >
                <template v-slot:edit="{row}">
                    <nk-sp-el-template-editor v-model="row.refObjectParams"></nk-sp-el-template-editor>
                </template>
            </vxe-table-column>
            <vxe-table-column width="10%" :edit-render="{}" title="自动创建" >
                <template v-slot:edit="{row}">
                    实验中
                </template>
            </vxe-table-column>

            <vxe-table-column>
                <template v-slot="{ seq }">
                    <span v-if="editMode" class="drag-btn" style="margin-right: 10px;"><a-icon type="swap" rotate="90" /></span>
                    <span v-if="editMode" @click="$nkSortableRemove(docDef.flows,seq)"><a-icon type="delete" /></span>
                </template>
            </vxe-table-column>
        </vxe-table>
    </a-card>
</template>

<script>
import MixinSortable from "../../../utils/MixinSortable";
export default {
    mixins:[MixinSortable()],
    props:{
        editMode:Boolean,
        docDef:Object,
        docOptions:Object,
    },
    created() {
        this.$nkSortableVxeTable(true);
    },
    methods:{
        add(){
            if(!this.docDef.flows){
                this.$set(this.docDef,"flows",[]);
            }
            const row = {
                preDocType:'@',
                preDocStatus:'@',
                refObjectType:''
            };
            this.docDef.flows.push(row)
            this.$refs.xTableDocs.setActiveRow(row);
        },
    }
}
</script>

<style scoped lang="less">
    ::v-deep{
    }
</style>
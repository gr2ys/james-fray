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
    <nk-card :title="`审批流配置`">

        <vxe-toolbar v-if="editMode">
          <template v-slot:buttons>
            <vxe-button icon="fa fa-plus" status="perfect" size="mini" @click="addRow()">新增</vxe-button>
          </template>
        </vxe-toolbar>
        <vxe-table
            ref="xTableComponent"
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
            :data="docDef.bpms">
          <vxe-table-column   title="流程定义"         field="processKey"  width="40%"
                              :edit-render="{name:'input'}"/>
          <vxe-table-column   title="启动状态"         field="startBy"     width="25%"
                              :edit-render="{name:'input'}"/>
          <vxe-table-column   title="终止时回退状态"      field="rollbackTo"         width="25%"
                              :edit-render="{name:'input'}"/>
          <vxe-table-column   title=""            field=""                   width="10%">
            <template v-slot="{seq,row}">
                      <span v-if="editMode" class="drag-btn" style="margin-right: 10px;">
                              <i class="vxe-icon--menu"></i>
                          </span>
              <span v-if="editMode" style="margin-right: 10px;" @click="$nkSortableRemove(docDef.bpms,seq)">
                              <i class="vxe-icon--remove"></i>
                          </span>
            </template>
          </vxe-table-column>
        </vxe-table>
    </nk-card>
</template>

<script>
import MixinSortable from "../../../utils/MixinSortable";

export default {
    mixins:[MixinSortable()],
    props:{
        editMode:Boolean,
        docDef:Object,
        docOptions:Object,
        card:Object
    },
    data(){
        return {}
    },
    computed:{
        bpm(){
            return this.docDef.bpms && this.docDef.bpms[0] || {};
        }
    },
    created() {
        this.$nkSortableVxeTable(true);
        if(!this.docDef.bpms){
            this.$set(this.docDef,'bpms',[]);
        }
    },
    methods:{
      addRow(){
        let row = {
          processKey:'',
          startBy:'',
          rollbackTo:'',
        };
        this.docDef.bpms.push(row)
        this.$refs.xTableComponent.setActiveRow(row);
      },
    },
}
</script>

<style scoped>

</style>
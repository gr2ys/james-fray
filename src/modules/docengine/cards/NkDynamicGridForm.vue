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
    <nk-card>

        <vxe-toolbar v-if="editMode&&!def.disabledEdit">
            <template v-slot:buttons>
                <vxe-button icon="fa fa-plus" status="perfect" size="mini" @click="xTableAdd()">新增</vxe-button>
            </template>
        </vxe-toolbar>
        <vxe-table
            ref="xTable"
            auto-resize
            keep-source
            resizable
            row-key
            highlight-hover-row
            show-header-overflow="tooltip"
            show-overflow="tooltip"
            size="mini"
            border=inner
            :data="data"
            :loading="loading"
            @cell-dblclick="xTableDblClick"
        >
            <!--增加一行空列，避免宽度不够不能自适应-->
            <vxe-column v-if="def.seq" type="seq" title="#" width="5%"></vxe-column>

            <!--避免配置更新后不重新渲染，所以要使用item.inputOptions作为key-->
            <vxe-column v-for="(item) in columns" :key="item.key+JSON.stringify(item.inputOptions)"
                      :width="(item.width||10) + '%'"
                      :title="item.name"
                      :field="item.key"
                      class-name="xtable-col"
            >
                <template v-slot="{ row }">
                    <component :is="item.inputType" :editMode="false"
                               v-model="row[item.key]"
                               :input-options="item.inputOptions"
                    ></component>
                </template>
            </vxe-column>
            <!--增加一行空列，避免宽度不够不能自适应-->
            <vxe-column></vxe-column>
            <vxe-column title="" fixed="right" width="60px">
                <template v-slot="{row, seq,items}">
                    <span v-if="editMode" class="btn" @click="xTableEdit(row,seq)">
                        <i class="vxe-icon--edit-outline"></i>
                    </span>
                    <span v-else class="btn" @click="xTableEdit(row,seq)">
                        <i class="vxe-icon--info"></i>
                    </span>
                    <span v-if="editMode&&!def.disabledRemove" class="btn" @click="xTableRemove(seq)">
                        <i class="vxe-icon--remove"></i>
                    </span>
                </template>
            </vxe-column>
        </vxe-table>

        <div ref="container"></div>
        <a-modal :visible="selected" title="详情"
                 @cancel="xTableCancel"
                 @ok="xTableChange"
                 :width="(def.width||60)+'%'"
                 :dialogStyle="{'max-width': '800px','overflow':'hidden'}"
                 :maskClosable="!editMode"
                 :okButtonProps="{style:{display:editMode?'inline-block':'none'}}"
                 :confirmLoading="confirmLoading"
        >
            <a-spin :spinning="confirmLoading">
                <nk-form ref="form" :col="def.col||1" :edit="editMode" v-if="selectedItem">

                    <template v-for="(item) in modalFields" >
                        <nk-form-divider
                            v-if="(item.inputType==='divider'||item.inputType==='-'||item.inputType==='--')"
                            :key="item.key"
                            :title="item.name"></nk-form-divider>
                        <nk-form-item  v-else
                                       :key="item.key"
                                       :title="item.name"
                                       :default-if-edit-lost="false"
                                       :col="item.col"
                                       :edit="editMode && item.control > 0"
                                       :width="def.titleWidth||140"
                                       :ellipsis="def.titleEllipsis"
                                       :content-align="item.alignRight?'right':''"

                                       :validate-for="selectedItem[item.key]"
                                       :required="item.required"
                                       :len="item.inputOptions&&((!!item.inputOptions.maxLength)||(!!item.inputOptions.minLength))"
                                       :min="item.inputOptions&&(item.inputOptions.min||item.inputOptions.minLength)"
                                       :max="item.inputOptions&&(item.inputOptions.max||item.inputOptions.maxLength)"
                                       :pattern="item.inputOptions&&item.inputOptions.pattern"
                                       :message="item.message||(item.name +'校验不通过')"
                        >
                            <template #[obtainSlot(item)]>
                                <component ref="items"
                                           :is="item.inputType"
                                           :editMode="editMode && item.control > 0"
                                           v-model="selectedItem[item.key]"
                                           :input-options="item.inputOptions"
                                           :style="item.style"
                                           @change="itemFieldChange($event,item)"
                                ></component>
                            </template>
                        </nk-form-item>
                    </template>

                </nk-form>
            </a-spin>
        </a-modal>

    </nk-card>
</template>

<script>
import Mixin from "./Mixin";
import NkUtil from "../../../utils/NkUtil";


export default {
    mixins:[new Mixin({})],
    created() {
    },
    data(){
        return {
            loading: false,
            selected:false,
            selectedItem:undefined,
            selectedSeq:undefined,
            confirmLoading:false,

            trigger: false,
            triggerKeys: [],

            modalFields: []
        }
    },
    computed:{
        columns(){
            if(this.def.items){
                return this.def.items.filter(item=>item.width>0 && !(item.inputType==='divider'||item.inputType==='-'||item.inputType==='--'));
            }
            return [];
        }
    },
    methods:{
        docUpdate(){
            this.xTableCancel();
        },
        async xTableAdd(){
            let row = {};
            this.def.items.forEach(field=>{
                row[field.key]=undefined;
            });
            this.trigger = true;
            this.xTableEdit(row,0);
        },
        xTableRemove(seq){
            this.data.splice(seq-1,1);
            if(this.def.items.find(item=>item.calcTrigger)){
                this.trigger = true;
                this.xTableChange();
            }
        },
        xTableDblClick({rowIndex}){
            this.xTableEdit(this.data[rowIndex],rowIndex+1);
        },
        xTableEdit(row,seq){
            this.modalFields  = this.def.items||[];
            this.selectedItem = JSON.parse(JSON.stringify(row));
            this.selectedSeq  = seq;
            this.selected     = true;
            this.itemCalc();
        },
        xTableCancel(){
            this.selectedItem   = undefined;
            this.selectedSeq    = undefined;
            this.selected       = false;
            this.confirmLoading = false;
            this.trigger        = false;
            this.triggerKeys    = [];
        },
        xTableChange(){

            if(this.selectedItem){

                if(this.$refs.form.hasError()){
                    return false;
                }

                if(this.selectedSeq===0){
                    this.data.push(this.selectedItem);
                }else{
                    this.data[this.selectedSeq-1]=this.selectedItem;
                }
            }

            if(this.trigger){
                this.confirmLoading = true;
                this.trigger = false;
                this.nk$calc({
                    triggerKeys:this.triggerKeys
                });
                this.triggerKeys = [];
                return false;
            }else{
                this.$refs.xTable.loadData(this.data);
                this.xTableCancel();
            }
        },
        itemFieldChange(e,item){
            if(item && item.calcTrigger){
                this.trigger = true;
                if(this.triggerKeys.indexOf(item.key)===-1){
                    this.triggerKeys.push(item.key);
                }
                this.itemCalc();
            }
        },
        itemCalc(){
            this.confirmLoading = true;
            this.nk$call({
                selectedItem:this.selectedItem
            }).then(res=>{
                this.selectedItem=res.selectedItem;
                this.modalFields =res.fieldsDef;
            }).finally(()=>{
                this.confirmLoading = false;
            });
        },
        obtainSlot(item){
            return this.editMode && item.control > 0?'edit':'default'
        },
        async hasError(){
            const fieldKey = this.def.items.find(i => i.key === 'fieldKey');
            if (fieldKey && NkUtil.isRepeat(this.data, ['fieldKey'])) {
                return `${this.card.cardName}-${fieldKey.name} 重复`;
            }
            const errMap = await this.$refs.xTable.fullValidate(true).catch(errMap => errMap)
            if (errMap) {
                return `${this.card.cardName}-${errMap.column.title} ${errMap.rule.$options.message||errMap.rule.$options.content}`;
            }
            return false;
        },
        uniqueValid(e){
            if (NkUtil.isRepeat(this.data, [e.column.property])) {
                return new Error(e.message||"重复")
            }
        }
    }
}
</script>

<style scoped lang="less">
    ::v-deep .empty{
        color:#bbb;
        user-select: none;
        font-style: italic;
    }
    ::v-deep .empty::before{
        content: '-'
    }
    .btn + .btn{
        margin-left: 10px;
    }
    ::v-deep .ant-modal-body{
        padding: 18px 12px;
    }
</style>
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
        <template v-slot:extra>
            <a-button v-if="def.downLoadFile&&!editMode" type="primary" @click="selectDownAllContract()" size="small">打包下载</a-button>
        </template>
        <iframe ref="iframe" style="display: none"></iframe>
        <nk-form ref="form" :col="def.col||1" :edit="editMode">

            <template v-for="(item) in def.items" >
                <nk-form-divider
                    v-if="item.control >= 0 && (item.inputType==='divider'||item.inputType==='-'||item.inputType==='--')"
                    :key="item.key"
                    :title="item.name"></nk-form-divider>
                <nk-form-item  v-else-if="item.control >= 0"
                               :key="item.key"
                               :title="item.name"
                               :default-if-edit-lost="false"
                               :col="item.col"
                               :edit="editMode && item.control > 0"
                               :width="def.titleWidth||undefined"
                               :ellipsis="def.titleEllipsis"
                               :content-align="item.alignRight?'right':''"

                               :validate-for="data[item.key]"
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
                                   v-model="data[item.key]"
                                   :input-options="item.inputOptions"
                                   :style="item.style"
                                   @change="itemChange($event,item)"
                                   @call="itemCall($event,item)"
                        ></component>
                    </template>
                </nk-form-item>
            </template>

        </nk-form>
    </nk-card>
</template>

<script>
import Mixin from "./Mixin";
export default {
    mixins:[new Mixin({})],
    methods:{
        nk$editModeChanged(editMode){
            this.$refs.items && this.$refs.items.forEach(c=>{
                c.nk$editModeChanged &&c.nk$editModeChanged(editMode);
            });
        },
        itemChange(e,item){
            if(item.calcTrigger){
                this.nk$calc({
                    triggerKey:item.key
                });
            }
        },
        itemCall(e,item){
            this.nk$call({
                triggerKey:item.key
            }).then(res=>{
                console.log(res)
            });
        },
        hasError(){
            return this.$refs.form.hasError();
        },
        obtainSlot(item){
            return this.editMode && item.control > 0?'edit':'default'
        },
        selectDownAllContract() {
            this.nk$call().then(res=>{
                this.$http.get("/api/fs/download?url="+res).then(res1 => {
                    this.$refs.iframe.src = res1.data;
                });
            });

        },

    },
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
</style>
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
    <nk-def-card :title="card.cardName+':卡片设计'">
        <div style="display: flex;width: 100%;">
            <div style="width: 100%;">
                <a-card :title="card.cardName">
                    <div ref="parent" class="parent" style="width: 100%;min-height: 300px;" @click="selectItem">
                        <nk-form :col="def.col||2">
                            <template v-for="(item,seq) in def.items">
                                <nk-form-divider
                                    v-if="item.control >= 0 && (item.inputType==='divider'||item.inputType==='-'||item.inputType==='--')"
                                    :key="item.key"
                                    :options="item" @nk-dragover="dragover" @drag="drag(item)" @dragend="dragend" @click="selectItem($event,item)"
                                    :draggable="editMode?'true':'false'"
                                    :class="{'b':true,'selected':item._selected,'drop':item._drop}"
                                    :title="item.name"></nk-form-divider>
                                <nk-form-item v-else
                                              :key="item.key"
                                              :options="item" @nk-dragover="dragover" @drag="drag(item)" @dragend="dragend" @click="selectItem($event,item)"
                                              :draggable="editMode?'true':'false'"
                                              :class="{'b':true,'selected':item._selected,'drop':item._drop}"
                                              :title="item.name"
                                              :col="item.col"
                                              style="position: relative;"
                                >
                                    <component :is="item.inputType" :editMode="true"></component>
                                    <a-icon type="close" v-if="editMode && item._selected" style="position: absolute;right: 2px;top:0;" @click="$nkSortableRemove(def.items,seq+1)" />
                                </nk-form-item>
                            </template>
                        </nk-form>
                    </div>
                </a-card>
            </div>

            <div class="propertiesPanel" style="width: 350px;flex-shrink: 0;border: solid 1px #e8e8e8;">
                <a-tabs v-model="activeKey">
                    <a-tab-pane v-if="editMode" key="lab" tab="组件库" style="margin-top: -14px;">
                        <div style="max-height: 500px;overflow-y: auto;">
                            <div v-for="inputType in inputTypeDefs" :key="inputType.key"
                                 @drag="drag(null,inputType)" @dragend="dragend" draggable="true"
                                 style="border: dashed 1px #eee;width:100%;">
                                <nk-form-item v-if="inputType.key" :title="inputType.name&&inputType.name.split('|')[1]">
                                    <component :is="inputType.key" :editMode="true"></component>
                                </nk-form-item>
                                <div v-else style="padding-right: 50px;">
                                    <nk-form-divider title="分隔符">
                                    </nk-form-divider>
                                </div>
                            </div>
                        </div>
                    </a-tab-pane>
                    <a-tab-pane key="card" tab="卡片">
                        <nk-form :col="1" :edit="editMode" style="width:100%;">
                            <nk-form-item title="列">
                                {{def.col}}
                                <a-input-number v-model="def.col" slot="edit" size="small" :min="1" :max="24" />
                            </nk-form-item>
                            <nk-form-item title="标题宽">
                                {{def.titleWidth}}
                                <a-input-number v-model="def.titleWidth" slot="edit" size="small" :min="20" :max="300" />
                            </nk-form-item>
                            <slot name="header"></slot>
                        </nk-form>
                    </a-tab-pane>
                    <a-tab-pane v-if="selectedItem" key="field" :tab="selectedItem.name">
                        <nk-form :edit="editMode" :col="1">
                            <nk-form-item title="KEY">
                                {{selectedItem.key}}
                                <a-input slot="edit" size="small" v-model="selectedItem.key" @change="keyChanged" />
                            </nk-form-item>
                            <nk-form-item title="描述">
                                {{selectedItem.name}}
                                <a-input slot="edit" size="small" v-model="selectedItem.name" />
                            </nk-form-item>
                            <nk-form-item title="触发计算">
                                {{selectedItem.calcTrigger?'是':'否'}}
                                <a-switch slot="edit" size="small" v-model="selectedItem.calcTrigger" />
                            </nk-form-item>
                            <nk-form-item title="计算顺序">
                                {{selectedItem.calcOrder}}
                                <a-input-number slot="edit" size="small" v-model="selectedItem.calcOrder" :min="1" :max="4" />
                            </nk-form-item>
                            <nk-form-item title="列宽">
                                {{selectedItem.col}}
                                <a-input-number slot="edit" size="small" v-model="selectedItem.col" :min="1" :max="24" />
                            </nk-form-item>
                            <nk-form-item title="是否非空">
                                {{selectedItem.required?'是':'否'}}
                                <a-switch slot="edit" size="small" v-model="selectedItem.required" />
                            </nk-form-item>
                            <nk-form-item title="校验提示">
                                {{selectedItem.message}}
                                <a-input slot="edit" size="small" v-model="selectedItem.message"></a-input>
                            </nk-form-item>
                            <nk-form-item title="右对齐">
                                {{selectedItem.alignRight?'是':'否'}}
                                <a-switch slot="edit" size="small" v-model="selectedItem.alignRight" />
                            </nk-form-item>
                            <nk-form-item title="自定义样式">
                                {{selectedItem.style}}
                                <a-input slot="edit" size="small" v-model="selectedItem.style"></a-input>
                            </nk-form-item>
                            <nk-form-item title="控制">
                                {{selectedItem.control===1 ?'读写':(selectedItem.control===0 ?'只读':'隐藏')}}
                                <a-select slot="edit" size="small" v-model="selectedItem.control" >
                                    <a-select-option :key="1" >读写</a-select-option>
                                    <a-select-option :key="0" >只读</a-select-option>
                                    <a-select-option :key="-1">隐藏</a-select-option>
                                </a-select>
                            </nk-form-item>
                            <nk-form-item title="控制 SpEL 表达式">
                                {{selectedItem.spELControl}}
                                <nk-sp-el-editor slot="edit" v-model="selectedItem.spELControl"></nk-sp-el-editor>
                            </nk-form-item>
                            <nk-form-item title="值 SpEL 条件">
                                {{selectedItem.spELTriggers}}
                                <a-select slot="edit" size="small" v-model="selectedItem.spELTriggers" mode="multiple" >
                                    <a-select-option key="ALWAYS">ALWAYS</a-select-option>
                                    <a-select-option key="INIT">INIT</a-select-option>
                                    <a-select-option key="BLANK">BLANK</a-select-option>
                                </a-select>
                            </nk-form-item>
                            <nk-form-item title="值 SpEL 表达式">
                                {{selectedItem.spELContent}}
                                <nk-sp-el-editor slot="edit" v-model="selectedItem.spELContent"></nk-sp-el-editor>
                            </nk-form-item>
                        </nk-form>
                        <component v-if="fieldDefComponent"
                                   :is="fieldDefComponent"
                                   :edit-mode="editMode"
                                   :col="1"
                                   v-model="selectedItem.inputOptions"
                        ></component>
                    </a-tab-pane>
                </a-tabs>
            </div>
        </div>
    </nk-def-card>
</template>

<script>
import MixinDef from "./MixinDef";
import MixinSortable from "../../../utils/MixinSortable";
import MixinDynamicDef from "./MixinDynamicDef";

let mouseXY = {"x": null, "y": null};

function dragover(e) {
    mouseXY.x = e.clientX;
    mouseXY.y = e.clientY;
}

export default {
    mixins:[new MixinDef({}),MixinSortable(),MixinDynamicDef],
    data(){
        return {
            dropItem: undefined,
            selectedItem: undefined,
            activeKey: this.editMode ? 'lab' : 'card'
        }
    },
    mounted() {
        this.nk$callDef()
            .then(res=>{
                this.inputTypeDefs = res;
                this.inputTypeDefs.push({value:'-',label:'-- | 分隔'})
            });
        document.addEventListener("dragover", dragover, false);
    },
    destroyed() {
        document.removeEventListener("dragover", dragover, false)
    },
    computed:{
        fieldDefComponent(){
            if(this.selectedItem && this.selectedItem.inputType){
                const defName = this.selectedItem.inputType + 'Def';
                if(this.$options.components[defName]){
                    return defName;
                }
            }
            return undefined;
        }
    },
    methods:{
        isMouseInRect(){
            // 目标容器
            let parentRect = this.$refs.parent.getBoundingClientRect();
            return mouseXY.x > parentRect.left
                && mouseXY.x < parentRect.right
                && mouseXY.y > parentRect.top
                && mouseXY.y < parentRect.bottom;
        },
        drag: function (item,inputType) {
            if(item){
                this.dropItem = item;
                this.$set(this.dropItem,'_drop',true);
            }else if(this.isMouseInRect()){
                if(!this.def.items.find(item => item===this.dropItem)){
                    this.dropItem = {
                        key : 'key'+this.def.items.length,
                        name: '字段'+this.def.items.length,
                        col:1,
                        inputType: inputType.value,
                        calcTrigger:'',
                        calcOrder:1,
                        required:false,
                        control:1,
                        spELContent:'',
                        spELTriggers:[],
                        eval:'',
                        _drop:true
                    };
                    this.def.items.push(this.dropItem);
                }
            }else{
                this.def.items = this.def.items.filter(item => item!==this.dropItem);
            }
        },
        dragend: function () {
            let dropItem = this.dropItem;
            if(this.dropItem){
                this.$set(this.dropItem,'_drop',undefined);
                this.dropItem = undefined;
            }
            this.selectItem(undefined, dropItem);
        },
        dragover(target){
            if(!target._drop && target!==this.dropItem){
                let si = this.def.items.indexOf(this.dropItem);
                if(si!==-1){
                    let ti = this.def.items.indexOf(target);
                    if(si>ti){
                        // 往前移动
                        this.def.items.splice(si,1);
                        this.def.items.splice(ti,0,this.dropItem);
                    }else{
                        // 往后移动
                        this.def.items.splice(si,1);
                        this.def.items.splice(ti,0,this.dropItem);
                    }
                }
            }
        },
        selectItem(e,item){
            if(this.selectedItem){
                this.selectedItem._selected=undefined;
            }
            this.selectedItem=item;
            if(this.selectedItem){
                this.selectedItem._selected=true;
                this.activeKey='field';
                if(!this.selectedItem.inputOptions){
                    this.$set(this.selectedItem,'inputOptions',{});
                }
            }else{
                this.activeKey=this.editMode ? 'lab' : 'card';
            }
            if(e)e.stopPropagation();

        },
        keyChanged(){
            let find = this.def.items.find(i=>{
                if(i!==this.selectedItem && i.key===this.selectedItem.key)
                    return true;
            })
            if(find){
                this.$message.warn(`Key:${this.selectedItem.key}已存在`)
                this.selectedItem.key = this.selectedItem.key+'1';
            }
        }
    }
}
</script>

<style scoped>
    .b{
        border: dashed 1px #eee;
    }
    .drop{
        border: dashed 1px red !important;
    }
    .selected{
        border: dashed 1px green;
    }
</style>
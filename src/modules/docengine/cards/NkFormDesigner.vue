<template>

    <a-spin :spinning="!inputTypeDefs" >
        <div style="display: flex;position: relative">
            <!--设计区域-->
            <div style="width: 100%;max-height: 600px;overflow-y: auto;">
                <a-card :title="title||'表单设计器'">
                    <div ref="parent" class="parent" style="width: 100%;min-height:300px;padding-bottom: 40px;" @click="selectItem" @dragover="dragoverParent" @dragleave="dragleaveParent">
                        <nk-form :col="def.col||2" :edit="reviewEditMode">
                            <template v-for="(item,seq) in def.items">
                                <nk-form-divider v-if="(showHideFiled || item.control >= 0) && (item.inputType==='divider'||item.inputType==='-'||item.inputType==='--')"
                                                 :key="item.key"
                                                 :options="item.inputOptions"
                                                 @dragover="dragover(item)"
                                                 @dragstart="dragstart(item)"
                                                 @dragend="dragend"
                                                 @click="selectItem($event,item)"
                                                 :draggable="editMode?'true':'false'"
                                                 :class="{
                                                         dropable:editMode,
                                                         'b':true,
                                                         'selected':item._selected,
                                                         'nk-primary-border-color-important':item._selected,
                                                         'drop':item._drop,
                                                         'hide':item.control < 0,
                                                         'searched': filter && ((item.key&&item.key.indexOf(filter) > -1) || (item.name&&item.name.indexOf(filter) > -1))
                                                     }"
                                                 :title="item.name">
                                    <a-popconfirm @confirm="remove(def.items,seq+1)" :title="`移除[${item.name}]?`">
                                        <a-icon type="close" v-if="editMode && item._selected" style="position: absolute;right: -25px;top:-15px;cursor: pointer;"/>
                                    </a-popconfirm>
                                </nk-form-divider>
                                <nk-form-item    v-else-if="(showHideFiled || item.control >= 0)"
                                                 :key="item.key"
                                                 :options="item" @dragover="dragover(item)" @dragstart="dragstart(item)" @dragend="dragend" @click="selectItem($event,item)"
                                                 :draggable="editMode?'true':'false'"
                                                 :class="{
                                                         dropable:editMode,
                                                            'b':true,
                                                            'selected':item._selected,
                                                            'nk-primary-border-color-important':item._selected,
                                                            'drop':item._drop,
                                                            'hide':item.control < 0,
                                                            'searched': filter && ((item.key&&item.key.indexOf(filter) > -1) || (item.name&&item.name.indexOf(filter) > -1))
                                                       }"
                                                 :title="item.name"
                                                 :width="def.titleWidth||undefined"
                                                 :ellipsis="def.titleEllipsis"
                                                 :col="item.col||1"
                                                 :edit="reviewEditMode && item.control > 0"
                                                 style="position: relative;"
                                                 :required="item.required"
                                                 :content-align="item.alignRight?'right':''"
                                                 :ignoreValidate="true"
                                >
                                    <component :is="item.inputType"
                                               :slot="reviewEditMode && item.control > 0?'edit':'default'"
                                               :editMode="reviewEditMode && item.control > 0"
                                               :input-options="item.inputOptions"
                                               :style="item.style"
                                               :designMode="true"
                                               v-model="data[item.key]"
                                    ></component>
                                    <a-popconfirm :slot="reviewEditMode && item.control > 0?'edit':'default'" @confirm="remove(def.items,seq+1)" :title="`移除[${item.name}]?`">
                                        <a-icon type="close" v-if="editMode && item._selected" style="position: absolute;right: 5px;top:5px;cursor: pointer;z-index: 1000"/>
                                    </a-popconfirm>
                                </nk-form-item>
                            </template>
                        </nk-form>
                    </div>
                </a-card>
            </div>

            <!--面板区域-->
            <div class="propertiesPanel" style="width: 300px;flex-shrink: 0;border: solid 1px #e8e8e8;">
                <a-tabs v-model="activeKey">
                    <a-tab-pane v-if="editMode" key="lab" tab="组件库" style="margin-top: -14px;">
                        <div style="overflow-y: auto;max-height: 558px;">
                            <div v-for="inputType in inputTypeDefs" :key="inputType.key"
                                 @dragstart="dragstart(null,inputType)" @dragend="dragend" draggable="true"
                                 style="border: dashed 1px #eee;width:100%;cursor: move;">
                                <nk-form-item v-if="inputType.key" :title="inputType.name&&inputType.name.split('|')[1]">
                                    <div style="position: relative">
                                        <div style="position: absolute;z-index: 1;left: 0;top: 0;right: 0;bottom: 0;"></div>
                                        <component :is="inputType.key" :editMode="true"></component>
                                    </div>
                                </nk-form-item>
                                <div v-else style="padding-right: 50px;">
                                    <nk-form-divider title="分隔符">
                                    </nk-form-divider>
                                </div>
                            </div>
                        </div>
                    </a-tab-pane>
                    <a-tab-pane key="card" tab="卡片" style="margin-top: -14px;">
                        <div style="overflow-y: auto;max-height: 558px;padding: 8px 0;">
                            <slot name="card" :def="def"></slot>
                        </div>
                    </a-tab-pane>
                    <a-tab-pane v-if="selectedItem" key="field" :tab="selectedItem.inputType | formatInputType(inputTypeDefs)" style="margin-top: -14px;">
                        <div style="overflow-y: auto;max-height: 558px;padding: 8px 0;">
                            <slot name="field" :selectedItem="selectedItem"></slot>
                            <component v-if="fieldDefComponent"
                                       :is="fieldDefComponent"
                                       :edit-mode="editMode"
                                       :col="1"
                                       v-model="selectedItem.inputOptions"
                            ></component>
                        </div>
                    </a-tab-pane>
                </a-tabs>
            </div>
            <div v-if="dropItem" style="
                position: absolute;
                top: 0;left: 0;z-index: 1000;
                width: calc(100% - 300px);height: 43px;display:flex;justify-content: space-around;align-items: center;font-size: 18px;color: #999999;opacity: 0.5;" :style="{
                        'background-color':dropItem?'#ffa39e':'',
                        'border':dropItem?'#f5222d dashed 1px':'',
                    }" @dragenter="dragenterTrash">
                {{dropItem?'拖到此处移除字段':''}}
            </div>
        </div>
    </a-spin>
</template>

<script>

import MixinSortable from "@/utils/MixinSortable";

let mouseXY = {"x": null, "y": null};

function dragover(e) {
    mouseXY.x = e.clientX;
    mouseXY.y = e.clientY;
}

export default {
    mixins:[MixinSortable()],
    props:{
        title: String,
        def:Object,
        inputTypeDefs:Array,
        editMode:Boolean,
        filter:String,
        reviewEditMode: Boolean,
        showHideFiled: Boolean,
    },
    filters:{
        formatInputType(value,inputTypeDefs){
            if(inputTypeDefs){
                let d = inputTypeDefs.find(i=>i.value===value);
                if(d){
                    return d.name.split('|')[1];
                }
            }
            return value;
        }
    },
    mounted() {
        this.def.items.forEach(i=>{
            i._drop = undefined;
            i._selected = undefined;
        })
        document.addEventListener("dragover", dragover, false);
    },
    destroyed() {
        document.removeEventListener("dragover", dragover, false)
    },
    data(){
        return {
            dropItem: undefined,
            selectedItem: undefined,
            activeKey: this.editMode ? 'lab' : 'card',
            dragToTrash:false,
            data:{}
        }
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
        // 开始拖拽，设置设计面板中的字段为拖动状态
        dragstart: function (item,inputType) {
            if(item){
                this.dropItem = item;
                this.$set(this.dropItem,'_drop',true);
            }else{
                let key,index=0;
                do{
                    key = 'key'+index++;
                }while(this.def.items.find(i=>i.key===key));
                this.dropItem = {
                    key,
                    name: (inputType.name&&inputType.name.split('|')[1])+(--index),
                    col:1,
                    inputType: inputType.value,
                    calcTrigger:'',
                    calcOrder:1,
                    required:false,
                    control:1,
                    spELContent:'',
                    spELTriggers:[],
                    eval:'',
                    _drop:true,
                    _new:true
                };
            }
        },
        // 拖动到容器内部
        dragoverParent(){
            if(this.dropItem){
                this.$delete(this.dropItem,'_trash');
                if(this.def.items.indexOf(this.dropItem)===-1){
                    this.def.items.push(this.dropItem);
                    this.$forceUpdate();
                    this.$set(this.data,this.dropItem.key,undefined);
                }
            }
        },
        // 拖动到容器外部
        dragleaveParent(e){
            if(e.fromElement===e.target.parentElement){
                if(this.dropItem && this.dropItem._new){
                    let index = this.def.items.indexOf(this.dropItem);
                    if(index>=0){
                        this.def.items.splice(index,1);
                        this.$delete(this.data,this.dropItem.key);
                    }
                }
            }
        },
        dragend: function () {
            if(this.dropItem){
                if(this.dropItem._trash){
                    let index = this.def.items.indexOf(this.dropItem);
                    if(index>=0){
                        this.def.items.splice(index,1);
                        this.$delete(this.data,this.dropItem.key);
                    }
                    this.selectItem(undefined, undefined);
                }else if(this.def.items.indexOf(this.dropItem)>-1){
                    this.selectItem(undefined, this.dropItem);
                }
                this.$delete(this.dropItem,'_drop');
                this.$delete(this.dropItem,'_new');
                this.dropItem = undefined;

            }
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
        dragenterTrash(){
            this.$set(this.dropItem,'_trash',true);
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
        },
        remove(items,index){
            this.selectItem();
            this.$nkSortableRemove(items,index);
        }
    }
}
</script>


<style scoped lang="less">
.b{
    border: dashed 1px #eee;
}
.drop{
    border: dashed 1px red !important;
}
.selected{
    border-style: dashed;
    border-width: 1px;
}
.hide{
    opacity: 0.3;
    background-color: #ddd;
}
.searched{
    background-color: #ffe58f;
}
::v-deep .empty::before{
    content: '-'
}
.dropable{
    cursor: move;
}
</style>
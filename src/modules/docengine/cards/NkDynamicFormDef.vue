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
    <nk-def-card>
        <div slot="title" style="display: flex;align-items: center;justify-content: space-between;padding: 0 10px 0 0;">
            {{card.cardName+':卡片设计'}}
            <a-input placeholder="搜索字段Key、描述" size="small" style="width: 40%;" v-model="filter" allow-clear></a-input>
        </div>
        <span slot="extra">
            <a-button-group size="small" style="margin-right: 10px;">
                <a-button @click="reviewEditMode=false"           :type="reviewEditMode?'default':'primary'">显示</a-button>
                <a-button @click="reviewEditMode=true"            :type="reviewEditMode?'primary':'default'">编辑</a-button>
            </a-button-group>
            <a-button size="small" @click="showHideFiled=!showHideFiled"   :type="showHideFiled?'primary':'default'">展示全部</a-button>
        </span>

        <nk-form-designer :title="card.cardName"
                          :edit-mode="editMode"
                          :def="def"
                          :input-type-defs="inputTypeDefs"
                          :filter="filter"
                          :review-edit-mode="reviewEditMode"
                          :show-hide-filed="showHideFiled"
        >
            <template v-slot:card="{def}">
                <nk-form :col="1" :edit="editMode" style="width:100%;">
                    <nk-form-item title="列数量">
                        {{def.col}}
                        <a-input-number v-model="def.col" slot="edit" size="small" :min="1" :max="24" />
                    </nk-form-item>
                    <nk-form-item title="标题宽度">
                        {{def.titleWidth}}
                        <a-input-number v-model="def.titleWidth" slot="edit" size="small" :min="60" :max="300" />
                    </nk-form-item>
                    <nk-form-item title="标题省略号">
                        {{def.titleEllipsis}}
                        <a-switch v-model="def.titleEllipsis" slot="edit" size="small" />
                    </nk-form-item>
                    <nk-form-item title="文件批量下载">
                        {{def.downLoadFile}}
                        <a-switch v-model="def.downLoadFile" slot="edit" size="small" />
                    </nk-form-item>
                    <slot name="header"></slot>
                </nk-form>
            </template>
            <template v-slot:field="{selectedItem}">
                <nk-form :edit="editMode" :col="1">
                    <nk-form-item title="KEY">
                        {{selectedItem.key}}
                        <a-input slot="edit" size="small" v-model="selectedItem.key" @change="keyChanged" />
                    </nk-form-item>
                    <nk-form-item title="描述">
                        {{selectedItem.name}}
                        <a-input slot="edit" size="small" v-model="selectedItem.name" />
                    </nk-form-item>
                    <template v-if="selectedItem.inputType!=='-'">
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
                    </template>
                    <template v-else>
                        <nk-form-item title="分隔器样式">
                            {{selectedItem.inputOptions.dividerStyle}}
                            <a-select slot="edit" size="small" v-model="selectedItem.inputOptions.dividerStyle" >
                                <a-select-option key="separator" >分隔符</a-select-option>
                                <a-select-option key="tips" >文字提示</a-select-option>
                            </a-select>
                        </nk-form-item>
                    </template>
                    <nk-form-item title="控制">
                        {{selectedItem.control===1 ?'读写':(selectedItem.control===0 ?'只读':'隐藏')}}
                        <a-select slot="edit" size="small" v-model="selectedItem.control" >
                            <a-select-option :key="1" >读写</a-select-option>
                            <a-select-option :key="0" >只读</a-select-option>
                            <a-select-option :key="-1">隐藏</a-select-option>
                        </a-select>
                    </nk-form-item>
                    <nk-form-item title="控制 SpEL">
                        {{selectedItem.spELControl}}
                        <nk-sp-el-editor slot="edit" v-model="selectedItem.spELControl"></nk-sp-el-editor>
                    </nk-form-item>
                    <template v-if="selectedItem.inputType!=='-'">
                        <nk-form-item title="值条件 SpEL">
                            {{selectedItem.spELTriggers}}
                            <a-select slot="edit" size="small" v-model="selectedItem.spELTriggers" mode="multiple" >
                                <a-select-option key="ALWAYS">ALWAYS</a-select-option>
                                <a-select-option key="INIT">INIT</a-select-option>
                                <a-select-option key="BLANK">BLANK</a-select-option>
                            </a-select>
                        </nk-form-item>
                        <nk-form-item title="值 SpEL">
                            {{selectedItem.spELContent}}
                            <nk-sp-el-editor slot="edit" v-model="selectedItem.spELContent"></nk-sp-el-editor>
                        </nk-form-item>
                    </template>
                </nk-form>
            </template>
        </nk-form-designer>
    </nk-def-card>
</template>

<script>
import MixinDef from "./MixinDef";
import MixinSortable from "../../../utils/MixinSortable";
import MixinDynamicDef from "./MixinDynamicDef";
import NkFormDesigner from "./NkFormDesigner"


export default {
    mixins:[new MixinDef({
      col:2,
      titleWidth:120
    }),MixinSortable(),MixinDynamicDef],
    components:{
        NkFormDesigner
    },
    data(){
        return {
            inputTypeDefs:undefined,
            filter:undefined,
            reviewEditMode: true,
            showHideFiled: false,
        }
    },
    mounted() {
        this.nk$callDef()
            .then(res=>{
                this.inputTypeDefs = res;
                this.inputTypeDefs.push({value:'-',name:'-- | 分隔'})
            });
    },
}
</script>
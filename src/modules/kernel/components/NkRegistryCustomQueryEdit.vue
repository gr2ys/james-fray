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
    <div v-if="json" style="width: 100%;">
        <nk-form :col="1">
            <nk-form-item title="标题">
                <a-input size="small" v-model="json.title" style="max-width: 200px;" placeholder="页面标题"></a-input>
            </nk-form-item>
            <nk-form-item title="启用预览">
                <a-switch size="small" v-model="json.preview"></a-switch>
            </nk-form-item>
            <nk-form-item title="界面宽度">
                <a-input size="small" v-model="json.width" style="max-width: 150px;" placeholder="仅对话框有效，如60%"></a-input>
            </nk-form-item>
            <nk-form-item title="默认条目数">
                <a-select size="small" v-model="json.defaultRows" style="max-width: 100px;" placeholder="默认10">
                    <a-select-option :key="10">10</a-select-option>
                    <a-select-option :key="15">15</a-select-option>
                    <a-select-option :key="20">20</a-select-option>
                    <a-select-option :key="50">50</a-select-option>
                    <a-select-option :key="100">100</a-select-option>
                </a-select>
            </nk-form-item>
            <nk-form-item title="索引">
                <a-input size="small" v-model="json.index" style="max-width: 200px;" placeholder="ES索引名称，默认document"></a-input>
            </nk-form-item>
            <nk-form-item title="数据过滤">
                <a-textarea size="small" v-model="postCondition" :rows="8" placeholder="ES查询表达式，严格JSON格式"></a-textarea>
                <span class="nk-error-color" v-if="errorPostCondition">{{ errorPostCondition }}</span>
            </nk-form-item>
            <nk-form-item title="检索条件">
                <vxe-button size="mini" icon="fa fa-plus" status="perfect" @click="addSearchItemsDefault">添加</vxe-button>
                <vxe-table ref="xTableSearchItemsDefault"
                           row-key
                           auto-resize
                           resizable
                           size="mini"
                           border=inner
                           show-header-overflow="tooltip"
                           show-overflow="tooltip"
                           highlight-hover-row
                           style="width: 100%;margin-top: 5px;"
                           :edit-config="{trigger: 'click', mode: 'row', showIcon: true, showStatus: true}"
                           :data="json.searchItemsDefault"
                >
                    <vxe-column title="名称"
                                field="name" width="12%"
                                :edit-render="{name:'$input'}"></vxe-column>
                    <vxe-column title="列"
                                field="field" width="25%" :edit-render="{}">
                        <template #default="{seq,row}">{{row.field}}</template>
                        <template #edit="{seq,row}">
                            <a-input :default-value="row.field && (typeof row.field === 'object' ? row.field.join(',') : row.field)" size="small" @change="setFieldValue($event,row)"></a-input>
                        </template>
                    </vxe-column>
                    <vxe-column title="组件"
                                field="component" width="10%"
                                :edit-render="{name:'$select',options:[
                                    {value:'nk-search-options-text',label:'模糊'},
                                    {value:'nk-search-options-suggest',label:'建议'},
                                    {value:'nk-search-options-single',label:'单选'},
                                    {value:'nk-search-options-multiple',label:'多选'},
                                    {value:'nk-search-options-date-range',label:'日期区间'},
                                    {value:'nk-search-options-number-range',label:'数字区间'},
                                ]}"></vxe-column>
                    <vxe-column title="占位符"
                                field="placeholder" width="12%"
                                :edit-render="{name:'$input'}"></vxe-column>
                    <vxe-column title="Min"
                                field="min" width="10%"
                                :edit-render="{name:'$input'}"></vxe-column>
                    <vxe-column title="Max"
                                field="max" width="10%"
                                :edit-render="{name:'$input'}"></vxe-column>
                    <vxe-column title="Agg"
                                field="agg" width="10%"
                                :edit-render="{name:'$switch'}"></vxe-column>
                    <vxe-table-column>
                        <template v-slot="{seq,row}">
                            <span class="drag-btn" style="margin-right: 10px;">
                                <i class="vxe-icon--menu"></i>
                            </span>
                            <span style="margin-right: 10px;" @click="$nkSortableRemove(json.searchItemsDefault,seq)">
                                <i class="vxe-icon--remove"></i>
                            </span>
                        </template>
                    </vxe-table-column>
                </vxe-table>
            </nk-form-item>
            <nk-form-item title="更多条件">
                <vxe-button size="mini" icon="fa fa-plus" status="perfect" @click="addSearchItemsMoreDef">添加</vxe-button>
                <vxe-table ref="xTableSearchItemsMoreDef"
                           row-key
                           auto-resize
                           resizable
                           size="mini"
                           border=inner
                           show-header-overflow="tooltip"
                           show-overflow="tooltip"
                           highlight-hover-row
                           style="width: 100%;margin-top: 5px;"
                           :edit-config="{trigger: 'click', mode: 'row', showIcon: true, showStatus: true}"
                           :data="json.searchItemsMoreDef"
                >
                    <vxe-column title="名称"
                                field="name" width="12%"
                                :edit-render="{name:'$input'}"></vxe-column>
                    <vxe-column title="列"
                                field="field" width="25%" :edit-render="{}">
                        <template #default="{seq,row}">{{row.field}}</template>
                        <template #edit="{seq,row}">
                            <a-input :default-value="row.field && (typeof row.field === 'object' ? row.field.join(',') : row.field)" size="small" @change="setFieldValue($event,row)"></a-input>
                        </template>
                    </vxe-column>
                    <vxe-column title="组件"
                                field="component" width="10%"
                                :edit-render="{name:'$select',options:[
                                    {value:'nk-search-options-text',label:'模糊'},
                                    {value:'nk-search-options-suggest',label:'建议'},
                                    {value:'nk-search-options-single',label:'单选'},
                                    {value:'nk-search-options-multiple',label:'多选'},
                                    {value:'nk-search-options-date-range',label:'日期区间'},
                                    {value:'nk-search-options-number-range',label:'数字区间'},
                                ]}"></vxe-column>
                    <vxe-column title="占位符"
                                field="placeholder" width="12%"
                                :edit-render="{name:'$input'}"></vxe-column>
                    <vxe-column title="Min"
                                field="min" width="10%"
                                :edit-render="{name:'$input'}"></vxe-column>
                    <vxe-column title="Max"
                                field="max" width="10%"
                                :edit-render="{name:'$input'}"></vxe-column>
                    <vxe-column title="Agg"
                                field="agg" width="10%"
                                :edit-render="{name:'$switch'}"></vxe-column>
                    <vxe-table-column>
                        <template v-slot="{seq,row}">
                            <span class="drag-btn" style="margin-right: 10px;">
                                <i class="vxe-icon--menu"></i>
                            </span>
                            <span style="margin-right: 10px;" @click="$nkSortableRemove(json.searchItemsMoreDef,seq)">
                                <i class="vxe-icon--remove"></i>
                            </span>
                        </template>
                    </vxe-table-column>
                </vxe-table>
            </nk-form-item>
            <nk-form-item title="数据列">
                <vxe-button size="mini" icon="fa fa-plus" status="perfect" @click="addColumn">添加</vxe-button>
                <vxe-table ref="xTableColumns"
                           row-key
                           auto-resize
                           resizable
                           size="mini"
                           border=inner
                           show-header-overflow="tooltip"
                           show-overflow="tooltip"
                           highlight-hover-row
                           style="width: 100%;"
                           :edit-config="{trigger: 'click', mode: 'row', showIcon: true, showStatus: true}"
                           :data="json.columns"
                >
                    <vxe-column title="名称"
                                field="title" width="12%"
                                :edit-render="{name:'$input'}"></vxe-column>
                    <vxe-column title="字段"
                                field="field" width="18%"
                                :edit-render="{name:'$input'}"></vxe-column>
                    <vxe-column title="宽度"
                                field="width" width="10%"
                                :edit-render="{name:'$input'}"></vxe-column>
                    <vxe-column title="列类型"
                                field="type" width="12%"
                                :edit-render="{name:'$select',options:[{value:undefined,label:'默认'},{value:'html',label:'高亮'},{value:'seq',label:'序号'}]}"></vxe-column>
                    <vxe-column title="格式化"
                                field="formatter" width="15%" :edit-render="{}">
                        <template #default="{seq,row}">{{row.formatter}}</template>
                        <template #edit="{seq,row}">
                            <a-select size="small" :default-value="row.formatter&&row.formatter.join(' ')" :options="[
                                {value:'docLink docId',             label:'docLink'},
                                {value:'nkDatetime',                label:'date'},
                                {value:'nkDatetimeFriendly',        label:'datetime'},
                                {value:'nkDatetimeISO',             label:'datetimeISO'},
                                {value:'nkCurrency',                label:'currency'},
                                {value:'nkNumber',                  label:'number'},
                                {value:'nkPercent',                 label:'percent'},
                            ]">
                            </a-select>
                        </template>
                    </vxe-column>
                    <vxe-column title="排序"
                                field="sortable" width="10%"
                                :edit-render="{name:'$switch'}"></vxe-column>
                    <vxe-column title="排序字段"
                                field="orderField" width="12%"
                                :edit-render="{name:'$input'}"></vxe-column>
                    <vxe-table-column>
                        <template v-slot="{seq,row}">
                            <span class="drag-btn" style="margin-right: 10px;">
                                <i class="vxe-icon--menu"></i>
                            </span>
                            <span style="margin-right: 10px;" @click="$nkSortableRemove(json.columns,seq)">
                                <i class="vxe-icon--remove"></i>
                            </span>
                        </template>
                    </vxe-table-column>
                </vxe-table>
            </nk-form-item>
        </nk-form>
    </div>
    <div v-else>
        <nk-form :col="1">
            <nk-form-item title="值">
                <a-textarea v-model="text" :auto-size="{minRows:5,maxRows:20}"></a-textarea>
                <span class="nk-error-color">{{ error }}</span>
            </nk-form-item>
        </nk-form>
    </div>
</template>

<script>
import MixinSortable from "../../../utils/MixinSortable";
export default {
    mixins:[MixinSortable()],
    props:{
        value: {},
    },
    data(){
        return {
            json:undefined,
            textPostCondition:undefined,
            txt:undefined,
            error:undefined,
            errorPostCondition:undefined
        }
    },
    created() {
        this.$nkSortableVxeTable(true);
        if(!this.value){
            this.json = {};
            this.$emit("input", {});
        }else if(typeof this.value === 'string'){
            try{
                this.json = JSON.parse(this.value);
                this.error = undefined;
            }catch (e){
                this.error = e;
                this.json = undefined;
                this.txt = this.value;
            }
        }else{
            this.json = this.value;
            this.error = undefined;
        }
    },
    watch:{
        value(){
            if(typeof this.value === 'string'){
                try{
                    this.json = JSON.parse(this.value);
                    this.error = undefined;
                }catch (e){
                    this.error = e;
                    this.json = undefined;
                    this.txt = this.value;
                }
            }else{
                this.json = this.value;
                this.error = undefined;
            }
        },
        json:{
            deep:true,
            handler(){
                if(!this.error)
                    this.$emit("input",this.json);
            }
        }
    },
    computed:{
        postCondition:{
            get(){
                if(this.textPostCondition){
                    return this.textPostCondition;
                }
                return JSON.stringify(this.json.postCondition,null,4);
            },
            set(str){
                this.textPostCondition = str;
                try{
                    this.json.postCondition = JSON.parse(str);
                    this.errorPostCondition = undefined;
                }catch (e){
                    this.errorPostCondition = e;
                }
            }
        },
        text:{
            get(){
                return this.txt;
            },
            set(v){
                try{
                    this.txt = v;
                    this.$emit("input",JSON.parse(v));
                    this.error = undefined;
                }catch (e) {
                    this.error = e;
                }
            }
        }
    },
    methods:{
        addSearchItemsDefault(){
            if(!this.json.searchItemsDefault){
                this.$set(this.json,'searchItemsDefault',[]);
            }
            let row = {};
            this.json.searchItemsDefault.push(row)
            this.$refs.xTableSearchItemsDefault.setActiveRow(row);
        },
        addSearchItemsMoreDef(){
            if(!this.json.searchItemsMoreDef){
                this.$set(this.json,'searchItemsMoreDef',[]);
            }
            let row = {};
            this.json.searchItemsMoreDef.push(row)
            this.$refs.xTableSearchItemsMoreDef.setActiveRow(row);
        },
        addColumn(){
            if(!this.json.columns){
                this.$set(this.json,'columns',[]);
            }
            let row = {};
            this.json.columns.push(row)
            this.$refs.xTableColumns.setActiveRow(row);
        },
        setFieldValue(e,row){
            if(e.target.value){
                const values = e.target.value.split(',');
                row.field = values.length > 1 ? values : values[0];
            }else{
                row.field = undefined;
            }
        }
    }
}
</script>

<style scoped>

</style>
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
    <nk-form :col="1">
        <nk-form-item title="选项">
            <vxe-table ref="xTable"
                       row-key
                       auto-resize
                       resizable
                       size="mini"
                       border=inner
                       show-header-overflow="tooltip"
                       show-overflow="tooltip"
                       highlight-hover-row
                       max-height="400"
                       style="width: 100%;"
                       :edit-config="{trigger: 'click', mode: 'row', showIcon: true, showStatus: true}"
                       :data="list"
            >
                <vxe-column title="名称"
                            field="label" width="30%"
                            :edit-render="{name:'$input'}"></vxe-column>
                <vxe-column title="值"
                            field="value" width="40%"
                            :edit-render="{name:'$input'}"></vxe-column>
                <vxe-column></vxe-column>
            </vxe-table>
            <span v-if="!list" class="nk-error-color">数据类型不正确，可尝试切换数据类型</span>
        </nk-form-item>
    </nk-form>
</template>

<script>
export default {
    props:{
        value: {},
    },
    created() {
    },
    computed:{
        list(){
            if(this.value instanceof Array){
                return this.value;
            }
            return undefined;
        }
    },
    methods:{
    }
}
</script>

<style scoped>

</style>
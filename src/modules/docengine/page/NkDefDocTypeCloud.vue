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
    <a-card title="云同步">
        <nk-form ref="form" size="small" :col="1" :edit="editMode">
            <nk-form-item term="云推送">
                {{docDef.cloudSyncEnablePush ? '启用':'不启用'}}
                <a-select size="small" slot="edit" v-model="docDef.cloudSyncEnablePush" style="width: 100px;">
                    <a-select-option :value="1">启用</a-select-option>
                    <a-select-option :value="null">不启用</a-select-option>
                </a-select>
            </nk-form-item>
            <nk-form-item term="云订阅">
                {{docDef.cloudSyncSubscribeId}}
                <a-input size="small" slot="edit" v-model="docDef.cloudSyncSubscribeId" style="width: 280px;" placeholder="服务ID，仅对CLOUD节点生效"></a-input>
            </nk-form-item>
        </nk-form>
    </a-card>
</template>

<script>
export default {
    props:{
        editMode:Boolean,
        docDef:Object,
        docOptions:Object,
        card:Object
    },
    data(){
        return {
        }
    },
    created() {
    },
}
</script>

<style scoped>

</style>
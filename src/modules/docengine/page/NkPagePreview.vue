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
    <div class="preview">
        <div class="background" @click="hide">
            <div class="buttons">
                <div class="prev" @click="to(-1,$event)">
                    <a-icon type="left" />
                </div>
                <div class="next" @click="to( 1,$event)">
                    <a-icon type="right" />
                </div>
            </div>
        </div>
        <div class="foreground">
            <nk-page-doc-detail v-if="params" :params="params" :preview="true">
                <nk-doc-link :doc="params" type="primary" slot="buttons"><a-icon type="enter" /></nk-doc-link>
            </nk-page-doc-detail>
        </div>
    </div>
</template>

<script>
import NkPageDocDetail from "./NkPageDocDetail";
export default {
    components:{
        NkPageDocDetail
    },
    props:{
        params:Object,
        value:{
            type:Boolean,
            default:false
        }
    },
    mounted() {
        window.addEventListener("keydown",this.keydown)
    },
    destroyed() {
        window.removeEventListener("keydown",this.keydown)
    },
    methods:{
        hide(){
            this.$emit("close");
        },
        to(s,e){
            this.$emit("to",s);
            e.stopPropagation();
        },
        keydown(e){
            if(e.key==='Escape'){
                this.$emit("close");
            }
        },
    }
}
</script>

<style scoped lang="less">
    .preview{
        position: fixed;
        z-index: 11;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        .background{
            position: fixed;
            width: 100%;
            height: 100%;
            background-color: #2b2b2b;
            opacity: 0.5;

            .buttons{
                width: 35%;
                height: 100px;
                position: absolute;
                bottom: 0;
                display: flex;
            }

            .prev{
                width: 50%;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 48px;
                cursor: pointer;
                color: white;
                &:hover{
                    background-color: #fff;
                    color: #2b2b2b;
                }
            }
            .next{
                width: 50%;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 48px;
                cursor: pointer;
                color: white;
                &:hover{
                    background-color: #fff;
                    color: #2b2b2b;
                }
            }
        }
        .foreground{
            position: absolute;
            width: 65%;
            min-width: 840px;
            max-width: 1440px;
            height: 100%;
            right: 0;
            background-color: #f0f2f5;
            overflow-y: auto;
            overflow-x: hidden;

            &::-webkit-scrollbar{
            }
        }
    }
</style>
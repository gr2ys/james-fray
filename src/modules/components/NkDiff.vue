<template>
    <div class="container">
        <template v-if="mode.toLowerCase()==='unified'">
            <div v-for="(line,index) in list" :key="index" class="line" :class="{unified:mode.toLowerCase()==='unified'}">

                <template v-if="line.added || line.removed">
                    <div class="code" v-if="line.removed" :class="{removed:line.removed,ignore:line.disabled}">
                        <pre class="lineNumber">{{line.lLineNum}}</pre>
                        <pre class="lineNumber"></pre>
                        <pre>{{line.lValue}}</pre>
                    </div>

                    <div class="code" v-if="line.added" :class="{added:line.added,ignore:line.disabled}">
                        <pre class="lineNumber"></pre>
                        <pre class="lineNumber">{{line.rLineNum}}</pre>
                        <pre>{{line.rValue}}</pre>
                    </div>
                </template>

                <div class="code" v-else>
                    <pre class="lineNumber">{{line.lLineNum}}</pre>
                    <pre class="lineNumber">{{line.rLineNum}}</pre>
                    <pre>{{line.lValue}}</pre>
                </div>


            </div>
        </template>
        <template v-else>
            <div v-for="(line,index) in list" :key="index" class="line">
                <div class="code l" :class="{removed:line.removed,ignore:line.disabled}">
                    <pre>{{line.lValue}}</pre>
                    <pre class="lineNumber">{{line.lLineNum}}</pre>

                    <template v-if="mergeable">
                        <div class="opt" v-if="line.disabled"></div>
                        <div class="opt p" v-else-if="(line.added||line.removed)&&!line.merged" @click="merge(line,index)">
                            <a-icon type="double-right" />
                        </div>
                        <div class="opt p" v-else-if="line.merged" @click="undoMerge(line,index)">
                            <a-icon type="undo" />
                        </div>
                        <div class="opt" v-else>
                        </div>
                    </template>
                </div>
                <div class="code r" :class="{added  :line.added,ignore:line.disabled}">
                    <pre class="lineNumber">{{line.rLineNum}}</pre>
                    <pre>{{line.rValue}}</pre>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
export default {
    props:{
        data:Array,
        mode:{
            type:String,
            default: 'Unified'
        },
        mergeable:Boolean
    },
    data(){
        return {
            list: undefined,
        }
    },
    created() {
        const ret = [];
        let lCount = 0;
        let rCount = 0;
        let removedPrev = undefined;

        this.data && this.data.forEach(line=>{
            let item = {
                ignore:line.ignore,
                disabled:line.disabled
            };
            if(line.added){
                item = removedPrev||item;
                item.rValue   = line.value;
                item.rLineNum = this.lineNumber(line.count,rCount)
                item.rValueOld= undefined;
                item.added    = true;
                item.removed  = true;
                rCount       += line.count;
                if(removedPrev){
                    removedPrev   = undefined;
                    return;
                }
            }else if(line.removed){
                item.lValue   = line.value;
                item.lLineNum = this.lineNumber(line.count,lCount)
                item.rValueOld= undefined;
                item.removed  = true;
                lCount       += line.count;
                removedPrev   = item;
            }else{
                item.lValue   = line.value;
                item.lLineNum = this.lineNumber(line.count,lCount)
                lCount       += line.count;

                item.rValue   = line.value;
                item.rLineNum = this.lineNumber(line.count,rCount)
                rCount       += line.count;
                removedPrev   = undefined;
            }
            ret.push(item);
        })

        this.list = ret;
        this.$emit("change",this.list.map(item=>item.rValue).join(''));
    },
    methods:{
        lineNumber(count, from){
            let nums = [];
            for(let i=0;i<count;i++){
                nums.push(from+i+1);
            }
            return nums.join('\n');
        },
        merge(line){
            line.rValueOld = line.rValue;
            line.rValue    = line.lValue;
            line.added     = false;
            line.removed   = false;
            this.$set(line,'merged',true);
            this.$emit("change",this.list.map(item=>item.rValue).join(''));
        },
        undoMerge(line){
            line.rValue    = line.rValueOld;
            line.added     = true;
            line.removed   = true;
            line.rValueOld = undefined;
            this.$set(line,'merged',false);
            this.$emit("change",this.list.map(item=>item.rValue).join(''));
        }
    }
}
</script>

<style scoped lang="less">
    .container{
        border: solid 1px #ddd;
        overflow-y: auto;
    }
    .line{
        display: flex;
        &.unified{
            display: block;
        }
        .code{
            background-color: #fcfcfc;
            width: 100%;
            display: flex;

            .opt{
                height: 100%;
                width: 20px;
                display: flex;
                align-items: center;
                background-color: #eee;
                user-select: none;

                &.p{
                    cursor: pointer;
                }
            }

            pre{
                margin: 0;
                width: 100%;
                &::-webkit-scrollbar{
                    display: none;
                }
            }
            pre.lineNumber{
                display: block;
                width: 40px;
                background-color: #eee;
                flex-shrink: 0;
                padding: 0 2px;
                color: #999;
                user-select: none;
            }
            &.r pre.lineNumber{
                text-align: right;
            }
            &.added{
                &,pre.lineNumber,.opt{
                    background-color: #CEF5D7;
                }
            }
            &.removed{
                &,pre.lineNumber,.opt{
                    background-color: #F1C8CD;
                }
            }
            &.ignore{
                &,pre.lineNumber,.opt{
                    background-color: #ddd;
                }
            }
            &.l{
                width: 50%;
            }
            &.r{
                width: 50%;
            }
        }
    }
</style>
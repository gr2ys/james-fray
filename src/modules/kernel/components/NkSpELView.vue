<template>
    <pre><code>{{value}}</code></pre>
</template>

<script>
export default {
    props:{
        el:String,
        isJson:Boolean
    },
    computed:{
        value(){
            if(this.el && this.isJson){
                try{
                    return JSON.stringify(JSON.parse(this.el),null,4)
                }catch (e){
                    console.warn(e);
                }
            }
            return this.el;
        }
    }
}
</script>

<style scoped>
    pre{
        margin: 0;
        background-color: #f6f6f6;
        padding: 2px 5px;
        border-radius: 2px;
        min-height: 26px;
        max-height: 300px;
    }
</style>
<template>
    <a-input-number size            ="small"
                    v-model         ="numberValue"
                    :autoFocus      ="autoFocus"
                    :defaultValue   ="defaultValue"
                    :disabled       ="disabled"
                    :formatter      ="percentFormat"
                    :max            ="max"
                    :min            ="min"
                    :parser         ="percentParse"
                    :precision      ="precision"
                    :step           ="step"
                    @change="$emit('change',$event)"
    ></a-input-number>
</template>

<script>
export default {
    props:{
        value: Number,
        autoFocus: Boolean,
        defaultValue: Number,
        disabled: Boolean,
        max: Number,
        min: Number,
        precision: {
            type: Number,
            default:4
        },
        step: Number
    },
    computed:{
        numberValue:{
            get(){
                return this.value && this.value * 100
            },
            set(v){
                this.$emit("input",(v||undefined) && v*0.01);
            }
        }
    },
    methods:{
        percentParse(value){
            return value && value.replace(/[,%]/, '');
        },
        percentFormat(value){
            return value && (value+'%');
        },
    }
}
</script>

<style scoped>

</style>
<template>
    <a-range-picker size="small"
                    v-model="dateValue"

                    :allowClear          ="allowClear"
                    :autoFocus           ="autoFocus"
                    :disabled            ="disabled"
                    :disabledDate        ="disabledDate"
                    :getCalendarContainer="getCalendarContainer"
                    :placeholder         ="placeholder"
                    :inputReadOnly       ="inputReadOnly"

                    :defaultValue        ="defaultValue"
                    :defaultPickerValue  ="defaultPickerValue"
                    :disabledTime        ="disabledTime"
                    :format              ="format"
                    :ranges              ="ranges"
                    :separator           ="separator"
                    :showTime            ="showTime"
                    @change="$emit('change',$event)"
    ></a-range-picker>
</template>

<script>
import moment from 'moment';
export default {
    props:{
        value: Array,

        allowClear:{
            type:Boolean,
            default:true
        },
        autoFocus:Boolean,
        disabled:Boolean,
        disabledDate:{},
        getCalendarContainer:Function,
        placeholder:String,
        inputReadOnly:Boolean,

        defaultValue: Object,
        defaultPickerValue: Object,
        disabledTime: Function,
        format: {},
        showTime: {},
        ranges: {},
        separator: String
    },
    computed:{
        dateValue:{
            get(){
                return this.value && this.value.map(i=>new moment(i*1000));
            },
            set(v){
                this.$emit("input",v && v.map(i=>i.unix()));
            }
        }
    }
}
</script>

<style scoped>

</style>
<template>
    <a-date-picker size                 ="small"
                   v-model              ="dateValue"

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
                   :showTime            ="showTime"
                   :showToday           ="showToday"
                   @change="$emit('change',$event)"
    ></a-date-picker>
</template>

<script>
import moment from 'moment';
export default {
    props:{
        value: Number,

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
        showToday: {
            type:Boolean,
            default:true
        }
    },
    computed:{
        dateValue:{
            get(){
                return this.value && moment(this.value * 1000)
            },
            set(v){
                this.$emit("input",v && v.unix());
            }
        }
    }
}
</script>

<style scoped>

</style>
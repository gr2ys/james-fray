<template>
    <a-timeline>
        <span slot="pendingDot"><a-icon type="clock-circle-o" style="font-size: 12px;" /></span>
        <a-timeline-item v-for="(t) in list" :key="t.id" :color="t.endTime?'#e8e8e8':undefined" style="padding-bottom:10px;">
            <a-icon v-if="!t.endTime" slot="dot" type="clock-circle-o" style="font-size: 12px;" />
            <p style="margin: 0 0 15px;padding: 2px 0 0 15px;">
                {{t.name}}
                <span style="color: #ccc;padding-left: 10px;">{{ t.createTime | nkDatetimeFriendly}} </span>
            </p>
            <a-comment v-for="item in t.comments" :key="item.id">
                <a-avatar slot="avatar" size="small" style="color: #f56a00; background-color: #fde3cf;margin-left: 10px;">
                    {{ item.user && item.user.length > 2 ? item.user.substring(0,1) : item.user }}
                </a-avatar>
                <span slot="author" style="line-height: 22px;">
                    {{item.user || '匿名'}}
                </span>
                <span slot="datetime" style="line-height: 22px;">{{ item.time | nkDatetimeFriendly}}</span>
                <p slot="content">{{item.taskName}}{{ item.comment }}</p>
            </a-comment>
            <a-comment v-for="item in t.users" :key="item.id">
                <a-avatar slot="avatar" size="small" style="color: #f56a00; background-color: #fde3cf;margin-left: 10px;">
                    {{ item.realname && item.realname.length > 2 ? item.realname.substring(0,1) : item.realname }}
                </a-avatar>
                <span slot="author" style="line-height: 24px;">
                    {{item.realname || '匿名'}}
                </span>
            </a-comment>
        </a-timeline-item>
        <p v-if="task" slot="pending" style="padding: 2px 0 0 16px;margin-bottom: 0;">
            {{task.name}} 流转中...
            <slot name="assignee"></slot>
        </p>
    </a-timeline>
</template>

<script>
export default {
    name: "NkBpmTimeline",
    props:{
        task: {},
        histories: {
            type:Array,
            default(){
                return [];
            }
        }
    },
    computed:{
        list(){
            if(this.task){
                return this.histories.filter((item,index)=>index<this.histories.length);
            }
            return this.histories;
        }
    }
}
</script>

<style scoped lang="less">
::v-deep .ant-comment-inner{
    padding: 2px;
    .ant-comment-content-detail{
    }
}
</style>
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
  <a-spin class="nk-page-layout" :spinning="spinning">
    <div class="nk-page-layout-header">
      <slot name="top"></slot>
      <slot name="tips"></slot>
      <nk-sticky :stickyTop="-11" :z-index="11" class="layout-print-hide">
        <div class="nk-page-layout-stick" :class="{'show-right':headerIndent && rightBar && !layoutConfig.helperVisible}" style="padding-top: 20px;align-items: center;">
          <div class="nk-text-ellipsis">
            <span v-if="showStickyTitle" class="ant-page-header-heading-title ">{{title}}</span>
            <span v-if="showStickyTitle && subTitle" class="ant-page-header-heading-sub-title ">{{subTitle}}</span>
          </div>
          <slot name="tips"></slot>
          <slot name="action" style="flex-shrink: 0;padding-left: 10px;"></slot>
        </div>
      </nk-sticky>
      <slot name="custom"></slot>
      <a-page-header
          v-if="!$slots.custom"
          :title="title"
          :sub-title="subTitle"
          :class="{'show-right':headerIndent && rightBar && !layoutConfig.helperVisible}"
      >
        <slot name="title"      slot="title"></slot>
        <slot name="tags"       slot="tags"></slot>

        <slot name="footer"     slot="footer"></slot>
        <slot name="avatar"     slot="avatar"></slot>
        <slot name="backIcon"   slot="backIcon"></slot>
        <slot name="action"     slot="extra"></slot>
        <a-row class="main">
          <a-col :md="18" :sm="16" :xs="20">
            <slot name="content"></slot>
          </a-col>
          <a-col :md="6" :sm="8" :xs="4" style="position: relative;">
            <slot name="extra"></slot>
          </a-col>
        </a-row>
        <slot name="bottom"></slot>
      </a-page-header>
    </div>
    <slot name="default-top"></slot>
    <a-spin :spinning="loading">
      <div class="nk-page-layout-content">
        <div :class="{'content':true}">
          <slot></slot>
        </div>
        <div v-if="rightBar && !layoutConfig.helperVisible" class="right">
          <slot name="nav" />
        </div>
      </div>
    </a-spin>
  </a-spin>
</template>

<script>

import NkSticky from "../NkSticky";
import {mapState} from "vuex";
export default {
  name: "NkPageLayout",
  components: {
    NkSticky
  },
  props: {
    title:        String,
    subTitle:     String,
    spinning:     Boolean,
    loading:      Boolean,
    showStickyTitle: {
      type:Boolean,
      default:true
    },
    // 显示右边栏
    rightBar:     {
      type:Boolean,
      default:false
    },
    // 保持标题栏缩进
    headerIndent:  {
      type:Boolean,
      default:true
    }
  },
  computed:{
    ...mapState('NkDoc',[
      'layoutConfig'
    ]),
  }
}
</script>

<style lang="less" scoped>


.nk-page-layout-stick{
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 65px;
  background:white;
  border-bottom: 1px solid #e8e8e8;
  width: 100%;
  padding: 10px 54px 10px 32px;
  box-shadow:0 1px 4px rgba(0, 21, 41, 0.08);

  &.show-right{
    padding-right: 304px;
  }
}

.nk-page-layout{

  font-size: 12px;

  // 头部
  ::v-deep .nk-page-layout-header{
    background-color: #ffffff;
    border-bottom: 1px solid #e8e8e8;

    .ant-breadcrumb{
      margin: 4px 0;
    }
    .ant-page-header-heading{
      margin: 4px 0 0;
    }
    .ant-page-header-heading-title{
      font-size: 16px;
    }

    .ant-page-header{
      padding: 16px 54px 16px 32px;

      &.show-right{
        padding-right: 304px;
      }
    }
  }

  .nk-page-layout-content{

    display: flex;
    padding-bottom: 80px;

    // 内容
    .content{
      padding: 24px;
      width: 100%;
      overflow-x: auto;
      min-height: 400px;
    }

    // 右边栏
    .right{
      top: 30px;
      right: 0;
      width: 280px;
      flex-shrink: 0;

      &.show{
        display: none;
      }
    }
  }

  // 卡片样式
  ::v-deep .ant-card{
    .ant-card-head{
      min-height: 24px;
      .ant-card-head-title{
      }
    }
    .ant-card-body{
      padding: 16px;
    }
  }


  // 表单样式
  ::v-deep .ant-form-item{
    margin-bottom: 12px;
    label{
      font-size: 12px;
    }
    .ant-form-item-label{
      line-height: 29.9999px;
    }
    .ant-form-item-control{
      line-height: 30px;
    }
  }

  // 表格样式
  ::v-deep .vxe-toolbar{
    height: 36px;
    padding-bottom: 8px;
  }

  ::v-deep .vxe-table--header{
    background: #fafafa ;
  }
  ::v-deep .vxe-row-has-error{
    color: crimson;
  }

  // 状态样式
  ::v-deep .ant-statistic{
    .ant-statistic-title{
      font-size: 13px;
    }
    .ant-statistic-content{
      height: 32px;
      .ant-statistic-content-value{
        font-size: 18px;
      }
    }
  }
}

::v-deep .nk-layout-helper-visible{
  .nk-page-layout-content {
    .right {
      display: none;
    }
  }
}


@media screen and ( max-width: 1366px ){

  ::v-deep.nk-page-layout-header .ant-page-header{
    padding-right: 32px !important;
  }
  .nk-page-layout-stick{
    padding-right: 32px !important;
  }
  .nk-page-layout-content {
    .right {
      display: none;
    }
  }
}
@media screen and ( max-width: 768px ) {
    ::v-deep.nk-page-layout {
        .nk-page-layout-header{
            .ant-page-header{
                padding-left: 18px;
                padding-right: 18px;
            }
        }
        .nk-page-layout-content {
            // 内容
            .content {
                padding: 12px;
            }
        }
    }
    .main{
        //display: flex;
        //flex-direction: column-reverse;

        //::v-deep .ant-statistic{
        //    display: flex;
        //    border-bottom: dashed 1px #ccc;
        //    align-items: baseline;
        //    margin-bottom: 20px;
        //    .ant-statistic-content{
        //        margin-left: 10px;
        //    }
        //}
    }
}

@media screen and (max-width: 576px){
    ::v-deep .ant-page-header-heading-extra {
        display: block;
        float: right;
        width: unset;
        padding-top: unset;
        overflow: unset;
    }
}

@media print{
    ::v-deep.nk-page-layout-header .ant-page-header{
        padding-right: 32px !important;
    }
    .nk-page-layout-stick{
        padding-right: 32px !important;
    }
    .nk-page-layout-content {
        .right {
            display: none;
        }
    }
}
</style>

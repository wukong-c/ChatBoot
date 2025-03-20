<template>
  <div :class="'comTable special obtain ' + props.act">
    <el-table
      ref="tableRef"
      v-bind="$attrs"
      v-loading="loading"
      :data="tableData"
      class="table"
      border
      :empty-text="props.empty.isShow ? props.empty.value : '暂无数据'"
      :header-cell-style="{
        textAlign: 'center',
        backgroundColor: props.headBackground,
        color: '#333333',
        height: props.headHeight + 'px',
      }"
      :cell-style="{
        textAlign: 'center',
      }"
      :height="props.tableHeight || null"
      :cell-class-name="tableCellClassName"
      header-cell-class-name="comHeaderCell"
      scrollbar-always-on
    >
      <!-- 是否展示多选 -->
      <el-table-column v-if="props.showSelection" type="selection" width="60" />

      <!-- 是否展示序号 -->
      <el-table-column v-if="props.showIndex" label="序号" type="index" width="70">
        <template #default="{ $index }">
          {{ getIndex($index) }}
        </template>
      </el-table-column>

      <slot></slot>
    </el-table>
    <div v-if="props.showPage" class="pagination">
      <el-pagination
        style="text-align: right"
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="pageSizes"
        :current-page="pageInfo.pageNo"
        :page-size="pageInfo.pageSize"
        :total="total"
        background
        :disabled="loading"
        @size-change="sizeChange"
        @current-change="currentChange"
      >
      </el-pagination>
    </div>
  </div>
</template>
<script>
export default {
  name: "ComTable",
};
</script>
<script setup>
// 公共表格  -----name
import { ref } from "vue";
// 引入递归函数
import { fn } from "./recursion";
const tableRef = ref(null);
let tableData = ref([]);
let loading = ref(false);
let pageSizes = ref([10, 20, 30, 500]);
let total = ref(0);
let backupParams = ref(null);
let backupCallBack = ref(null);

const emits = defineEmits(["pageChange"]);

// 父组件参数
const props = defineProps({
  // 是否显示多选
  showSelection: {
    type: Boolean,
    default: false,
  },
  // 是否显示序号
  showIndex: {
    type: Boolean,
    default: true,
  },
  // 是否显示分页
  showPage: {
    type: Boolean,
    default: true,
  },
  // 是否显示分页
  showStep: {
    type: Boolean,
    default: false,
  },
  // 是否使用点击事件
  isClick: {
    type: Boolean,
    default: false,
  },
  // 是否使用递归函数
  isRecursion: {
    type: Boolean,
    default: false,
  },
  // 表格高度
  tableHeight: {
    type: String,
    default: "",
  },
  // 表格头部颜色
  headBackground: {
    type: String,
    default: "#F7F8FA",
  },
  empty: {
    type: Object,
    default: () => {
      return {
        isShow: false,
        value: "数据加载中...",
      };
    },
  },
  // 表格头部高度
  headHeight: {
    type: String,
    default: "36",
  },
  pageInfo: {
    type: Object,
    default: () => {
      return { pageNo: 1, pageSize: 10 };
    },
  },
  act: {
    type: String,
    default: () => "",
  },
});

let pageInfo = ref(props.pageInfo);

// 父组件 需要调用的方法
const load = (option, callBack, page) => {
  if (!option?.api) return;
  loading.value = true;
  tableData.value = [];
  option.params = option.params || {};
  backupParams.value = option;
  backupCallBack.value = callBack;
  if (page && typeof page == "number") {
    pageInfo.value.pageNo = page;
  } else {
    pageInfo.value.pageNo = 1;
  }

  let P = {
    ...option.params,
    ...pageInfo.value,
    pageNum: pageInfo.value.pageNo,
  };
  if (props.showPage === false) {
    P = { ...option.params, pageSize: 100000, page: 1 };
  }
  if (option.api) {
    option
      .api(P)
      .then(res => {
        // 兼容处理：后端无数据不返data
        res.records = res.records || res.list || [];
        loading.value = false;
        if (res && typeof res == "object") {
          // 分页总数
          total.value = res.total || 0;
          tableData.value = res.records || res.list || res;
          //使用递归函数
          if (props.isRecursion) fn(tableData.value);

          callBack && callBack(res);
        }
      })
      .catch(() => {
        // 此处仅为以后某些改动的容错处理
        loading.value = false;
      });
  } else {
    loading.value = false;
    // $message.error("api 无效");
  }
};
//获取选中行
function getSelectionRows() {
  return tableRef.value.getSelectionRows();
}
const tableCellClassName = ({ row, column, rowIndex, columnIndex }) => {
  row.index = rowIndex;
  column.index = columnIndex;
  return "comCell";
};
function getIndex(index) {
  return (pageInfo.value.pageNo - 1) * pageInfo.value.pageSize + index + 1;
}
const setData = val => {
  tableData.value = val;
};
// load();
// 选择页数
const currentChange = page => {
  pageInfo.value.pageNo = page;
  load(backupParams.value, backupCallBack.value, page);
};
// pageSize 改变
const sizeChange = num => {
  pageInfo.value.pageSize = num;
  load(backupParams.value, backupCallBack.value);
};
// page 改变
const pageChange = (page, size) => {
  pageInfo.value.pageSize = size;
  load(backupParams.value, backupCallBack.value, page);
  emits("pageChange", { page, size });
};

//刷新数据
const refresh = () => {
  load(backupParams.value, backupCallBack.value, pageInfo.value.pageNo);
};
//清除
const clear = () => {
  backupCallBack.value = null;
  backupParams.value = null;
  tableData.value = [];
  total.value = 0;
};
// 暴露 子组件方法
defineExpose({
  falseData: setData,
  getSelectionRows,
  setData,
  load,
  pageChange,
  sizeChange,
  total,
  tableData,
  pageInfo,
  refresh,
  clear,
});
</script>

<style lang="scss">
.comTable {
  height: 100%;
  flex: 1;
  overflow: auto;
  background: #ffffff;
  padding: 16px;
  display: flex;
  flex-direction: column;
  .table {
    flex: 1;
    width: 100%;
    height: 100%;
    span.divide {
      padding: 0 6px;
      font-size: 12px;
      color: #2780fb;
    }
    .cell {
      .el-button:nth-of-type(n + 2) {
        position: relative;
        &::before {
          content: "";
          position: absolute;
          left: -7px;
          top: 50%;
          transform: translateY(-50%);
          width: 2px;
          height: 14px;
          background: #ebedee;
        }
      }
    }
  }
  .el-table {
    .el-table__inner-wrapper {
      .el-table__body-wrapper {
        .el-scrollbar {
          .el-scrollbar__wrap {
            .el-scrollbar__view {
              height: 100%;
              .el-table__body {
                tbody {
                  .el-table__row {
                    .tip {
                      cursor: pointer;
                      color: #fff;
                      padding: 2px 5px;
                      border-radius: 2px;
                      background-color: #409eff;
                    }
                    td {
                      padding: 4.5px 0;
                      .cell {
                        line-height: 30px;
                        border-radius: 4px;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      .el-table__header-wrapper {
        .el-table__header {
          thead {
            tr {
              height: 46px;
            }
          }
        }
      }
    }
  }
  .comHeaderCell {
    text-align: center;
  }
  .comCell {
    text-align: center;
    &.is-left {
      text-align: left;
    }
  }
}
</style>
<style lang="scss" scoped>
.pagination {
  height: 60px;
  :deep(.el-pagination) {
    margin-top: 20px;
    justify-content: flex-end;
    .el-pager {
      .number {
        height: 32px;
        background-color: #ffffff;
        border: 1px solid #dcdee0;
        border-radius: 2px;
        color: #323233;
        font-size: 14px;
      }
      .is-active {
        background-color: #2780fb;
        color: #ffffff;
        border: none;
      }
    }
    .el-pagination__jump {
      .el-input {
        width: 44px;
        min-width: 44px;
        .el-input__wrapper {
          border: 1px solid #dcdee0;
          box-shadow: none;
          border-radius: 2px;
        }
      }
    }
  }
}
.pt {
  padding-top: 50px;
}
</style>

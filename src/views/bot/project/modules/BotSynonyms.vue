<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['bot:synonyms:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['bot:synonyms:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['bot:synonyms:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['bot:synonyms:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="synonymsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />

      <el-table-column label="同义词名称" align="center" prop="synonymsName" />

      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['bot:synonyms:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['bot:synonyms:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改同义词对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="550px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="同义词名称" prop="synonymsName">
          <el-input v-model="form.synonymsName" placeholder="请输入同义词名称" />
        </el-form-item>

        <el-divider content-position="center">同义词条目信息</el-divider>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAddBotSynonymsList">添加</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="handleDeleteBotSynonymsList">删除</el-button>
          </el-col>
        </el-row>
        <el-table :data="botSynonymsListList" :row-class-name="rowBotSynonymsListIndex" @selection-change="handleBotSynonymsListSelectionChange" ref="botSynonymsList">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="序号" align="center" prop="index" width="50"/>
          <el-table-column label="同义词条目名称" prop="synonymsItemName" width="150">
            <template slot-scope="scope">
              <el-input v-model="scope.row.synonymsItemName" placeholder="请输入同义词条目名称" />
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listSynonyms, getSynonyms, delSynonyms, addSynonyms, updateSynonyms } from "@/api/bot/synonyms";

export default {
  name: "BotSynonyms",
  props: {
    projectId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 子表选中数据
      checkedBotSynonymsList: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 同义词表格数据
      synonymsList: [],
      // 同义词条目表格数据
      botSynonymsListList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        synonymsName: null,
        projectId: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        synonymsName: [
          { required: true, message: "同义词名称不能为空", trigger: "blur" }
        ],
        projectId: [
          { required: true, message: "项目ID不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.queryParams.projectId = this.projectId
    this.getList();
  },
  methods: {
    /** 查询同义词列表 */
    getList() {
      this.loading = true;
      listSynonyms(this.queryParams).then(response => {
        this.synonymsList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        synonymsId: null,
        synonymsName: null,
        projectId: this.projectId,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null
      };
      this.botSynonymsListList = [];
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.synonymsId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加同义词";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const synonymsId = row.synonymsId || this.ids
      getSynonyms(synonymsId).then(response => {
        this.form = response.data;
        this.botSynonymsListList = response.data.botSynonymsListList;
        this.open = true;
        this.title = "修改同义词";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.form.botSynonymsListList = this.botSynonymsListList;
          if (this.form.synonymsId != null) {
            updateSynonyms(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addSynonyms(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const synonymsIds = row.synonymsId || this.ids;
      this.$modal.confirm('是否确认删除同义词编号为"' + synonymsIds + '"的数据项？').then(function() {
        return delSynonyms(synonymsIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 同义词条目序号 */
    rowBotSynonymsListIndex({ row, rowIndex }) {
      row.index = rowIndex + 1;
    },
    /** 同义词条目添加按钮操作 */
    handleAddBotSynonymsList() {
      let obj = {};
      obj.synonymsItemName = "";
      this.botSynonymsListList.push(obj);
    },
    /** 同义词条目删除按钮操作 */
    handleDeleteBotSynonymsList() {
      if (this.checkedBotSynonymsList.length == 0) {
        this.$modal.msgError("请先选择要删除的同义词条目数据");
      } else {
        const botSynonymsListList = this.botSynonymsListList;
        const checkedBotSynonymsList = this.checkedBotSynonymsList;
        this.botSynonymsListList = botSynonymsListList.filter(function(item) {
          return checkedBotSynonymsList.indexOf(item.index) == -1
        });
      }
    },
    /** 复选框选中数据 */
    handleBotSynonymsListSelectionChange(selection) {
      this.checkedBotSynonymsList = selection.map(item => item.index)
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('bot/synonyms/export', {
        ...this.queryParams
      }, `synonyms_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>

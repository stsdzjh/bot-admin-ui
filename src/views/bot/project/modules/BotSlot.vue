<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="槽位名称" prop="slotName">
        <el-input
          v-model="queryParams.slotName"
          placeholder="请输入槽位名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="语术" prop="slotUtter">
        <el-input
          v-model="queryParams.slotUtter"
          placeholder="请输入槽位语术"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['bot:slot:add']"
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
          v-hasPermi="['bot:slot:edit']"
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
          v-hasPermi="['bot:slot:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['bot:slot:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="slotList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="槽位名称" align="center" prop="slotName">
        <template slot-scope="scope">
          <router-link :to="'/bot/slot/mappings/' + scope.row.projectId + '/' + scope.row.slotId" class="link-type">
            <span>{{scope.row.slotName}}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="槽位类型" align="center" prop="slotType">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.bot_slot_type" :value="scope.row.slotType"/>
        </template>
      </el-table-column>
      <el-table-column label="初始值" align="center" prop="initialValue" />
      <el-table-column label="影响会话" align="center" prop="influenceConversation">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_yes_no" :value="scope.row.influenceConversation"/>
        </template>
      </el-table-column>
      <el-table-column label="语术" align="left" prop="slotUtter" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['bot:slot:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['bot:slot:remove']"
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

    <!-- 添加或修改槽位信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="槽位名称" prop="slotName">
          <el-input v-model="form.slotName" placeholder="请输入槽位名称" />
        </el-form-item>
        <el-form-item label="语术" prop="slotUtter">
          <el-input v-model="form.slotUtter" placeholder="请输入语术" />
        </el-form-item>
        <el-form-item label="槽位类型" prop="slotType">
          <el-select v-model="form.slotType">
            <el-option
              v-for="dict in dict.type.bot_slot_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="初始值" prop="initialValue">
          <el-input v-model="form.initialValue" placeholder="请输入初始值" />
        </el-form-item>
        <el-form-item label="影响会话" prop="influenceConversation">
          <el-select v-model="form.influenceConversation" placeholder="是否影响会话" clearable>
            <el-option
              v-for="dict in dict.type.sys_yes_no"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>

        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { listSlot, getSlot, delSlot, addSlot, updateSlot } from "@/api/bot/slot";

export default {
  name: "BotSlot",
  dicts: ['sys_yes_no','bot_slot_type'],
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
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 槽位信息表格数据
      slotList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        slotName: null,
        slotUtter: null,
        slotType: null,
        initialValue: null,
        influenceConversation: null,
        projectId: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        slotName: [
          { required: true, message: "槽位名称不能为空", trigger: "blur" }
        ],
        projectId: [
          { required: true, message: "项目不能为空", trigger: "blur" }
        ],
      },
      slotTypeList: [
        { key: 'text', value: '文本' },
        { key: 'bool', value: '布尔' },
        { key: 'categorical', value: '枚举' },
        { key: 'float', value: '浮点' },
        { key: 'list', value: '列表' },
        { key: 'any', value: '任意' },
      ],
      mappingOpen: false
    };
  },
  created() {
    this.queryParams.projectId = this.projectId;
    this.form.projectId = this.projectId;
    this.getList();
  },
  methods: {
    /** 查询槽位信息列表 */
    getList() {
      this.loading = true;
      listSlot(this.queryParams).then(response => {
        this.slotList = response.rows;
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
        slotId: null,
        slotName: null,
        slotUtter: null,
        slotType: null,
        initialValue: null,
        influenceConversation: null,
        projectId: this.projectId,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null
      };
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
      this.ids = selection.map(item => item.slotId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加槽位信息";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const slotId = row.slotId || this.ids
      getSlot(slotId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改槽位信息";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.slotId != null) {
            updateSlot(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addSlot(this.form).then(response => {
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
      const slotIds = row.slotId || this.ids;
      this.$modal.confirm('是否确认删除槽位信息编号为"' + slotIds + '"的数据项？').then(function() {
        return delSlot(slotIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('bot/slot/export', {
        ...this.queryParams
      }, `slot_${new Date().getTime()}.xlsx`)
    },

  }
};
</script>

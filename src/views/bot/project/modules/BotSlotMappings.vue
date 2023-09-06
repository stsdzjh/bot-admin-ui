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
          v-hasPermi="['bot:mappings:add']"
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
          v-hasPermi="['bot:mappings:edit']"
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
          v-hasPermi="['bot:mappings:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="mappingsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="填充类型" align="center" prop="mappingsType">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.bot_slot_mapping_type" :value="scope.row.mappingsType"></dict-tag>
        </template>
      </el-table-column>
      <el-table-column label="填充实体" align="center" prop="entity.entityName">

      </el-table-column>
      <el-table-column label="槽位值" align="center" prop="mappingsValue" />
      <el-table-column label="填充角色" align="center" prop="mappingsRole" />
      <el-table-column label="填充组" align="center" prop="mappingsGroup" />
      <el-table-column label="生效意图" align="center" prop="mappingsIntent" />
      <el-table-column label="不生效意图" align="center" prop="mappingsNotIntent" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['bot:mappings:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['bot:mappings:remove']"
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

    <!-- 添加或修改槽位填充对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="填充类型" prop="mappingsType">
          <el-select v-model="form.mappingsType" @change="handleMappingTypeChange">
            <el-option v-for="dict in dict.type.bot_slot_mapping_type" :key="dict.value" :label="dict.label + '(' + dict.value + ')'" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="填充实体" prop="mappingsEntity" v-show="selectedMappingType == 'from_entity'">
          <el-select v-model="form.mappingsEntity">
            <el-option v-for="(item,index) in entityList" :key="item.entityId" :label="item.entityName" :value="item.entityId"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="槽位值" prop="mappingsValue" v-show="selectedMappingType == 'from_intent'">
          <el-input v-model="form.mappingsValue" placeholder="请输入槽位值" />
        </el-form-item>
        <el-form-item label="填充角色" prop="mappingsRole" v-show="selectedMappingType == 'from_entity'">
          <el-input v-model="form.mappingsRole" placeholder="请输入填充角色" />
        </el-form-item>
        <el-form-item label="填充组" prop="mappingsGroup" v-show="selectedMappingType == 'from_entity'">
          <el-input v-model="form.mappingsGroup" placeholder="请输入填充组" />
        </el-form-item>
        <el-form-item label="生效意图" prop="mappingsIntent">
          <el-input v-model="form.mappingsIntent" placeholder="请输入生效意图" />
        </el-form-item>
        <el-form-item label="排除意图" prop="mappingsNotIntent">
          <el-input v-model="form.mappingsNotIntent" placeholder="请输入不生效意图" />
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
import { listMappings, getMappings, delMappings, addMappings, updateMappings } from "@/api/bot/mappings";
import { listEntity} from "@/api/bot/entity";

export default {
  name: "BotSlotMappings",
  dicts: ['bot_slot_mapping_type'],
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
      // 槽位填充表格数据
      mappingsList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        slotId: null,
        projectId: null,
        mappingsType: null,
        mappingsEntity: null,
        mappingsValue: null,
        mappingsRole: null,
        mappingsGroup: null,
        mappingsIntent: null,
        mappingsNotIntent: null,
      },
      // 表单参数
      form: {},
      projectId: null,
      slotId: null,
      selectedMappingType: null,
      entityList: []
    };
  },
  created() {
    this.projectId = this.$route.params && this.$route.params.projectId;
    this.slotId = this.$route.params && this.$route.params.slotId;
    this.queryParams.slotId = this.slotId;
    this.getList();
    this.getEntityList();

  },
  methods: {
    /** 查询槽位填充列表 */
    getList() {
      this.loading = true;
      listMappings(this.queryParams).then(response => {
        this.mappingsList = response.rows;
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
        slotMappingsId: null,
        slotId: this.slotId,
        projectId: this.projectId,
        mappingsType: null,
        mappingsEntity: null,
        mappingsValue: null,
        mappingsRole: null,
        mappingsGroup: null,
        mappingsIntent: null,
        mappingsNotIntent: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null
      };
      this.resetForm("form");
      this.selectedMappingType=null;
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
      this.ids = selection.map(item => item.slotMappingsId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加槽位填充";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const slotMappingsId = row.slotMappingsId || this.ids
      getMappings(slotMappingsId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改槽位填充";
        this.selectedMappingType = this.form.mappingsType;
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.slotMappingsId != null) {
            updateMappings(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addMappings(this.form).then(response => {
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
      const slotMappingsIds = row.slotMappingsId || this.ids;
      this.$modal.confirm('是否确认删除槽位填充编号为"' + slotMappingsIds + '"的数据项？').then(function() {
        return delMappings(slotMappingsIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('bot/mappings/export', {
        ...this.queryParams
      }, `mappings_${new Date().getTime()}.xlsx`)
    },
    handleMappingTypeChange(value) {
      this.selectedMappingType = value;
    },
    getEntityList(){
      let that = this
      listEntity({projectId: that.projectId}).then(response => {
        that.entityList = response.rows;
        console.log("entityList",that.entityList)
      })
    }
  }
};
</script>

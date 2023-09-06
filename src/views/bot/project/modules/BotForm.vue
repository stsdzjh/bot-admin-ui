<template>
  <div class="app-container">
    <el-row>
      <el-col :span="4">
        <el-card shadow="hover">
          <div slot="header" class="clearfix">
            <span>表单列表</span>
            <el-button size="mini" style="float: right; margin-right: 1px" type="danger" icon="el-icon-delete" circle  @click="removeForm"></el-button>
            <el-button size="mini" style="float: right; margin-right: 5px"  type="primary" icon="el-icon-plus" circle  @click="popForm"></el-button>
          </div>
          <el-table
            :data="formList"
            :show-header="false"
            highlight-current-row
            @current-change="handleFormSelected"
            style="cursor: pointer"
          >
            <el-table-column property="formName">
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span=16>
        <el-card shadow="hover" class="clearfix">
          <div slot="header">
            <el-row>
              <el-col>
                <span style="font-size: 14px;font-weight: 700">表单: {{currentSelectedForm.formName}}</span>


              </el-col>
            </el-row>
          </div>
          <el-row v-show="currentSelectedForm.formId != null">
            <el-col >
              <el-card shadow="never">
                <div slot="header" class="clearfix">
                  <span style="font-size: 14px;font-weight: 700">槽位</span>

                  <el-button type="primary" style="float: right;" @click="saveFormSlotInfo">
                    保存槽位配置
                  </el-button>
                </div>
                <el-transfer v-model="slotSelected" :data="slotList" :titles="['未选择槽位', '已选择槽位']"></el-transfer>
              </el-card>
            </el-col>
          </el-row>

          <el-row v-show="currentSelectedForm.formId != null">
            <el-col >
              <el-card shadow="never">
                <div slot="header" class="clearfix">
                  <span style="font-size: 14px;font-weight: 700">排除意图</span>
                  <el-button type="primary" style="float: right;" @click="saveFormIntentInfo">
                    保存意图配置
                  </el-button>
                </div>
                <el-transfer v-model="intentSelected" :data="intentList" :titles="['未排除意图', '已排除意图']"></el-transfer>
              </el-card>
            </el-col>
          </el-row>

        </el-card>
      </el-col>
    </el-row>
    <el-dialog :title="title" :visible.sync="formModalOpen" width="350px" append-to-body>
      <el-form :model="formForm" label-width="80px">
        <el-form-item label="表单名称">
          <el-input v-model="formForm.formName" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitDataForm">确 定</el-button>
        <el-button @click="cancelDataForm">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { delForm, listForm, addForm, batchAddFormSlots, listFormRequiredSlot, batchAddFormIgnoredIntents, listFormIgnoredIntent} from "@/api/bot/form";
import { listSlot } from "@/api/bot/slot";
import { listIntent} from "@/api/bot/project";

export default {
  name: "BotForm",
  props: {
    projectId: {
      type: String,
      required: true
    }
  },
  data(){
    return {
      title: '',
      formList: null,
      formModalOpen: false,
      currentSelectedForm: {
        formName: '左侧菜单选择表单',
        formId: null
      },
      formQueryParams: {
        pageNum: 1,
        pageSize: 0,
        formName: null,
        projectId: null
      },
      formForm: {},
      slotSelected: [],
      slotList: [],
      intentSelected: [],
      intentList: []
    }
  },
  created() {
    this.formQueryParams.projectId = this.projectId;
    this.getFormList();
    this.formForm.projectId = this.projectId;
    this.getSlotInfo();
    this.getIntentInfo();
  },
  methods: {
    getFormList(){
      let that = this;
      listForm(this.formQueryParams).then(response => {
        that.formList = response.rows;
      })
    },
    getFormRequiredSlotList(){
      let that = this;
      listFormRequiredSlot({formId: this.currentSelectedForm.formId}).then(response => {
        that.slotSelected = [];
        for(let index in response.rows){
          that.$set(that.slotSelected,index,response.rows[index].slotId)
        }
      })
    },
    getFormIgnoredIntentList(){
      let that = this;
      listFormIgnoredIntent({formId: this.currentSelectedForm.formId}).then(response => {
        that.intentSelected = [];
        for(let index in response.rows){
          that.$set(that.intentSelected,index,response.rows[index].intentId)
        }
      })
    },
    popForm(){
      this.formModalOpen = true;
      this.title = '新增表单';
    },
    handleFormSelected(row){
      this.currentSelectedForm = row;
      this.getFormRequiredSlotList()
      this.getFormIgnoredIntentList();
    },
    removeForm(){
      if(this.currentSelectedForm.formId == null){
        this.$message.error("请先选择表单");
        return;
      }
      let that = this;
      this.$modal.confirm('确认要删除表单吗？').then(function () {
        delForm(that.currentSelectedForm.formId).then(response => {
          if(response.code == 200){
            that.$message.success("表单已删除");
            that.getFormList();
            that.currentSelectedForm.formId = null;
          }else{
            that.$message.error("表单删除失败");
          }
        });
      })
    },
    submitDataForm(){
      addForm(this.formForm).then(response => {
        if(response.code == 200){
          this.formModalOpen = false;
          this.formForm = {};
          this.getFormList();
        }else{
          this.$message.error(response.msg);
        }
      });
    },
    cancelDataForm(){
      this.formModalOpen = false;
    },
    getSlotInfo(){
      let that = this
      listSlot({projectId: that.projectId}).then(response => {
        response.rows.forEach((item, index) => {
          console.log(index,item)
          that.slotList.push({key: item.slotId,label: item.slotName})
        })
      })
    },
    getIntentInfo(){
      let that = this
      listIntent({projectId: that.projectId}).then(response => {
        response.rows.forEach((item,index) => {
          that.intentList.push({key: item.intentId, label: item.intentContent })
        })

      })
    },
    saveFormSlotInfo(){
      let data = {
        formId: this.currentSelectedForm.formId,
        slotIds: this.slotSelected
      }
      let that = this
      batchAddFormSlots(data).then(response => {
        if(response.code == '200'){
          that.$message.success("保存成功")
        }else{
          that.$message.error("保存失败")
        }
      })
    },
    saveFormIntentInfo(){
      let data = {
        formId: this.currentSelectedForm.formId,
        intentIds: this.intentSelected
      }
      let that = this
      batchAddFormIgnoredIntents(data).then(response => {
        if(response.code == '200'){
          that.$message.success("保存成功")
        }else{
          that.$message.error("保存失败")
        }
      })
    }
  }

}
</script>

<style scoped>

</style>

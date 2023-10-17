<template>
  <div>
    <el-row>
      <el-col :span="4">
        <div style="height: 32px;">
          <el-button-group style="float:right;padding-right: 20px;padding-bottom: 5px">
            <el-button size="small"  icon="el-icon-plus" @click="addStory"></el-button>
            <el-button size="small"  icon="el-icon-edit" @click="editStory"></el-button>
            <el-button size="small"  icon="el-icon-delete" @click="removeStory"></el-button>
          </el-button-group>
        </div>

        <el-menu style="margin-top: 5px">
          <!-- 规则-->
          <el-submenu index="1">
            <template slot="title">
              <i class="el-icon-location"></i>
              <span>规则(Rule)</span>
            </template>
            <template v-for="(item,index) in ruleList">
              <el-menu-item @click="handleStorySelected(item)" :index="item.storyId.toString()">
                {{ item.storyName }}
              </el-menu-item>
            </template >
          </el-submenu>
          <!-- 故事 -->
          <el-submenu index="2">
            <template slot="title">
              <i class="el-icon-location"></i>
              <span>故事(Story)</span>
            </template>
            <template v-for="(item,index) in storyList">
              <el-menu-item @click="handleStorySelected(item)" :index="item.storyId.toString()">
                {{item.storyName}}
              </el-menu-item>
            </template >
          </el-submenu>
          <!-- FAQ -->
          <el-submenu index="3">
            <template slot="title">
              <i class="el-icon-location"></i>
              <span>知识库(FAQ)</span>
            </template>
            <template v-for="(item,index) in faqList">
              <el-menu-item @click="handleStorySelected(item)" :index="item.storyId.toString()">
                {{item.storyName}}
              </el-menu-item>
            </template>
          </el-submenu>
        </el-menu>

      </el-col>
      <el-col :span="16">
        <el-card shadow="never">
          <div slot="header" class="clearfix">
            <span>流程设计</span>
            <el-button  style="float: right;" @click="saveStorySession" size="medium">
              保存
            </el-button>
          </div>
          <el-row >
            <el-col :span="12" :offset="6" class="add-utter-div">
              <div class="add-utter-div-row" style="width: 100%;text-align:center">
                <el-tooltip content="用户意图" placement="top">
                  <el-button @click="utter('intent',index)" size="mini">
                    <svg-icon class-name="custom-icon" icon-class="people"/>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="动作" placement="top">
                  <el-button @click="utter('action',index)" size="mini">
                    <svg-icon class-name="custom-icon" icon-class="bot"/>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="表单" placement="top">
                  <el-button @click="utter('form',index)" size="mini">
                    <svg-icon class-name="custom-icon" icon-class="form"/>
                  </el-button>
                </el-tooltip>
              </div>
            </el-col>
          </el-row>

          <div v-for="(item,index) in currentStorySessionList" :key="index">
            <!-- USER INTENT -->
            <el-row v-show="item.sessionType == 'intent'" style="margin: 5px 0">
              <el-col :span="2" >
                <el-button ><svg-icon class-name="custom-icon" icon-class="people"/></el-button>
              </el-col>
              <el-col :span="6" >
                <el-popover placement="right" width="300" trigger="click" >
                  <el-input v-model="intentSearchContent" placeholder="意图过滤或者新增" @input="intentSearch"></el-input>
                  <el-table :data="intentFilterList" style="width: 100%" :show-header="false" highlight-current-row @current-change="handleSessionIntentSelect" :header-cell-style="{ background:'#fff',color:'#909399', fontSize:'1.1em', fontWeight: 'bold'}">
                    <el-table-column property="intentContent" label="意图列表"></el-table-column>
                  </el-table>
                  <el-button style="width: 100%;margin-top: 10px;" type="primary" :disabled="intentFilterList.length > 0" @click="newIntent">创建意图</el-button>
                  <el-button slot="reference" @click="sessionSelect(index)"  style="border-top-left-radius:0;border-bottom-left-radius:0;font-size: 15px">
                    <template v-if="item.sessionIntentId == 0">请选择意图</template>
                    <template v-else>意图:{{getIntentContentById(item.sessionIntentId)}}</template>
                  </el-button>
                </el-popover>
              </el-col>

              <el-col :span="4" >
                <el-button icon="el-icon-delete" @click="removeSession(index)"></el-button>
              </el-col>
            </el-row>
            <!-- BOT ACTION -->
            <el-row v-show="item.sessionType == 'action'" style="margin: 5px 0">
              <el-col :span="2" >
                <el-button ><svg-icon class-name="custom-icon" icon-class="bot"/></el-button>
              </el-col>
              <el-col :span="3" >
                <el-select v-model="item.actionType" placeholder="动作类型">
                  <el-option v-for="opt in actionList" :key="opt.value" :label="opt.label" :value="opt.value" style="border-top-left-radius:0;border-bottom-left-radius:0;font-size: 15px"></el-option>
                </el-select>
              </el-col>
              <el-col :span="15" >
                <el-input v-model="item.sessionContent" v-show="item.actionType == 'text' || item.actionType == 'custom'"></el-input>
                <el-select v-model="item.sessionContent" v-show="item.actionType == 'form'">
                  <el-option v-for="item in formList" :key="item.formId" :label="'表单-' + item.formName" :value="item.formName"></el-option>
                </el-select>
              </el-col>

              <el-col :span="4">
                <el-button icon="el-icon-delete" @click="removeSession(index)"></el-button>
              </el-col>
            </el-row>
            <!-- BOT ACTIVE_LOOP -->
            <el-row v-show="item.sessionType == 'active_loop'" style="margin: 5px 0;">
              <el-col :span="2" >
                <el-button ><svg-icon class-name="custom-icon" icon-class="active_loop"/></el-button>
              </el-col>

              <el-col :span="6" >
                <el-select v-model="item.sessionContent">
                  <el-option v-for="formItem in formList" :key="formItem.formId" :label="'表单-' + formItem.formName" :value="formItem.formName">
                  </el-option>
                  <el-option label="表单填充完毕" value="null"></el-option>
                </el-select>
              </el-col>

              <el-col :span="4">
                <el-button icon="el-icon-delete" @click="removeSession(index)"></el-button>
              </el-col>

            </el-row>

            <!-- BOT SLOT_WAS_SET -->
            <el-row v-show="item.sessionType == 'slot_was_set'" style="margin: 5px 0;">
              <el-col :span="2" >
                <el-button ><svg-icon class-name="custom-icon" icon-class="slot"/></el-button>
              </el-col>
              <el-col :span="4">
                <el-select v-model="item.sessionContent">
                  <el-option v-for="slotItem in slotList" :key="slotItem.slotName" :label="'槽位-' + slotItem.slotName" :value="slotItem.slotName"></el-option>
                </el-select>
              </el-col>
              <el-col :span="6">
                <el-input v-model="item.slotSetValue"></el-input>
              </el-col>

              <el-col :span="4">
                <el-button icon="el-icon-delete" @click="removeSession(index)"></el-button>
              </el-col>
            </el-row>

            <!-- TOOLBAR -->
            <el-row>
              <el-col :span="6" :offset="6" class="add-utter-div">
                <div class="add-utter-div-row" style="width: 100%;text-align:center">
                  <el-tooltip content="用户意图" placement="top">
                    <el-button @click="utter('intent',index)" size="mini">
                      <svg-icon class-name="custom-icon" icon-class="people"/>
                    </el-button>
                  </el-tooltip>
                  <el-tooltip content="动作" placement="top">
                    <el-button @click="utter('action',index)" size="mini">
                      <svg-icon class-name="custom-icon" icon-class="bot"/>
                    </el-button>
                  </el-tooltip>
                  <el-tooltip content="表单填充" placement="top">
                    <el-button @click="utter('active_loop',index)" size="mini">
                      <svg-icon class-name="custom-icon" icon-class="active_loop"/>
                    </el-button>
                  </el-tooltip>
                  <el-tooltip content="槽位判断" placement="top">
                    <el-button @click="utter('slot_was_set',index)" size="mini">
                      <svg-icon class-name="custom-icon" icon-class="slot"/>
                    </el-button>
                  </el-tooltip>
                </div>
              </el-col>
            </el-row>


          </div>
        </el-card>
      </el-col>
      <!-- 属性 -->
      <el-col :span="4">
        <el-card shadow="never" v-show="currentSelectedStory.storyType == 'rule'">
          <div class="clearfix" slot="header">
            <span>节点属性</span>
            <el-button  style="float: right;" @click="updateStoryAttr" size="medium">
              保存
            </el-button>
          </div>
          <div class="clearfix" style="margin: 15px 0">
            <el-checkbox v-model="currentSelectedStory.conversationStart">会话初始启动</el-checkbox>
          </div>
          <div class="clearfix" style="margin: 15px 0">
            <el-checkbox v-model="currentSelectedStory.waitForUserInput">等待用户输入</el-checkbox>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-dialog :title="title" :visible.sync="modalOpen" width="350px" append-to-body>
      <el-form :model="storyForm" label-width="80px">
        <el-form-item label="类型">
          <el-radio-group  v-model="storyForm.storyType">
            <el-radio label="rule">规则</el-radio>
            <el-radio label="story">故事</el-radio>
            <el-radio label="faq">知识库</el-radio>
          </el-radio-group>

        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="storyForm.storyName" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitDataStory">确 定</el-button>
        <el-button @click="cancelDataStory">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { delStory, listStory, batchAddStorySession, addStory, editStory, listStorySession} from "@/api/bot/story";
import { listIntent, addIntent, makeid } from "@/api/bot/project"
import { listForm } from "@/api/bot/form";
import { listSlot} from '@/api/bot/slot';

export default {
  name: "BotStory",
  props: {
    projectId: {
      type: String,
      required: true
    }
  },
  data(){
    return {
      storyList: [],
      currentStorySessionList: [],
      storySessionQueryParams: {
        pageNum: 1,
        pageSize: 0,
        storyId: null
      },
      title: '',
      modalOpen: false,
      storyForm: {},
      intentFilterList: [],
      intentSearchContent: null,
      intentList: [],
      currentSelectedStorySessionIndex: null,
      formList: [],
      ruleList: [],
      slotList: [],
      currentSelectedStory: {},
      actionList: [
        { value: "text", label: "文本"},
        { value: "form", label: "表单"},
        { value: "custom", label: "自定义"}
        ],
      faqList: []

    }
  },
  created() {

    this.getStoryList();
    this.getRuleList();
    this.getFaqList();
    this.getIntentList();
    this.getFormList();
    this.getSlotList();
    this.storyForm.projectId = this.projectId;
  },
  methods: {
    getStoryList(){
      let that = this;
      listStory({projectId: this.projectId, storyType: 'story', pageNum: 1, pageSize: 0}).then(response => {
        that.storyList = response.rows;
      })
    },
    getRuleList(){
      let that = this;
      listStory({projectId: this.projectId, storyType: 'rule', pageNum: 1, pageSize: 0}).then(response => {
        that.ruleList = response.rows;
      })
    },
    getFaqList(){
      let that = this;
      listStory({projectId: this.projectId, storyType: 'faq', pageNum: 1, pageSize: 0}).then(response => {
        that.faqList = response.rows;
      })
    },
    getSlotList(){
      let that = this;
      listSlot({projectId: this.projectId,  pageNum: 1, pageSize: 0}).then(response =>{
        that.slotList = response.rows;
      })
    },
    removeStory(){
      if(this.currentSelectedStory.storyId == null){
        this.$message.error("请先选择流程模型");
        return;
      }
      let that = this;
      this.$modal.confirm('确认要删除会话流程模型吗？').then(function () {
        delStory(that.currentSelectedStory.storyId).then(response => {
          if(response.code == 200){
            that.$message.success("会话流程模型已删除");
            that.currentSelectedStory.storyId = null;
            that.currentStorySessionList = [];
            if(that.currentSelectedStory.storyType == "rule"){
              that.getRuleList();
            }else if(that.currentSelectedStory.storyType == "story"){
              that.getStoryList();
            }
          }else{
            that.$message.error("会话流程模型删除失败");
          }
        });
      })
    },
    addStory(){
      this.modalOpen = true;
      this.title = '新增流程';
    },
    editStory(){
      this.storyForm = this.currentSelectedStory;
      this.modalOpen = true;
      this.title = '修改流程';
    },
    handleStorySelected(row){
      this.currentSelectedStory = row;
      this.storySessionQueryParams.storyId = this.currentSelectedStory.storyId;
      this.getStorySessionList();
      console.log("selected story:",row);
    },
    cancelDataStory(){
      this.modalOpen = false;
    },
    saveStorySession(){
      let that = this;
      let params = {
        storyId: this.currentSelectedStory.storyId,
        sessionData: this.currentStorySessionList,
        projectId: this.projectId
      }
      batchAddStorySession(params).then(response => {
        if(response.code == 200){
          that.$message.success(response.msg);
        }else{
          that.$message.error(response.msg);
        }
      })

    },
    submitDataStory(){
      let that = this
      this.storyForm.projectId = this.projectId;

      if(that.storyForm.storyId != null){
        editStory(this.storyForm).then(response => {
          if(response.code == 200){
            that.modalOpen = false;
            if(that.storyForm.storyType == "rule"){
              that.getRuleList();
            }else if(that.storyForm.storyType == "story"){
              that.getStoryList();
            }
            that.storyForm = {};
            that.$message.success("修改成功")

          }else{
            that.$message.error(response.msg);
          }
        });
      }else{
        addStory(this.storyForm).then(response => {
          if(response.code == 200){
            that.modalOpen = false;
            if(that.storyForm.storyType == "rule"){
              that.getRuleList();
            }else if(that.storyForm.storyType == "story"){
              that.getStoryList();
            }
            that.storyForm = {};
            that.$message.success("添加成功")

          }else{
            that.$message.error(response.msg);
          }
        });
      }

    },
    getStorySessionList(){
      let that = this
      listStorySession(this.storySessionQueryParams).then(response =>{
        console.log("response list",response);
        that.currentStorySessionList = response.rows;
      })
    },
    intentSearch(value){
      let intentFilterParams = {};
      Object.assign(intentFilterParams, {
        pageNum: 1,
        pageSize: 0,
        intentContent: value,
        projectId: this.projectId
      });
      let that =  this;
      listIntent(intentFilterParams).then(response => {
        that.intentFilterList = response.rows;
      });

    },
    handleSessionIntentSelect(row){
      if(row == null) return ;
      this.$set(this.currentStorySessionList[this.currentSelectedStorySessionIndex],"sessionIntentId",row.intentId);
      document.body.click();
    },
    newIntent(){
      let that = this
      let intentData = {
        intentContent: this.intentSearchContent,
        projectId: this.projectId
      }
      addIntent(intentData).then(response => {
        if(response.code == 200){
          this.intentSearch(that.intentSearchContent);
          this.getIntentList();
        }else{
          this.$message.error(response.msg);
        }

      });
    },
    getIntentContentById(intentId){
      for(let i=0;i<this.intentList.length;i++){
        if(this.intentList[i].intentId == intentId){
          return this.intentList[i].intentContent;
        }
      }
      return 0;
    },
    getIntentList(){
      let that = this;
      listIntent({projectId: this.projectId}).then(response => {
        that.intentList = response.rows;
        that.intentFilterList = response.rows;
        that.intentTotal = response.total;
        console.log("intentFilterList",that.intentFilterList);
      })
    },
    // index 意图列表下标
    sessionSelect(index){
      this.currentSelectedStorySessionIndex = index;

    },

    utter(utterType, index){
      console.log(index)
      if(this.currentSelectedStory.storyId == null){
        this.$message.error("请先选择或创建会话模型");
        return;
      }
      let uuid = null;
      if(utterType == 'action'){
        uuid = 'utter_' + makeid(10)
      }
      this.currentStorySessionList.splice(index + 1, 0, {
        sessionType: utterType,
        sessionContent: '',
        storyId: this.currentSelectedStory.storyId,
        sessionIntent: null,
        sessionResponseId: uuid
      })

    },
    getFormList(){
      let that = this
      listForm({projectId: that.projectId}).then(response => {
        if(response.code == '200'){
          that.formList = response.rows
        }else{
          that.$message.error("获取表单信息失败")
        }

      })
    },
    removeSession(index){
      this.currentStorySessionList.splice(index,1)
    },
    updateStoryAttr(){
      let that = this
      this.storyForm.projectId = this.projectId;
      this.storyForm.conversationStart = this.currentSelectedStory.conversationStart;
      this.storyForm.waitForUserInput = this.currentSelectedStory.waitForUserInput;
      editStory(this.storyForm).then(response => {
        if(response.code == 200){
          that.$message.success("属性保存成功")
        }else{
          that.$message.error("属性保存失败")
        }
      })
    }
  }
}
</script>

<style  lang="scss" scoped>
.el-button--mini{
  padding: 7px 7px;
}
.add-utter-div{
  min-height: 5px;
  &:hover {
    .add-utter-div-row {
      display: block;
    }
  }
}
.add-utter-div-row{
  display: none;
}

.custom-icon{
  font-size: 14px;
}
.el-input--medium {
  .el-input__inner{
    border-radius: 0;
  }
}
.el-select{
  .el-input{
    input{
      border-radius: 0;
    }
  }
}


</style>

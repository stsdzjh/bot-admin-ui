<template>
  <div class="app-container">

    <el-card>
      <el-table stripe v-loading="trackerLoading" :data="trackerList">
        <el-table-column label="用户ID" align="left" prop="senderId">
          <template slot-scope="scope">
            {{scope.row.senderId}}
          </template>
        </el-table-column>
        <el-table-column label="用户语料" align="left" prop="userText" :formatter="userTextPick">

        </el-table-column>

        <el-table-column label="判定意图" align="left" prop="intentName">
          <template slot-scope="scope">
            {{ scope.row.intentName }}
          </template>
        </el-table-column>

        <el-table-column label="可信度" align="left" prop="intentConfidence" :formatter="intentConfidencePick" width="80"></el-table-column>
        <el-table-column label="意图优化" align="left" prop="adjustIntentName" >
          <template slot-scope="scope">
            <el-popover placement="right" width="300" trigger="click">
              <el-input v-model="intentSearchContent" placeholder="意图过滤或者新增" @input="intentSearch"></el-input>
              <el-table :data="intentFilterList" style="width: 100%" :show-header="false" highlight-current-row @current-change="handleIntentSelect" :header-cell-style="{ background:'#fff',color:'#909399', fontSize:'1.1em', fontWeight: 'bold'}">
                <el-table-column property="intentContent" label="意图列表"></el-table-column>
              </el-table>
              <el-button style="width: 100%;margin-top: 10px;" type="primary" :disabled="intentFilterList.length > 0" @click="newIntent">创建意图</el-button>

              <el-button slot="reference" @click="trackerSelected(scope.row)" type="primary" plain v-show="scope.row.intentId == 0">
                请选择意图
              </el-button>

              <el-button slot="reference" @click="trackerSelected(scope.row)" type="success" plain v-show="scope.row.intentId != 0">
                {{getIntentContentById(scope.row.intentId)}}
              </el-button>

            </el-popover>
          </template>
        </el-table-column>
        <el-table-column label="会话时间" align="left" prop="timestamp" :formatter="timeFormatter"></el-table-column>

        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-button
              size="normal"
              type="text"
              icon="el-icon-check"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['bot:tracker:edit']"
              v-show="currentSelectedTracker.modified == true"
            >提交</el-button>

          </template>
        </el-table-column>

      </el-table>
      <pagination
        v-show="trackerTotal>0"
        :total="trackerTotal"
        :page.sync="trackerQueryParams.pageNum"
        :limit.sync="trackerQueryParams.pageSize"
        @pagination="getTrackerList"
      />
    </el-card>
  </div>
</template>

<script>
import {listOnlyUser, updateTracker} from "@/api/bot/tracker";
import {listIntent, addIntent} from "@/api/bot/project";
import moment from 'moment';
import {addNLU} from "@/api/bot/nlu";

export default {
  name: "BotTracker",
  dicts: ['bot_tracker_check_status'],
  props: {
    projectId: {
      type: String,
      required: true
    }
  },
  data(){
    return {
      trackerQueryParams: {
        pageNum: 1,
        pageSize: 10,
        projectId: null
      },
      trackerList: [],
      trackerTotal: 0,
      trackerLoading: false,
      intentSearchContent: null,
      intentFilterList: [],
      intentList: [],
      input: '',
      currentSelectedTracker: {},
      intentQueryParams: {
        pageNum: 1,
        pageSize: 0,
        intentContent: null,
        projectId: null
      },
      intentFilters: []
    }
  },
  created() {
    this.trackerQueryParams.projectId = this.projectId
    this.intentQueryParams.projectId = this.projectId;
    this.currentSelectedTracker.intentId = 0;
    this.getTrackerList();
    this.getIntentList();
  },
  methods:{
    getTrackerList(){
      this.trackerLoading = true;
      let that = this;
      listOnlyUser(this.trackerQueryParams).then(response => {
        that.trackerList = response.rows;
        that.trackerTotal = response.total;
        that.trackerLoading = false;

      })
    },
    getIntentList(){
      let that = this;
      listIntent(this.intentQueryParams).then(response => {
        that.intentList = response.rows;
        that.intentFilterList = response.rows;
        that.intentTotal = response.total;
        /*that.intentFilterList = [];
        that.intentList.forEach( item => {
          that.intentFilterList.push({text: item.intentContent, value: item.intentId})
        })*/
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
    userTextPick(row){
      let data=JSON.parse(row.data);
      return data.text
    },
    intentConfidencePick(row){
      let data=JSON.parse(row.data);
      let rawConfidence = data.parse_data.intent.confidence + '';
      let dotIndex = rawConfidence.indexOf(".");
      let confidenceStr = rawConfidence.substring(0,dotIndex+5);
      let confidence = confidenceStr * 100;
      return (confidence).toFixed(2) + "%";
    },
    timeFormatter(row){
      return moment(parseInt(row.timestamp)*1000).format('YYYY-MM-DD HH:mm:ss');
    },
    handleUpdate(row){
      let data=JSON.parse(row.data);
      let that = this;
      updateTracker(row).then(response => {
        if(response.code == 200){
          this.$message.success("更新Tracker成功");
          addNLU({nluContent: data.text, projectId: this.trackerQueryParams.projectId, intentId: row.intentId}).then(response => {
            if(response.code == 200){
              that.$message.success("成功添加语料")
            }else{
              that.$message.error(response.msg);
            }
          })

        }else{
          this.$message.error(response.msg);
        }
      })
    },
    handleIntentSelect(row){
      if(row == null) return ;
      this.currentSelectedTracker.intentId = row.intentId;
      this.currentSelectedTracker.adjustIntentName = this.getIntentContentById(row.intentId);
      document.body.click();
      this.intentSearchContent = null;
      this.currentSelectedTracker.modified = true;
    },
    trackerSelected(row){
      this.currentSelectedTracker = row
      this.intentFilterList = this.intentList
    },

  }
}
</script>

<style scoped>

</style>

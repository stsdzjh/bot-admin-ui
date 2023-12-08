<template>
  <div class="app-container">
    <el-card>
      <div slot="header">
        <el-alert  title="输入完成后，按回车确认"  type="success" show-icon :closable="false"></el-alert>
      </div>
      <div>
        <el-input v-model="input" placeholder="用户说......" @change="inputNLUChange"></el-input>
      </div>
    </el-card>
    <el-card>
      <el-table stripe v-loading="nluLoading" :data="nluList" @sort-change="sortChange" @filter-change="handleFilterChange">
        <el-table-column type="selection" width="55" align="left" />
        <el-table-column label="意图" align="left" prop="intentId" width="200px" column-key="intentId" sortable="custom" :filters="intentFilterList" :filter-method="intentFilterHandler">
          <template slot-scope="scope">
            <el-popover placement="right" width="300" trigger="click" >
              <el-input v-model="intentSearchContent" placeholder="意图过滤或者新增" @input="intentSearch"></el-input>
              <el-table :data="intentFilterList" style="width: 100%" :show-header="false" highlight-current-row @current-change="handleIntentSelect" :header-cell-style="{ background:'#fff',color:'#909399', fontSize:'1.1em', fontWeight: 'bold'}">
                <el-table-column property="text" label="意图列表"></el-table-column>
              </el-table>
              <el-button style="width: 100%;margin-top: 10px;" type="primary" :disabled="intentFilterList.length > 0" @click="newIntent">创建意图</el-button>
              <el-button slot="reference" @click="nluSelected(scope.row)"><template v-if="scope.row.intentId == 0">请选择意图</template><template v-else>{{getIntentContentById(scope.row.intentId)}}</template></el-button>
            </el-popover>

          </template>
        </el-table-column>
        <el-table-column label="语料" align="left" prop="nluContent">
          <template slot-scope="scope">
            <el-input v-model="scope.row.nluContent" v-show="scope.row.isEdit" @blur="handleNluInputBlur(scope.row)"></el-input>
            <div v-show="!scope.row.isEdit">{{scope.row.nluContent}}</div>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="left" prop="createTime" width="200">

        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-button @click="editNlu(scope.row, scope)" icon="el-icon-edit"></el-button>
            <el-button type="danger" @click="delNlu(scope.row)" icon="el-icon-delete"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="nluTotal>0"
        :total="nluTotal"
        :page.sync="nluQueryParams.pageNum"
        :limit.sync="nluQueryParams.pageSize"
        @pagination="getNluList"
      />
    </el-card>
  </div>
</template>

<script>
import {addNLU, listNLU, updateNLU, delNLU} from "@/api/bot/nlu";
import {listIntent, addIntent} from "@/api/bot/project";

export default {
  name: "BotNlu",
  props: {
    projectId: {
      type: String,
      required: true
    }
  },
  data(){
    return {
      nluQueryParams: {
        pageNum: 1,
        pageSize: 10,
        nluContent: null,
        intentId: null,
        projectId: null,
        orderByColumn: "createTime",
        isAsc: "desc",
        filterData: null
      },
      nluList: [],
      nluTotal: 0,
      nluLoading: false,
      intentSearchContent: null,
      intentFilterList: [],
      intentList: [],
      input: '',
      currentSelectedNLU: {},
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
    console.log("BotNLU",this.projectId)
    this.nluQueryParams.projectId = this.projectId
    this.intentQueryParams.projectId = this.projectId;
    this.getNluList();
    this.getIntentList();
  },
  methods:{
    inputNLUChange(value){
      let that = this;
      addNLU({nluContent: value, projectId: this.nluQueryParams.projectId}).then(response => {
        if(response.code == 200){
          that.$message.success("成功添加语料")
          that.getNluList();
          that.input='';
        }else{
          that.$message.error(response.msg);
        }
      })
    },
    getNluList(){
      this.nluLoading = true;
      let that = this;
      listNLU(this.nluQueryParams).then(response => {
        that.nluList = response.rows;
        that.nluTotal = response.total;
        that.nluLoading = false;

      })
    },

    getNluFilter(){
      this.nluLoading = true;
      let that = this;
      filterNLU(this.nluQueryParams).then(response => {
        that.nluList = response.rows;
        that.nluTotal = response.total;
        that.nluLoading = false;

      })
    },

    getIntentList(){
      let that = this;
      listIntent(this.intentQueryParams).then(response => {
        that.intentList = response.rows;
        that.intentTotal = response.total;
        that.intentFilterList = [];
        that.intentList.forEach( item => {
          that.intentFilterList.push({text: item.intentContent, value: item.intentId})
        })
        console.log("getIntentList",that.intentList);
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
        that.intentFilterList = [];
        response.rows.forEach( item => {
          that.intentFilterList.push({text: item.intentContent, value: item.intentId})
        })
      });

    },
    handleIntentSelect(row){
      console.log('row',row);
      if(row == null) return ;
      this.currentSelectedNLU.intentId = row.value;
      let that = this;
      updateNLU(this.currentSelectedNLU).then(response =>{
        that.getNluList();
        document.body.click();
        that.intentSearchContent = null;
      })
    },
    nluSelected(row){
      this.currentSelectedNLU = row
      console.log('abc')
      this.intentFilterList = [];
      this.intentList.forEach( item => {
        this.intentFilterList.push({text: item.intentContent, value: item.intentId})
      })
    },
    handleNluInputBlur(row){
      console.log("blur",row)
      this.$set(row,"isEdit",false)
      let that = this;
      updateNLU(row).then(response =>{

      })
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
    editNlu(row,index){
      this.$set(row,"isEdit",true)
    },
    delNlu(row){
      let that = this
      delNLU(row.nluId).then(response => {
        this.getNluList();
      })
    },
    handleFilterChange(filter){
      console.log("filter",filter)
      if(filter.intentId.length != 0){
        this.nluQueryParams.params = {"intentIds": filter.intentId}
      }else{
        this.nluQueryParams.params = null
      }

      this.getNluList();

    },
    intentFilterHandler(value, row, column){
      console.log(value,row,column)
      const property = column['property'];
      return row[property] === value;
    },
    sortChange({ prop, order }){
      console.log("prop",prop,"order",order)
      this.nluQueryParams.orderByColumn = prop
      if( order == "descending"){
        this.nluQueryParams.isAsc = "desc"
      }else if( order == "ascending"){
        this.nluQueryParams.isAsc = "asc"
      }
      this.getNluList();

      this.nluList.sort(this.compare(prop,order));
      console.log(this.nluList)
    },
    /**
     * 排序比较
     * @param {string} propertyName 排序的属性名
     * @param {string} sort ascending(升序)/descending(降序)
     * @return {function}
     */
    compare(propertyName, sort) {

      // 判断是否为数字
      function isNumberV(val) {
        var regPos = /^\d+(\.\d+)?$/; //非负浮点数
        var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
        if (regPos.test(val) || regNeg.test(val)) {
          return true;
        } else {
          return false;
        }
      }

      return function (obj1, obj2) {
        let value1 = obj1[propertyName];
        let value2 = obj2[propertyName];
        // 数字类型的比较
        if(isNumberV(value1) || isNumberV(value2)){
          if (sort === "ascending") {
            return value1 - value2;
          } else {
            return value2 - value1;
          }
        }
          // 布尔值的比较：利用减法-转化true 和 false
          // true => 1   false ⇒ 0
          // true-false => 1  false-true => -1
        // 下面方法是按照先false后true的顺序排序，如果想先true后false，调整value1-value2 和  value2 - value1的顺序即可
        else if(_.isBoolean(value1) && _.isBoolean(value2)){
          if (sort === "ascending") {
            return value1 - value2;
          } else {
            return value2 - value1;
          }
        }
        // 字符比较使用localeCompare()
        else {
          const res = value1.localeCompare(value2, "zh");
          return sort === "ascending" ? res : -res;
        }
      };
    }
  }
}
</script>

<style scoped>

</style>

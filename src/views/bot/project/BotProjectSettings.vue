<template>
  <div class="app-container">
    <el-tabs v-model="currentTab" type="border-card">
      <el-tab-pane label="故事" name="STORY" style="font-size: 14px">
        <bot-story :project-id="projectId"></bot-story>
      </el-tab-pane>

      <el-tab-pane label="语料" name="NLU">
        <bot-nlu :project-id="projectId"></bot-nlu>
      </el-tab-pane>

      <el-tab-pane label="响应" name="RESPONSE">
        响应
      </el-tab-pane>

      <el-tab-pane label="实体" name="ENTITY">
        <bot-entity :project-id="projectId"></bot-entity>
      </el-tab-pane>

      <el-tab-pane label="槽位" name="SLOT">
        <bot-slot :project-id="projectId"></bot-slot>
      </el-tab-pane>

      <el-tab-pane label="表单" name="FORM">
        <bot-form :project-id="projectId"></bot-form>
      </el-tab-pane>

      <el-tab-pane label="模型" name="MODEL">
        <bot-model></bot-model>
      </el-tab-pane>

    </el-tabs>
    <el-button type="primary" style='position: absolute;right:40px;top:22px;' @click="trainProject">训练模型</el-button>
  </div>
</template>

<script>
import {  botProjectTrain, makeid } from "@/api/bot/project";

import BotModel from "./modules/BotModel";
import BotNlu from "./modules/BotNlu";
import BotStory from "./modules/BotStory";
import BotEntity from "./modules/BotEntity";
import BotSlot from "./modules/BotSlot";
import BotForm from "./modules/BotForm";

export default {
  name: "BotProjectSettings",
  components: {BotForm, BotSlot, BotEntity, BotStory, BotNlu, BotModel},
  data(){
    return {
      projectId: null,
      trainCode: null,
      currentTab: 'STORY',
    }
  },
  created() {
    const projectId = this.$route.params && this.$route.params.projectId;
    this.projectId = projectId;
  },
  methods:{
    trainProject() {

      let that = this;
      this.$modal.confirm('确认要训练项目吗？').then(function () {
        that.trainCode = makeid(32);
        console.log("traincode",that.trainCode)
        return botProjectTrain(that.projectId, that.trainCode);
      }).then(() => {
        that.$modal.msgSuccess('训练已经完成');
      }).catch(function () {
        console.log('训练失败')
      })
    },
  }
}
</script>

<style scoped>

</style>

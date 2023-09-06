import request from '@/utils/request'

// 查询用户项目列表
export function listProject(query) {
  return request({
    url: '/bot/project/list',
    method: 'get',
    params: query
  })
}

// 查询用户项目详细
export function getProject(projectId) {
  return request({
    url: '/bot/project/' + projectId,
    method: 'get'
  })
}

// 新增用户项目
export function addProject(data) {
  return request({
    url: '/bot/project',
    method: 'post',
    data: data
  })
}

// 修改用户项目
export function updateProject(data) {
  return request({
    url: '/bot/project',
    method: 'put',
    data: data
  })
}

// 删除用户项目
export function delProject(projectId) {
  return request({
    url: '/bot/project/' + projectId,
    method: 'delete'
  })
}

// 项目状态修改
export function changeProjectStatus(projectId, projectStatus) {
  const data = {
    projectId,
    projectStatus
  }
  return request({
    url: '/bot/project/changeStatus',
    method: 'put',
    data: data
  })
}

// 项目初始化
export function botProjectTrain(projectId, trainCode) {
  console.log("trainprojectid:",projectId)
  const data = {
    projectId,
    trainCode
  }
  return request({
    url: '/bot/model/train',
    method: 'post',
    data: data
  })
}





//查询意图列表数据
export function listIntent(query){
  return request({
    url: '/bot/intent/list',
    method: 'get',
    params: query
  })
}


// 新增意图
export function addIntent(data) {
  return request({
    url: '/bot/intent',
    method: 'post',
    data: data
  })
}



//更换模型
export function changeModel(data){
  return request({
    url: '/bot/model/change',
    method: 'post',
    data: data
  })
}

//生成随机字符串
export function makeid(len)
{
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

  for( var i=0; i < len; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

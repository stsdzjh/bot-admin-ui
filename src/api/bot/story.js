import request from '@/utils/request'

//删除对话流程
export function delStory(storyId){
  console.log("storyId:",storyId)
  return request({
    url: '/bot/story/' + storyId,
    method: 'delete'
  })
}

//查询对话流程
export function listStory(query){
  return request({
    url: '/bot/story/list',
    method: 'get',
    params: query
  })
}

//批量保存会话
export function batchAddStorySession(data){
  return request({
    url: '/bot/storySession/batchadd',
    method: 'post',
    data: data
  })
}
//新增对话流程
export function  addStory(data){
  return request({
    url: '/bot/story',
    method: 'post',
    data: data
  })
}

//查询模型会话内容
export function listStorySession(query){
  return request({
    url: '/bot/storySession/list',
    method: 'get',
    params: query
  })
}

export function  editStory(data){
  return request({
    url: '/bot/story',
    method: 'put',
    data: data
  })
}

export function listUtterStorySession(query){
  return request({
    url: '/bot/storySession/listUtter',
    method: 'get',
    params: query
  })
}

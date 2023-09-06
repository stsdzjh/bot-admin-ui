import request from '@/utils/request'

// 查询表单列表
export function listForm(query) {
  return request({
    url: '/bot/form/list',
    method: 'get',
    params: query
  })
}

// 查询表单详细
export function getForm(formId) {
  return request({
    url: '/bot/form/' + formId,
    method: 'get'
  })
}

// 新增表单
export function addForm(data) {
  return request({
    url: '/bot/form',
    method: 'post',
    data: data
  })
}

// 修改表单
export function updateForm(data) {
  return request({
    url: '/bot/form',
    method: 'put',
    data: data
  })
}

// 删除表单
export function delForm(formId) {
  return request({
    url: '/bot/form/' + formId,
    method: 'delete'
  })
}

export function batchAddFormSlots(data) {
  return request({
    url: '/bot/FormRequiredSlot/batchadd',
    method: 'post',
    data: data
  })
}

export function listFormRequiredSlot(query) {
  return request({
    url: '/bot/FormRequiredSlot/list',
    method: 'get',
    params: query
  })
}

export function batchAddFormIgnoredIntents(data) {
  return request({
    url: '/bot/FormIgnoredIntents/batchadd',
    method: 'post',
    data: data
  })
}

export function listFormIgnoredIntent(query) {
  return request({
    url: '/bot/FormIgnoredIntents/list',
    method: 'get',
    params: query
  })
}

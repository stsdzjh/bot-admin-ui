import request from '@/utils/request'

// 查询实体列表
export function listEntity(query) {
  return request({
    url: '/bot/entity/list',
    method: 'get',
    params: query
  })
}

// 查询实体详细
export function getEntity(entityId) {
  return request({
    url: '/bot/entity/' + entityId,
    method: 'get'
  })
}

// 新增实体
export function addEntity(data) {
  return request({
    url: '/bot/entity',
    method: 'post',
    data: data
  })
}

// 修改实体
export function updateEntity(data) {
  return request({
    url: '/bot/entity',
    method: 'put',
    data: data
  })
}

// 删除实体
export function delEntity(entityId) {
  return request({
    url: '/bot/entity/' + entityId,
    method: 'delete'
  })
}

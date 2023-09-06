import request from '@/utils/request'

// 查询槽位信息列表
export function listSlot(query) {
  return request({
    url: '/bot/slot/list',
    method: 'get',
    params: query
  })
}

// 查询槽位信息详细
export function getSlot(slotId) {
  return request({
    url: '/bot/slot/' + slotId,
    method: 'get'
  })
}

// 新增槽位信息
export function addSlot(data) {
  return request({
    url: '/bot/slot',
    method: 'post',
    data: data
  })
}

// 修改槽位信息
export function updateSlot(data) {
  return request({
    url: '/bot/slot',
    method: 'put',
    data: data
  })
}

// 删除槽位信息
export function delSlot(slotId) {
  return request({
    url: '/bot/slot/' + slotId,
    method: 'delete'
  })
}

import request from '@/utils/request'

// 查询槽位填充列表
export function listMappings(query) {
  return request({
    url: '/bot/mappings/list',
    method: 'get',
    params: query
  })
}

// 查询槽位填充详细
export function getMappings(slotMappingsId) {
  return request({
    url: '/bot/mappings/' + slotMappingsId,
    method: 'get'
  })
}

// 新增槽位填充
export function addMappings(data) {
  return request({
    url: '/bot/mappings',
    method: 'post',
    data: data
  })
}

// 修改槽位填充
export function updateMappings(data) {
  return request({
    url: '/bot/mappings',
    method: 'put',
    data: data
  })
}

// 删除槽位填充
export function delMappings(slotMappingsId) {
  return request({
    url: '/bot/mappings/' + slotMappingsId,
    method: 'delete'
  })
}

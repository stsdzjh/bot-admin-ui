import request from '@/utils/request'

// 查询同义词列表
export function listSynonyms(query) {
  return request({
    url: '/bot/synonyms/list',
    method: 'get',
    params: query
  })
}

// 查询同义词详细
export function getSynonyms(synonymsId) {
  return request({
    url: '/bot/synonyms/' + synonymsId,
    method: 'get'
  })
}

// 新增同义词
export function addSynonyms(data) {
  return request({
    url: '/bot/synonyms',
    method: 'post',
    data: data
  })
}

// 修改同义词
export function updateSynonyms(data) {
  return request({
    url: '/bot/synonyms',
    method: 'put',
    data: data
  })
}

// 删除同义词
export function delSynonyms(synonymsId) {
  return request({
    url: '/bot/synonyms/' + synonymsId,
    method: 'delete'
  })
}

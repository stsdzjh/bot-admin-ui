import request from '@/utils/request'

// 新增语料
export function addNLU(data) {
  return request({
    url: '/bot/nlu',
    method: 'post',
    data: data
  })
}

//查询NLU数据
export function listNLU(query){
  return request({
    url: '/bot/nlu/list',
    method: 'get',
    params: query
  })
}


// 修改语料
export function updateNLU(data) {
  return request({
    url: '/bot/nlu',
    method: 'put',
    data: data
  })
}

//删除语料
export function delNLU(nluId) {
  return request({
    url: '/bot/nlu/' + nluId,
    method: 'delete'
  })
}

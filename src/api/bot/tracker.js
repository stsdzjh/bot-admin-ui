import request from '@/utils/request'
//查询Tracker数据
export function listTracker(query){
  return request({
    url: '/bot/tracker/list',
    method: 'get',
    params: query
  })
}

export function listOnlyUser(query){
  return request({
    url: '/bot/tracker/listOnlyUser',
    method: 'get',
    params: query
  })
}


// 修改Tracker
export function updateTracker(data) {
  return request({
    url: '/bot/tracker',
    method: 'put',
    data: data
  })
}

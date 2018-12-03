import request from '@/utils/request'

export function saveCar(data) {
  return request({
    url: '/chj-service-tur/api/tur-drive-car/save',
    method: 'post',
    data
  })
}

export function updateCar(data) {
  return request({
    url: '/chj-service-tur/api/tur-drive-car/update',
    method: 'post',
    data
  })
}

export function deleteCar(data) {
  return request({
    url: '/chj-service-tur/api/tur-drive-car/delete/',
    method: 'post',
    data
  })
}

export function saveCarScheduler(data) {
  return request({
    url: '/chj-service-tur/api/tur-drive-car-scheduler/save',
    method: 'post',
    data
  })
}

export function updateCarScheduler(data) {
  return request({
    url: '/chj-service-tur/api/tur-drive-car-scheduler/update',
    method: 'post',
    data
  })
}

export function deleteCarScheduler(data) {
  return request({
    url: '/chj-service-tur/api/tur-drive-car-scheduler/delete',
    method: 'post',
    data
  })
}

export function getEmployeeStore(pv) {
  return request({
    url: '/chj-service-tur/api/tur-employee/find/employee-store/' + pv,
    method: 'get'
  })
}

export function queryDriveCarScheduler(storeCode, month) {
  return request({
    url: '/chj-service-tur/api/tur-drive-car/query-drive-car-scheduler/' + storeCode + '/' + month,
    method: 'get'
  })
}

export function getCarStore(pv) {
  return request({
    url: '/chj-service-tur/api/tur-store/employee/' + pv,
    method: 'get'
  })
}

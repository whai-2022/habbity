import request from 'superagent'

const rootUrl = '/api/v1'

export function getHabits() {
  return request.get(rootUrl + '/habits').then((res) => {
    return res.body
  })
}

export function addHabits(newhabits) {
  return request
    .post(rootUrl + '/habits')
    .send({ newhabits })
    .then((res) => {
      return res.body
    })
}

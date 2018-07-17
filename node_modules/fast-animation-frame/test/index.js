const {requestAnimationFrame, cancelAnimationFrame} = require('../lib')

let i = 0
let id

id = requestAnimationFrame(function step() {
  console.log(i++)
  id = requestAnimationFrame(step)
})

requestAnimationFrame(function step() {
  console.log('aaa')
  requestAnimationFrame(step)
})

setTimeout(() => {
  cancelAnimationFrame(id)
}, 1000)


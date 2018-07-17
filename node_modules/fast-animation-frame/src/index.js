/* eslint-disable no-undef */
function nowtime() {
  if(typeof performance !== 'undefined' && performance.now) {
    return performance.now()
  } else if(typeof process !== 'undefined' && process.hrtime) {
    const [s, ns] = process.hrtime()
    return s * 1e3 + ns * 1e-6
  }
  return Date.now ? Date.now() : (new Date()).getTime()
}
/* eslint-enable no-undef */

let _requestAnimationFrame,
  _cancelAnimationFrame

if(typeof requestAnimationFrame === 'undefined') {
  _requestAnimationFrame = function (fn) {
    return setTimeout(() => {
      fn(nowtime())
    }, 16)
  }
  _cancelAnimationFrame = function (id) {
    return clearTimeout(id)
  }
} else {
  _requestAnimationFrame = requestAnimationFrame
  _cancelAnimationFrame = cancelAnimationFrame
}

const steps = new Map()
let timerId

const FastAnimationFrame = {
  requestAnimationFrame(step) {
    const id = Symbol('requestId')
    steps.set(id, step)

    if(timerId == null) {
      timerId = _requestAnimationFrame((t) => {
        timerId = null
        ;[...steps].forEach(([id, callback]) => {
          callback(t)
          steps.delete(id)
        })
      })
    }
    return id
  },
  cancelAnimationFrame(id) {
    steps.delete(id)
    if(!steps.size && timerId) {
      _cancelAnimationFrame(timerId)
      timerId = null
    }
  },
}

module.exports = FastAnimationFrame

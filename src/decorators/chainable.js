const chainable = (_, __, descriptor) => {
  const originalFunc = descriptor.value

  descriptor.value = function value (...args) {
    originalFunc.apply(this, args)

    return this
  }
}





export default chainable

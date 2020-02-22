import ValidationError from '../classes/ValidationError'





const asValidator = (valueMode) => {
  return (_, __, descriptor) => {
    const validatorFunc = descriptor.value

    descriptor.value = function value (...args) {
      const callArgs = [...args]
      let result = null

      const currentValue = this.__propertyValue

      switch (valueMode) {
        case 'value':
          callArgs.unshift(currentValue)
          break

        case 'length':
          callArgs.unshift(currentValue.length)
          break

        case 'type':
          callArgs.unshift(Array.isArray(currentValue) ? 'array' : typeof currentValue)
          break

        default:
          break
      }

      result = validatorFunc.apply(this, callArgs)

      if (this.__negateNext) {
        this.__negateNext = false
        if (result) {
          result.assertion = `not ${result.assertion}`
          result.condition = !result.condition
        }
      }

      if (this.__throwImmediate) {
        if (result.condition) {
          throw new ValidationError(result.assertion, this.__propertyName, result.value, this.__parentMeta)
        }
        return this
      }

      return result ?? {}
    }
  }
}





export default asValidator

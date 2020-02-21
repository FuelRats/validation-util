/* eslint-disable class-methods-use-this */
class AssertionError extends Error {
  constructor (message) {
    super(message)
    this.name = 'AssertionError'
  }
}





const asFormattedArrayString = (values) => {
  return `[ ${values.map((value) => {
    return `\`${value}\``
  }).join(', ')} ]`
}

const asValidator = (valueMode) => {
  return (_, __, descriptor) => {
    const validatorFunc = descriptor.value

    descriptor.value = function value (...args) {
      const callArgs = [...args]
      let result = null

      const currentValue = this._currentValue

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

      if (!valueMode || (valueMode && typeof currentValue !== 'undefined')) {
        result = validatorFunc.apply(this, callArgs)

        if (this._negateNext) {
          result.assertion = `not ${result.assertion}`
          result.condition = !result.condition
          this._negateNext = false
        }
      }

      if (this._throwImmediate) {
        if (result?.condition) {
          throw this._getAssertionError(result)
        }
        return this
      }

      return result ?? {}
    }
  }
}

const chainable = (_, __, descriptor) => {
  const originalFunc = descriptor.value

  descriptor.value = function value (...args) {
    originalFunc.apply(this, args)

    return this
  }
}





class ArgumentValidator {
  /***************************************************************************\
    Arguments and Value Management
  \***************************************************************************/

  _args = {}
  _argPointer = null

  get _currentValue () {
    return this._argPointer ? this._args[this._argPointer] : this._args
  }

  @chainable
  assert (argPointer) {
    this._argPointer = argPointer
  }

  expect (argPointer) {
    return this.assert(argPointer)
  }





  /***************************************************************************\
    Throw control
  \***************************************************************************/

  _throwImmediate = true
  _negateNext = false

  @chainable
  or (assertFunc) {
    this._throwImmediate = false

    const errors = assertFunc.apply(this, [this])

    if (Array.isArray(errors) && errors.every((error) => {
      return error?.condition
    })) {
      throw this._getAssertionError(this._combineAssertions(errors))
    }

    this._throwImmediate = true
  }

  @chainable
  not () {
    this._negateNext = true
  }




  /***************************************************************************\
    Object Metadata Management
  \***************************************************************************/

  _objMeta = null

  @chainable
  forObject (name, type = 'object') {
    this._objMeta = {
      name,
      type,
    }
  }

  forClass (className) {
    return this.forObject(className, 'class')
  }

  forFunc (funcName) {
    return this.forObject(funcName, 'function')
  }





  /***************************************************************************\
    Constructor
  \***************************************************************************/

  constructor (args = {}) {
    this._args = args
  }





  /***************************************************************************\
    Validators
  \***************************************************************************/

  @asValidator()
  toExist () {
    return {
      assertion: 'exist',
      condition: typeof this.currentValue === 'undefined',
      value: 'undefined',
    }
  }


  @asValidator()
  throwCustom (assertion, value) {
    return {
      assertion,
      condition: true,
      value,
    }
  }


  @asValidator('value')
  toBe (value, expectedValue) {
    return {
      assertion: `be \`${expectedValue}\``,
      condition: value !== expectedValue,
      value,
    }
  }

  @asValidator('value')
  toBeOneOf (value, ...expectedValues) {
    return {
      assertion: `be one of ${asFormattedArrayString(expectedValues)}`,
      condition: !expectedValues.includes(value),
      value,
    }
  }


  @asValidator('value')
  toBeInstanceOf (value, expectedClass, className = 'unknown') {
    return {
      assertion: `be instance of \`${className}\``,
      condition: !(value instanceof expectedClass),
      value,
    }
  }

  @asValidator('type')
  toBeOfType (valueType, expectedType) {
    return {
      assertion: `be of type \`${expectedType}\``,
      condition: valueType !== expectedType,
      value: valueType,
    }
  }

  @asValidator('type')
  toBeOneOfType (valueType, ...expectedTypes) {
    return {
      assertion: `be one of type ${asFormattedArrayString(expectedTypes)}`,
      condition: !expectedTypes.includes(valueType),
      value: valueType,
    }
  }


  @asValidator('value')
  toBeKeyOf (value, obj, objectName) {
    return {
      assertion: `be a key of \`${objectName}\``,
      condition: Reflect.has(obj, value),
    }
  }

  @asValidator('value')
  toBeValueOf (currentValue, _obj, objectName) {
    const obj = Array.isArray(_obj) ? _obj : Object.values(_obj)
    return {
      assertion: `be a value of \`${objectName}\``,
      condition: obj.some((value) => {
        return value === currentValue
      }),
    }
  }


  @asValidator('value')
  toContainKey (value, expectedKey) {
    return {
      assertion: `contain key \`${expectedKey}\``,
      condition: !Reflect.has(value, expectedKey),
    }
  }

  @asValidator('value')
  toContainValue (_currentValue, expectedValue) {
    const values = Array.isArray(_currentValue) ? _currentValue : Object.values(_currentValue)

    return {
      assertion: `contain value \`${expectedValue}\``,
      condition: !values.some((value) => {
        return value === expectedValue
      }),
    }
  }


  @asValidator('length')
  toHaveLength (currentLength, expectedLength) {
    return {
      assertion: `have a length of \`${expectedLength}\``,
      condition: currentLength !== expectedLength,
      value: currentLength,
    }
  }

  @asValidator('length')
  toHaveLengthGreaterThan (currentLength, minimumLength) {
    return {
      assertion: `have a length greater than \`${minimumLength}\``,
      condition: currentLength > minimumLength,
      value: currentLength,
    }
  }

  @asValidator('length')
  toHaveLengthLessThan (currentLength, maximumLength) {
    return {
      assertion: `have a length less than \`${maximumLength}\``,
      condition: currentLength < maximumLength,
      value: currentLength,
    }
  }

  @asValidator('length')
  toHaveLengthBetween (currentLength, minLength, maxLength) {
    return {
      assertion: `have a length between \`${minLength}\` and \`${maxLength}\``,
      condition: currentLength < minLength || currentLength > maxLength,
      value: currentLength,
    }
  }





  /***************************************************************************\
    Internal methods
  \***************************************************************************/

  _combineAssertions = (assertions) => {
    return assertions.reduce(
      (acc, error) => {
        acc.assertion += acc.assertion.length
          ? `, or ${error.assertion}`
          : error.assertion

        return acc
      },
      {
        assertion: '',
      },
    )
  }

  _getAssertionError = ({ assertion, value }) => {
    let message = ''

    if (this._argPointer) {
      message += `Expected argument \`${this._argPointer}\` `
    } else {
      message += 'Expected arguments '
    }

    const meta = this._objMeta
    if (meta) {
      message += `of ${meta.type} \`${meta.name}\` `
    }

    message += `to ${assertion}` ?? 'to be something, but whoever wrote this validator is a pepega.'

    if (value) {
      message += `, but got \`${value}\` instead.`
    } else {
      message += '.'
    }

    return new AssertionError(message)
  }
}





const validate = (args = {}) => {
  return new ArgumentValidator(args)
}





export default validate
export {
  AssertionError,
}

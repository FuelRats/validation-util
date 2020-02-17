/* eslint-disable class-methods-use-this */
class AssertionError extends Error {
  constructor (message) {
    super(message)
    this.name = 'AssertionError'
  }
}





const asFormattedArrayString = (values) => `[ ${values.map((value) => `\`${value}\``).join(', ')} ]`

const asValidator = (valueMode) => (target, name, descriptor) => {
  const validatorFunc = descriptor.value

  descriptor.value = function value (...args) {
    const callArgs = [...args]
    let result = null

    const currentValue = this._currentValue

    switch (valueMode) {
      case 'value':
        callArgs.unshift(currentValue)
        break

      case 'type':
        callArgs.unshift(Array.isArray(currentValue) ? 'array' : typeof currentValue)
        break

      default:
        break
    }

    if (!valueMode || (valueMode && currentValue)) {
      result = validatorFunc.apply(this, callArgs)
    }

    if (this._throwImmediate) {
      if (result && result.assertion) {
        throw this._getAssertionError(result)
      }
      return this
    }

    return result ?? undefined
  }
}

const chainable = (target, name, descriptor) => {
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

  @chainable
  or (assertFunc) {
    this._throwImmediate = false

    const errors = assertFunc.apply(this, [this])

    if (Array.isArray(errors) && errors.every((error) => error?.assertion)) {
      throw this._getAssertionError(this._combineAssertions(errors))
    }

    this._throwImmediate = true
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

  constructor (args) {
    if (!args || !Object.keys(args).length) {
      throw new TypeError('Expected validator to be created with arguments')
    }
    this._args = args
  }





  /***************************************************************************\
    Validators
  \***************************************************************************/

  @asValidator()
  toExist () {
    if (!this._currentValue) {
      return {
        assertion: 'to exist',
        value: 'undefined',
      }
    }

    return undefined
  }

  @asValidator('value')
  toBe (value, expectedValue) {
    if (value !== expectedValue) {
      return {
        assertion: `to be \`${expectedValue}\``,
        value,
      }
    }

    return undefined
  }

  @asValidator('value')
  toBeOneOf (value, ...expectedValues) {
    if (!expectedValues.includes(value)) {
      return {
        assertion: `to be one of ${asFormattedArrayString(expectedValues)}`,
      }
    }

    return undefined
  }

  @asValidator('value')
  toBeInstanceOf (value, expectedClass, className = 'unknown') {
    if (!(value instanceof expectedClass)) {
      return {
        assertion: `to be instance of \`${className}\``,
        value,
      }
    }

    return undefined
  }

  @asValidator('type')
  toBeOfType (valueType, expectedType) {
    if (valueType !== expectedType) {
      return {
        assertion: `to be of type \`${expectedType}\``,
        value: valueType,
      }
    }

    return undefined
  }

  @asValidator('type')
  toBeOneOfType (valueType, ...expectedTypes) {
    if (!expectedTypes.includes(valueType)) {
      return {
        assertion: `to be one of type ${asFormattedArrayString(expectedTypes)}`,
        value: valueType,
      }
    }

    return undefined
  }

  @asValidator('value')
  toBeKeyOf (value, obj, objectName) {
    if (Reflect.has(obj, value)) {
      return {
        assertion: `to be key of object \`${objectName}\``,
      }
    }

    return undefined
  }

  @asValidator('value')
  toBeValueOf (currentValue, _obj, objectName) {
    const obj = Array.isArray(_obj) ? _obj : Object.values(_obj)

    if (obj.some((value) => value === currentValue)) {
      return {
        assertion: `to be value of \`${objectName}\``,
      }
    }

    return undefined
  }

  @asValidator('value')
  toContainKey (value, expectedKey) {
    if (!Reflect.has(value, expectedKey)) {
      return {
        assertion: `to contain key \`${expectedKey}\``,
      }
    }

    return undefined
  }

  @asValidator('value')
  toContainValue (_currentValue, expectedValue) {
    const values = Array.isArray(_currentValue) ? _currentValue : Object.values(_currentValue)
    if (!values.some((value) => value === expectedValue)) {
      return {
        assertion: `to contain value \`${expectedValue}\``,
      }
    }

    return undefined
  }

  @asValidator('value')
  toBeOfLength (currentValue, expectedLength) {
    if (currentValue.length !== expectedLength) {
      return {
        assertion: `to be of length \`${expectedLength}\``,
        value: currentValue.length,
      }
    }

    return undefined
  }

  @asValidator('value')
  toBeOfLengthBetween (currentValue, minLength, maxLength) {
    const currentLength = currentValue.length

    if (currentLength < minLength || currentLength > maxLength) {
      return {
        assertion: `to be a length between \`${minLength}\` and \`${maxLength}\``,
        value: currentLength,
      }
    }

    return undefined
  }

  @asValidator()
  throwCustom (assertion) {
    return { assertion }
  }





  /***************************************************************************\
    Internal methods
  \***************************************************************************/

  _combineAssertions = (assertions) => assertions.reduce(
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

    message += assertion ?? 'to be something, but whoever wrote this validator is a pepega.'

    if (value) {
      message += `, but got \`${value}\` instead.`
    } else {
      message += '.'
    }

    return new AssertionError(message)
  }
}





const validate = (args = {}) => new ArgumentValidator(args)





export default validate

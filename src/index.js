const asFormattedArrayString = (values) => `[ ${values.map((value) => `\`${value}\``).join(' ')} ] `


class AssertionError extends Error {
  constructor (message) {
    super(message)
    this.name = 'AssertionError'
  }
}





const validate = (args = {}) => new (class ArgumentValidator {
  /***************************************************************************\
    Properties
  \***************************************************************************/

  _argPointer = ''
  _objName = null
  _objType = null
  _bufferErrors = false
  _buffer = {}





  /***************************************************************************\
    Buffer Mode Funcs
  \***************************************************************************/

  silently = (silent = true) => {
    this._bufferErrors = silent
    return this
  }

  readErrors = () => this._buffer





  /***************************************************************************\
    Object meta setters
  \***************************************************************************/

  forObject (objName, objType = 'object') {
    this._objName = objName
    this._objType = objType

    return this
  }

  forClass (className) {
    return this.forObject(className, 'class')
  }

  forFunc (funcName) {
    return this.forObject(funcName, 'function')
  }





  /***************************************************************************\
    Argument pointers
  \***************************************************************************/

  assert = (argPointer) => {
    this._argPointer = argPointer

    return this
  }

  expect = (argPointer) => this.assert(argPointer)





  /***************************************************************************\
    Argument assertions
  \***************************************************************************/

  toExist = () => {
    if (typeof this._currentValue() === 'undefined') {
      this._throwAssertionError('to exist', 'undefined')
    }
  }

  toBe = this.asValidator((currentValue, expectedValue) => {
    if (currentValue !== expectedValue) {
      this._throwAssertionError(`to be \`${expectedValue}\``, currentValue)
    }
  })

  toBeOneOf = this.asValidator((currentValue, ...expectedValues) => {
    if (!expectedValues.includes(currentValue)) {
      this._throwAssertionError(`to be one of ${asFormattedArrayString(expectedValues)}`)
    }
  })

  toBeInstanceOf = this.asValidator((currentValue, expectedClass, className = 'unknown') => {
    if (!(currentValue instanceof expectedClass)) {
      this._throwAssertionError(`to be instance of \`${className}\``)
    }
  })

  toBeOfType = this.asValidator((currentValue, expectedType) => {
    const currentValueType = typeof currentValue

    if (currentValueType !== expectedType) {
      this._throwAssertionError(`to be of type \`${expectedType}\``, currentValueType)
    }
  })

  toBeOneOfType = this.asValidator((currentValue, ...expectedTypes) => {
    const currentValueType = typeof currentValue

    if (!expectedTypes.includes(currentValueType)) {
      this._throwAssertionError(`to be one of type ${asFormattedArrayString(expectedTypes)}`, currentValueType)
    }
  })

  toBeKeyOf = this.asValidator((currentValue, obj, objectName) => {
    if (Reflect.has(obj, currentValue)) {
      this._throwAssertionError(`to be key of object \`${objectName}\``)
    }
  })

  toBeValueOf = this.asValidator((currentValue, _obj, objectName) => {
    const obj = Array.isArray(_obj) ? _obj : Object.values(_obj)

    if (obj.some((value) => value === currentValue)) {
      this._throwAssertionError(`to be value of \`${objectName}\``)
    }
  })

  throwCustom = (...funcArgs) => this._throwAssertionError(...funcArgs)





  /***************************************************************************\
    PRIVATE helpers
  \***************************************************************************/

  asValidator = (func) => (...funcArgs) => {
    const currentValue = this._currentValue()

    if (currentValue !== undefined) {
      func(currentValue, ...funcArgs)
    }

    return this
  }

  _currentValue = () => args?.[this._argPointer] ?? undefined

  _throwAssertionError = (assertion, result) => {
    // Expected argument `Name` of class `ClassName` to be of type `string`, but got `object` instead.
    // Expected argument `doStuff` of function `someFunc` to be of type `function`, but got `null` instead.
    // Expected argument `Name` of class `ClassName` to be of type `string`, but got `object` instead.
    const messageParts = []

    messageParts.push(`Expected argument \`${this._argPointer}\` `)

    if (this._objName && this._objType) {
      messageParts.push(`of ${this._objType} \`${this._objName}\` `)
    }

    messageParts.push(assertion ?? "to be something, but we don't know because whoever wrote this validator is a Pepega")

    if (result) {
      messageParts.push(`, but got \`${result}\` instead.`)
    } else {
      messageParts.push('.')
    }

    const error = new AssertionError(messageParts.join(''))

    if (this._bufferErrors) {
      this._buffer[this._argPointer] = error
    } else {
      throw error
    }
  }
})()





export default validate

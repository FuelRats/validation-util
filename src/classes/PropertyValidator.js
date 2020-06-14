import {
  asFormattedArrayString,
  combineAssertionMessages,
  asFormattedObjectKeyString,
} from '../util/formatters'
import ValidationError from './ValidationError'
import Validator from './Validator'





const validator = (_, __, descriptor) => {
  const validatorFunc = descriptor.value
  descriptor.value = function value (...args) {
    return this.resolve(validatorFunc.apply(this, args) ?? {})
  }
}

const enhancedTypeof = (value) => {
  if (Array.isArray(value)) {
    return 'array'
  }

  if (value === null) { /* eslint-disable-line eqeqeq */// Explicit check required
    return 'null'
  }

  return typeof value
}



export default class PropertyValidator extends Validator {
  /***************************************************************************\
    Class Properties
  \***************************************************************************/

  #propertyName = undefined
  #propertyValue = undefined
  #propertyType = undefined
  #propertyLength = undefined

  #nestMode = false
  #negateNext = false





  /***************************************************************************\
    Constructor
  \***************************************************************************/

  constructor (name, value, parentMeta) {
    super(parentMeta)
    this.#propertyName = name
    this.#propertyValue = value
    this.#propertyType = enhancedTypeof(value)
    this.#propertyLength = value?.length
  }





  /***************************************************************************\
    Assertion resolution
  \***************************************************************************/

  get not () {
    this.#negateNext = true

    return this
  }

  resolve (_assertion) {
    const assertion = { ..._assertion }

    if (this.#negateNext) {
      this.#negateNext = false

      assertion.message = `not ${assertion.message}`
      assertion.pass = !assertion.pass
    }

    if (this.#nestMode) {
      return assertion
    }

    if (!assertion.pass) {
      throw new ValidationError(assertion.message, this.#propertyName, assertion.value, this.parentMeta)
    }

    return this
  }





  /***************************************************************************\
    Assertion nesting
  \***************************************************************************/

  @validator
  nest (callback, loose) {
    const isTopLevelNest = !this.#nestMode

    this.#nestMode = true

    const assertions = callback.apply(this, [this]) // returns array of assertions which were resolved as objects.

    if (isTopLevelNest) {
      this.#nestMode = false
    }

    return {
      message: combineAssertionMessages(assertions, `, ${loose ? 'or' : 'and'} `),
      pass: assertions[loose ? 'some' : 'every']((assertion) => {
        return assertion.pass
      }),
    }
  }

  every (callback) {
    return this.nest(callback)
  }

  and (callback) {
    return this.nest(callback)
  }

  some (callback) {
    return this.nest(callback, true)
  }

  or (callback) {
    return this.nest(callback, true)
  }


  /***************************************************************************\
    Validator Extensions
  \***************************************************************************/

  extend (extensions = {}) {
    Object.entries(extensions).forEach(([name, assertFunc]) => {
      this[name] = (...args) => {
        return this.resolve(assertFunc([{
          name: this.#propertyName,
          value: this.#propertyValue,
          type: this.#propertyType,
          length: this.#propertyLength,
          parent: this.parentMeta,
        }, ...args]))
      }
    })
  }


  /***************************************************************************\
    Validators
  \***************************************************************************/

  @validator
  throwCustom (message, value, pass) {
    return {
      message,
      pass,
      value,
    }
  }


  @validator
  toExist () {
    const type = this.#propertyType

    return {
      message: 'exist',
      pass: !['undefined', 'null'].includes(type),
      value: type,
    }
  }


  @validator
  toBe (expectedValue) {
    const value = this.#propertyValue

    return {
      message: `be \`${expectedValue}\``,
      pass: value === expectedValue,
      value,
    }
  }

  @validator
  toStartWith (search, position = 0) {
    const value = this.#propertyValue

    return {
      message: `start with \`${search}\`${position ? ` at position ${position}` : ''}`,
      pass: value?.startsWith?.(search, position),
      value: value.substring(position, position + search.length),
    }
  }

  @validator
  toEndWith (search, length) {
    const searchLength = length ?? this.#propertyLength
    const value = this.#propertyValue

    return {
      message: `end with \`${search}\``,
      pass: value?.endsWith?.(search, searchLength),
      value: value.substring(searchLength - search.length, searchLength),
    }
  }


  @validator
  toBeOneOf (...expectedValues) {
    const value = this.#propertyValue

    return {
      message: `be one of ${asFormattedArrayString(expectedValues)}`,
      pass: expectedValues.includes(value),
      value,
    }
  }


  @validator
  toBeInstanceOf (expectedClass, className = 'class') {
    const value = this.#propertyValue

    return {
      message: `be instance of \`${className}\``,
      pass: value instanceof expectedClass,
    }
  }

  @validator
  toBeOfType (expectedType) {
    const type = this.#propertyType

    return {
      message: `be of type \`${expectedType}\``,
      pass: type === expectedType,
      value: type,
    }
  }

  @validator
  toBeOneOfType (...expectedTypes) {
    const type = this.#propertyType

    return {
      message: `be one of type ${asFormattedArrayString(expectedTypes)}`,
      pass: expectedTypes.includes(type),
      value: type,
    }
  }


  @validator
  toBeKeyOf (obj, objectName = 'object') {
    const value = this.#propertyValue

    return {
      message: `be a key of object \`${objectName}${asFormattedObjectKeyString(Reflect.ownKeys(obj))}\``,
      pass: Reflect.has(obj, value),
      value,
    }
  }


  @validator
  toBeValueOf (obj, objectName = 'object') {
    const value = this.#propertyValue
    const objValues = Array.isArray(obj) ? obj : Object.values(obj)

    return {
      message: `be a value of \`${objectName}\``,
      pass: objValues.some((objValue) => {
        return objValue === value
      }),
    }
  }


  @validator
  toContainKey (expectedKey) {
    const name = this.#propertyName
    const value = this.#propertyValue

    return {
      message: `contain key \`${String(expectedKey)}\``,
      pass: Reflect.has(value, expectedKey),
      value: `${name}${asFormattedObjectKeyString(Reflect.ownKeys(value))}`,
    }
  }

  @validator
  toContainValue (expectedValue) {
    const value = this.#propertyValue
    const valueMembers = Array.isArray(value) ? value : Object.values(value)

    return {
      message: `contain value \`${expectedValue}\``,
      pass: valueMembers.some((valueMember) => {
        return valueMember === expectedValue
      }),
    }
  }


  @validator
  toHaveLength (expectedLength) {
    const length = this.#propertyLength

    return {
      message: `have a length of \`${expectedLength}\``,
      pass: length === expectedLength,
      value: length,
    }
  }

  @validator
  toHaveLengthGreaterThan (minimumLength) {
    const length = this.#propertyLength

    return {
      message: `have a length greater than \`${minimumLength}\``,
      pass: length > minimumLength,
      value: length,
    }
  }

  @validator
  toHaveLengthLessThan (maximumLength) {
    const length = this.#propertyLength

    return {
      message: `have a length less than \`${maximumLength}\``,
      pass: length < maximumLength,
      value: length,
    }
  }

  @validator
  toHaveLengthBetween (minLength, maxLength) {
    const length = this.#propertyLength

    return {
      message: `have a length between \`${minLength}\` and \`${maxLength}\``,
      pass: length >= minLength && length <= maxLength,
      value: length,
    }
  }
}

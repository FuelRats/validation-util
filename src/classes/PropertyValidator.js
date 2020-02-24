import asValidator from '../decorators/asValidator'
import chainable from '../decorators/chainable'
import ValidationError from './ValidationError'
import Validator from './Validator'



const combineAssertions = (assertions) => {
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





const asFormattedArrayString = (values) => {
  return `[ ${values.map((value) => {
    return `\`${value}\``
  }).join(', ')} ]`
}





export default class PropertyValidator extends Validator {
  /***************************************************************************\
    Class Properties
  \***************************************************************************/

  __propertyName = undefined
  __propertyValue = undefined
  __throwImmediate = true
  __negateNext = false





  /***************************************************************************\
    Constructor
  \***************************************************************************/

  constructor (name, value, parentMeta) {
    super(parentMeta)
    this.__propertyName = name
    this.__propertyValue = value
  }





  /***************************************************************************\
    Throw control
  \***************************************************************************/

  @chainable
  or (assertFunc) {
    this.__throwImmediate = false

    const errors = assertFunc.apply(this, [this])
    const throwError = Array.isArray(errors) && errors.every((error) => {
      return error.condition
    })
    const combinedError = combineAssertions(errors)

    if (throwError) {
      throw new ValidationError(combinedError.assertion, this.__propertyName, undefined, this.__parentMeta)
    }

    this.__throwImmediate = true
  }

  get not () {
    this.__negateNext = true

    return this
  }





  /***************************************************************************\
    Validators
  \***************************************************************************/

  @asValidator()
  throwCustom (assertion, value, condition = true) {
    return {
      assertion,
      condition,
      value,
    }
  }


  @asValidator('value')
  toExist (value) {
    const isUndefined = typeof value === 'undefined'

    return {
      assertion: 'exist',
      condition: isUndefined || value === null, /* eslint-disable-line eqeqeq */// Explicit check required
      value: isUndefined ? 'undefined' : 'null',
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
  toStartWith (value, search, position) {
    return {
      assertion: `start with \`${search}\` ${position ? `at position ${position}` : ''}`,
      condition: value.startsWith?.(search, position),
      value,
    }
  }

  @asValidator('value')
  toEndWith (value, search, length) {
    return {
      assertion: `end with \`${value}\``,
      condition: value.endsWith(search, length),
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
}

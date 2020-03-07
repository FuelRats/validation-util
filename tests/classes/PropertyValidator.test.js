import PropertyValidator from '../../src/classes/PropertyValidator'
import ValidationError from '../../src/classes/ValidationError'
import { asFormattedArrayString, asFormattedArgumentString } from '../../src/util/formatters'



const setupValidator = (value) => {
  return new PropertyValidator('testValue', value, {
    name: 'PropertyValidatorTest',
    type: 'test',
  })
}

class TestClass {
  static foo = 'bar'
}
class BadTestClass {}

/**
 * funcName - name of the function to test
 * testValue - value to test against
 * passArgs - arguments to the function which will cause a passing condition.
 * failArgs - arguments to the function which will cause a failing condition.
 * throwMessage - message that will throw when the function fails
 * manualTests - any additional tests to be ran within the same description block.
 */
const validatorTests = [
  [
    'throwCustom',
    {},
    ['pass', undefined, true],
    ['fail', undefined, false],
    'Expected argument `testValue` of test `PropertyValidatorTest` to fail.',
  ],

  [
    'toExist',
    {},
    [],
    undefined,
    undefined,
    () => {
      test('does throw ValidationError when negated with `.not`', () => {
        expect(() => {
          setupValidator(() => {}).not.toExist()
        }).toThrowWithMessage(ValidationError, 'Expected argument `testValue` of test `PropertyValidatorTest` to not exist, but got `function` instead.')
      })
    },
  ],

  [
    'toExist',
    undefined, // test if undefined throws
    false,
    [],
    'Expected argument `testValue` of test `PropertyValidatorTest` to exist, but got `undefined` instead.',
    () => {
      test('does not throw when negated with `.not`', () => {
        expect(() => {
          setupValidator(undefined).not.toExist()
        }).not.toThrowWithMessage(ValidationError, 'notToExist')
      })
    },
  ],

  [
    'toBe',
    'foo',
    'foo',
    'bar',
    'Expected argument `testValue` of test `PropertyValidatorTest` to be `bar`, but got `foo` instead.',
  ],

  [
    'toStartWith',
    'foo',
    'fo',
    'ba',
    'Expected argument `testValue` of test `PropertyValidatorTest` to start with `ba`, but got `fo` instead.',
  ],

  [
    'toEndWith',
    'foo',
    'oo',
    'ar',
    'Expected argument `testValue` of test `PropertyValidatorTest` to end with `ar`, but got `oo` instead.',
  ],

  [
    'toBeOneOf',
    'foo',
    ['foo'],
    ['bar', 'baz'],
    'Expected argument `testValue` of test `PropertyValidatorTest` to be one of [ `bar`, `baz` ], but got `foo` instead.',
  ],

  [
    'toBeInstanceOf',
    (new TestClass()),
    TestClass,
    [BadTestClass, 'BadTestClass'],
    'Expected argument `testValue` of test `PropertyValidatorTest` to be instance of `BadTestClass`.',
  ],

  [
    'toBeOfType',
    'foo',
    'string',
    'function',
    'Expected argument `testValue` of test `PropertyValidatorTest` to be of type `function`, but got `string` instead.',
  ],

  [
    'toBeOneOfType',
    'foo',
    ['string', 'function'],
    ['array', 'function'],
    'Expected argument `testValue` of test `PropertyValidatorTest` to be one of type [ `array`, `function` ], but got `string` instead.',
  ],

  [
    'toBeKeyOf',
    'foo',
    TestClass,
    [BadTestClass, 'BadTestClass'],
    'Expected argument `testValue` of test `PropertyValidatorTest` to be a key of object `BadTestClass{ `length`, `name`, `prototype` }`, but got `foo` instead.',
  ],

  [
    'toBeValueOf',
    'bar',
    TestClass,
    [BadTestClass, 'BadTestClass'],
    'Expected argument `testValue` of test `PropertyValidatorTest` to be a value of `BadTestClass`.',
  ],

  [
    'toContainKey',
    { foo: 'bar', baz: 'buzz' },
    'foo',
    'bar',
    'Expected argument `testValue` of test `PropertyValidatorTest` to contain key `bar`, but got `testValue{ `foo`, `baz` }` instead.',
  ],

  [
    'toContainValue',
    { foo: 'bar' },
    'bar',
    'foo',
    'Expected argument `testValue` of test `PropertyValidatorTest` to contain value `foo`.',
  ],

  [
    'toHaveLength',
    ['foo'],
    [1],
    [0],
    'Expected argument `testValue` of test `PropertyValidatorTest` to have a length of `0`, but got `1` instead.',
  ],

  [
    'toHaveLengthGreaterThan',
    ['foo'],
    [0],
    [100],
    'Expected argument `testValue` of test `PropertyValidatorTest` to have a length greater than `100`, but got `1` instead.',
  ],

  [
    'toHaveLengthLessThan',
    ['foo'],
    [100],
    [1],
    'Expected argument `testValue` of test `PropertyValidatorTest` to have a length less than `1`, but got `1` instead.',
  ],

  [
    'toHaveLengthBetween',
    ['foo'],
    [0, 1],
    [100, 1000],
    'Expected argument `testValue` of test `PropertyValidatorTest` to have a length between `100` and `1000`, but got `1` instead.',
  ],
]


describe('class PropertyValidator', () => {
  // Basic validator tests
  validatorTests.forEach((testConf) => {
    let [funcName, testValue, passArgs, failArgs, throwMessage, manualTests] = testConf

    const validator = setupValidator(testValue)

    describe(`.${funcName}() with test value \`${Array.isArray(testValue) ? asFormattedArrayString(testValue, "'") : testValue}\``, () => {
      if (passArgs) {
        if (!Array.isArray(passArgs)) {
          passArgs = [passArgs]
        }

        test(`does not throw with args ${asFormattedArgumentString(passArgs)}`, () => {
          expect(() => {
            validator[funcName](...passArgs)
          }).not.toThrow()
        })
      }

      if (failArgs) {
        if (!Array.isArray(failArgs)) {
          failArgs = [failArgs]
        }

        test(`does throw ValidationError with args ${asFormattedArgumentString(failArgs)}`, () => {
          expect(() => {
            validator[funcName](...failArgs)
          }).toThrowWithMessage(ValidationError, throwMessage)
        })
      }

      manualTests?.()
    })
  })

  describe(".nest() with test value `[ 'foo' ]`", () => {
    const testValue = ['foo']
    const validator = setupValidator(testValue)

    describe('in strict mode', () => {
      test('does not throw if all assertions pass', () => {
        expect(() => {
          validator.nest(() => {
            return [
              validator.toBeOfType('array'), // pass
              validator.toContainValue('foo'), // pass
            ]
          })
        }).not.toThrow()
      })

      test('does throw ValidationError if any assertion fails', () => {
        expect(() => {
          validator.nest(() => {
            return [
              validator.toBeOfType('string'), // fail
              validator.toContainValue('foo'), // pass
            ]
          })
        }).toThrowWithMessage(ValidationError, 'Expected argument `testValue` of test `PropertyValidatorTest` to be of type `string`, and contain value `foo`.')
      })
    })

    describe('in loose mode', () => {
      test('does not throw if all assertions pass', () => {
        expect(() => {
          validator.nest(() => {
            return [
              validator.toBeOfType('array'), // pass
              validator.toContainValue('foo'), // pass
            ]
          }, true)
        }).not.toThrow()
      })

      test('does not throw if some assertions fail', () => {
        expect(() => {
          validator.nest(() => {
            return [
              validator.toBeOfType('string'), // fail
              validator.toContainValue('foo'), // pass
            ]
          }, true)
        }).not.toThrow()
      })

      test('does throw if all assertions fail', () => {
        expect(() => {
          validator.nest(() => {
            return [
              validator.toBeOfType('string'), // fail
              validator.toContainValue('bar'), // fail
            ]
          }, true)
        }).toThrowWithMessage(ValidationError, 'Expected argument `testValue` of test `PropertyValidatorTest` to be of type `string`, or contain value `bar`.')
      })
    })
  })
})

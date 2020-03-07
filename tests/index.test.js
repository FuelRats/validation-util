import {
  assert,
  validate,
  ValidationError,
} from '../src'

import ArgumentCollection from '../src/classes/ArgumentCollection'
import PropertyValidator from '../src/classes/PropertyValidator'




const args = {
  foo: 'bar',
  baz: () => {},
  biz: { things: 'stuff' },
}





describe('assert()', () => {
  const validator = assert('foo', args.foo, 'test', 'class')
  test('returns a new PoprertyValidator.', () => {
    expect(validator).toBeInstanceOf(PropertyValidator)
  })

  test('correctly passes arguments to PropertyValidator.', () => {
    expect(() => {
      validator.toBe('baz')
    }).toThrowWithMessage(ValidationError, 'Expected argument `foo` of class `test` to be `baz`, but got `bar` instead.')
  })
})



describe('validate', () => {
  const validator = validate(args).forClass('test')

  test('returns a new ArgumentCollection', () => {
    expect(validator).toBeInstanceOf(ArgumentCollection)
  })

  // Normally this would be a test for the class itself, but this is a good way to ensure arguments given to validate() are properly given to PropertyValidator
  describe('.assert()', () => {
    test('returns a new PoprertyValidator.', () => {
      expect(validator.assert('foo')).toBeInstanceOf(PropertyValidator)
    })
  })
})

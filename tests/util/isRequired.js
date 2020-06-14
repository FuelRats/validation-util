import isRequired from '../../src/util/isRequired'






describe('isRequired()', () => {
  test('Throws ValidationError when called.', () => {
    expect(() => {
      isRequired('foo')
    }).toThrowWithMessage(ValidationError, 'Expected argument `foo` to be defined.')
  })

  test('Throws wish custom message when given override', () => {
    expect(() => {
      isRequired('foo', true)
    }).toThrowWithMessage(ValidationError, 'foo')
  })
})

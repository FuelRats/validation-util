import isRequired from '../../src/util/isRequired'





describe('isRequired()', () => {
  test('Throws ValidationError when called.', () => {
    expect(() => {
      isRequired('foo')
    }).toThrowWithMessage(TypeError, 'Expected argument `foo` to be defined.')
  })

  test('Throws wish custom message when given override', () => {
    expect(() => {
      isRequired('foo', true)
    }).toThrowWithMessage(TypeError, 'foo')
  })
})

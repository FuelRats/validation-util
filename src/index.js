import ArgumentCollection from './classes/ArgumentCollection'
import PropertyValidator from './classes/PropertyValidator'
import ValidationError from './classes/ValidationError'





const validate = (args = {}) => {
  return new ArgumentCollection(args)
}





const assert = (arg, argName = 'argument', parentName, parentType) => {
  const parentMeta = (parentName || parentType)
    ? {
      name: parentName ?? 'object',
      type: parentType ?? 'object',
    }
    : undefined


  return new PropertyValidator(arg, argName, parentMeta)
}





export default validate
export {
  assert,
  validate,
  ValidationError,
}

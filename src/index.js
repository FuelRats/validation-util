import ArgumentCollection from './classes/ArgumentCollection'
import PropertyValidator from './classes/PropertyValidator'
import ValidationError from './classes/ValidationError'
import isRequired from './util/isRequired'




const validate = (args = {}) => {
  return new ArgumentCollection(args)
}





const assert = (argName, argValue, parentName, parentType) => {
  const parentMeta = (parentName || parentType)
    ? {
      name: parentName ?? 'object',
      type: parentType ?? 'object',
    }
    : undefined

  return new PropertyValidator(argName, argValue, parentMeta)
}





export default validate
export {
  assert,
  validate,
  ValidationError,
  isRequired,
}

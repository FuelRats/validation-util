import PropertyValidator from './PropertyValidator'
import Validator from './Validator'





export default class ArgumentValidator extends Validator {
  /***************************************************************************\
    Arguments and Value Management
  \***************************************************************************/

  __args = {}

  assert (argName, argValue) {
    return new PropertyValidator(argName, argValue ?? this.__args[argName], this.__parentMeta)
  }

  expect (...args) {
    return this.assert(...args)
  }





  /***************************************************************************\
    Constructor
  \***************************************************************************/

  constructor (args = {}) {
    super()
    this.__args = args
  }
}

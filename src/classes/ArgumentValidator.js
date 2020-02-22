import PropertyValidator from './PropertyValidator'
import Validator from './Validator'





export default class ArgumentValidator extends Validator {
  /***************************************************************************\
    Arguments and Value Management
  \***************************************************************************/

  __args = {}

  assert (argName) {
    return new PropertyValidator(argName, this.__args[argName], this.__parentMeta)
  }

  expect (argPointer) {
    return this.assert(argPointer)
  }





  /***************************************************************************\
    Constructor
  \***************************************************************************/

  constructor (args = {}) {
    super()
    this.__args = args
  }
}

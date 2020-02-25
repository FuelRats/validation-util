import PropertyValidator from './PropertyValidator'
import Validator from './Validator'





export default class ArgumentValidator extends Validator {
  /***************************************************************************\
    Arguments and Value Management
  \***************************************************************************/

  #args = {}

  assert (argName, argValue) {
    return new PropertyValidator(argName, argValue ?? this.#args[argName], this.parentMeta)
  }

  expect (...args) {
    return this.assert(...args)
  }

  update (newArgs = {}) {
    this.#args = newArgs

    return this
  }





  /***************************************************************************\
    Constructor
  \***************************************************************************/

  constructor (args = {}) {
    super()
    this.#args = args
  }
}

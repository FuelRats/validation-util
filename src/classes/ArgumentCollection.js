import PropertyValidator from './PropertyValidator'
import Validator from './Validator'





export default class ArgumentCollection extends Validator {
  /***************************************************************************\
    Arguments and Value Management
  \***************************************************************************/

  #args = {}
  #extensions = undefined

  assert (argName, argValue) {
    const validator = new PropertyValidator(argName, argValue ?? this.#args[argName], this.parentMeta)

    if (this.#extensions) {
      validator.extend(this.#extensions)
    }

    return validator
  }

  expect (...args) {
    return this.assert(...args)
  }

  update (newArgs = {}) {
    this.#args = newArgs

    return this
  }

  extend (extensions) {
    this.#extensions = {
      ...this.#extensions,
      ...extensions,
    }
  }





  /***************************************************************************\
    Constructor
  \***************************************************************************/

  constructor (args = {}) {
    super()
    this.#args = args
  }
}

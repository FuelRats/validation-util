export default class Validator {
  /***************************************************************************\
    Class Properties
  \***************************************************************************/

  #parentMeta = undefined





  /***************************************************************************\
    Constructor
  \***************************************************************************/

  constructor (meta) {
    this.#parentMeta = meta
  }





  /***************************************************************************\
    Object Metadata Management
  \***************************************************************************/

  get parentMeta () {
    return this.#parentMeta
  }

  forObject (name, type = 'object') {
    this.#parentMeta = {
      name,
      type,
    }

    return this
  }

  forClass (className) {
    return this.forObject(className, 'class')
  }

  forFunc (funcName) {
    return this.forObject(funcName, 'function')
  }
}

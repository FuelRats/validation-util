import chainable from '../decorators/chainable'





export default class Validator {
  /***************************************************************************\
    Class Properties
  \***************************************************************************/
  __parentMeta = undefined





  /***************************************************************************\
    Constructor
  \***************************************************************************/

  constructor (meta) {
    this.__parentMeta = meta
  }





  /***************************************************************************\
    Object Metadata Management
  \***************************************************************************/

  @chainable
  forObject (name, type = 'object') {
    this.__parentMeta = {
      name,
      type,
    }
  }

  forClass (className) {
    return this.forObject(className, 'class')
  }

  forFunc (funcName) {
    return this.forObject(funcName, 'function')
  }
}

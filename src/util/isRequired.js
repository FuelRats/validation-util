import ValidationError from '../classes/ValidationError'

export default function isRequired (pointer, override) {
  throw new ValidationError(override ? pointer : `Expected argument \`${pointer}\` to be defined.`)
}

export default function isRequired (pointer, override) {
  throw new TypeError(override ? pointer : `Expected argument \`${pointer}\` to be defined.`)
}

export function formatFunctionString (value) {
  let newValue = value
  const newLineIndex = newValue.indexOf('\n')

  if (newLineIndex) {
    newValue = newValue.substring(0, newLineIndex - 2)
  }

  return `[${newValue}]`
}

export function asFormattedArrayString (values, strEnc = '`', openChar = '[ ', closeChar = ' ]') {
  return `${openChar}${values.map((value) => {
    let valueString = value?.toString()

    if (typeof value === 'function') {
      valueString = formatFunctionString(valueString)
    }

    return `${strEnc}${valueString}${strEnc}`
  }).join(', ')}${closeChar}`
}

export function asFormattedArgumentString (values) {
  return asFormattedArrayString(values, '', '(', ')')
}

export function asFormattedObjectKeyString (values) {
  return asFormattedArrayString(values, '`', '{ ', ' }')
}

export function combineAssertionMessages (assertions, separator = ', ') {
  return assertions.reduce(
    (acc, assertion) => {
      return acc.length
        ? `${acc}${separator}${assertion.message}`
        : assertion.message
    },
    '',
  )
}

export const formatFunctionString = (value) => {
  let newValue = value
  const newLineIndex = newValue.indexOf('\n')

  if (newLineIndex) {
    newValue = newValue.substring(0, newLineIndex - 2)
  }

  return `[${newValue}]`
}


export const asFormattedArrayString = (values, strEnc = '`', openChar = '[ ', closeChar = ' ]') => {
  return `${openChar}${values.map((value) => {
    let valueString = value?.toString()

    if (typeof value === 'function') {
      valueString = formatFunctionString(valueString)
    }

    return `${strEnc}${valueString}${strEnc}`
  }).join(', ')}${closeChar}`
}


export const asFormattedArgumentString = (values) => {
  return asFormattedArrayString(values, '', '(', ')')
}

export const asFormattedObjectKeyString = (values) => {
  return asFormattedArrayString(values, '`', '{ ', ' }')
}



export const combineAssertionMessages = (assertions, separator = ', ') => {
  return assertions.reduce(
    (acc, assertion) => {
      return acc.length
        ? `${acc}${separator}${assertion.message}`
        : assertion.message
    },
    '',
  )
}

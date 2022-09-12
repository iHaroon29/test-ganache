const dataValidation = async (tagId) => {
  const form = document.getElementById(tagId)
  let childrenNodes = [...form.children].slice(0, -1)
  childrenNodes.forEach((node) => {
    if (!node.checkValidity()) {
      throw new Error(node.validationMessage)
    }
  })
}

const captureData = async (tagId) => {
  return new FormData(document.getElementById(tagId)).entries()
}
const processFormData = async (data) => {
  const response = {}
  for (const entry of data) {
    response[`${entry[0]}`] = entry[1]
  }
  return JSON.stringify(response)
}

export { dataValidation, captureData, processFormData }

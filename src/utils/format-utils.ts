export function formatParams(param: string): string {
  return param.toLowerCase().replace(/\s+/g, '-')
}

export function validateInput(text: string): void {
  const regex = /^[A-Za-z\s]*$/
  if (!regex.test(text)) {
    throw new Error('Please use only letters and spaces.')
  }
}

export function formatUrl(baseUrl: string, params: Record<string, string>): string {
  const url = new URL(baseUrl)
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.append(key, value)
    }
  })
  return url.toString()
}

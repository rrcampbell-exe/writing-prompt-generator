import { describe, it, expect } from 'vitest'
import { formatParams, validateInput, formatUrl } from './format-utils'

describe('formatParams', () => {
  it('formats a string by converting to lowercase and replacing spaces with hyphens', () => {
    const input = 'Dystopian future'
    const expectedOutput = 'dystopian-future'
    expect(formatParams(input)).toBe(expectedOutput)
  })

  it('handles empty strings', () => {
    const input = ''
    const expectedOutput = ''
    expect(formatParams(input)).toBe(expectedOutput)
  })
})

describe('validateInput', () => {
  it('does not throw an error for valid input', () => {
    const input = 'Fantasy'
    expect(() => validateInput(input)).not.toThrow()
  })

  it('throws an error for invalid input', () => {
    const input = 'Fantasy 123'
    expect(() => validateInput(input)).toThrow('Please use only letters and spaces.')
  })

  it('throws an error for input with special characters', () => {
    const input = 'Fantasy@World'
    expect(() => validateInput(input)).toThrow('Please use only letters and spaces.')
  })
})

describe('formatUrl', () => {
  it('formats a URL with given parameters', () => {
    const baseUrl = 'http://example.com'
    const params = { genre: 'fantasy', theme: 'making-friends' }
    const expectedOutput = 'http://example.com/?genre=fantasy&theme=making-friends'
    expect(formatUrl(baseUrl, params)).toBe(expectedOutput)
  })

  it('handles empty parameters', () => {
    const baseUrl = 'http://example.com'
    const params = { genre: '', theme: '' }
    const expectedOutput = 'http://example.com/'
    expect(formatUrl(baseUrl, params)).toBe(expectedOutput)
  })

  it('ignores parameters with empty values', () => {
    const baseUrl = 'http://example.com'
    const params = { genre: 'fantasy', theme: '' }
    const expectedOutput = 'http://example.com/?genre=fantasy'
    expect(formatUrl(baseUrl, params)).toBe(expectedOutput)
  })
})

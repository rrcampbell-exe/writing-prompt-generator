import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Prompt from './Prompt'
import * as formatUtils from '../utils/format-utils'

const mockFetch = (response: any, status: number = 200) => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve(response),
      status,
      ok: status >= 200 && status < 300,
      headers: new Headers(),
      redirected: false,
      statusText: status === 429 ? 'Too Many Requests' : 'OK',
      type: 'basic',
      url: '',
      clone: function() { return this; },
      body: null,
      bodyUsed: false,
      arrayBuffer: async function() { return new ArrayBuffer(0); },
      blob: async function() { return new Blob(); },
      formData: async function() { return new FormData(); },
      text: async function() { return ''; }
    } as Response)
  )
}

describe('Prompt component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    const { container } = render(<Prompt />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('fetches and displays a prompt', async () => {
    const mockResponse = { response: 'This is a test prompt.' }
    mockFetch(mockResponse)

    render(<Prompt />)

    await waitFor(() => expect(screen.getByText(mockResponse.response)).toBeInTheDocument())
  })

  it('displays an error message when fetch fails', async () => {
    global.fetch = vi.fn(() =>
      Promise.reject(new Error('Failed to fetch prompt. Please try again later.'))
    )

    render(<Prompt />)

    await waitFor(() => expect(screen.getByText(/failed to fetch prompt/i)).toBeInTheDocument())
  })

  it('displays input fields when "Add Genre or Theme" button is clicked', () => {
    render(<Prompt />)
    fireEvent.click(screen.getByText(/add genre or theme/i))
    expect(screen.getByPlaceholderText(/genre/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/theme/i)).toBeInTheDocument()
  })

  it('validates input and fetches a new prompt when "Fetch New Prompt" button is clicked', async () => {
    const mockResponse = { response: 'This is a new test prompt.' }
    mockFetch(mockResponse)

    const validateInputSpy = vi.spyOn(formatUtils, 'validateInput').mockImplementation(() => {})

    render(<Prompt />)
    fireEvent.click(screen.getByText(/add genre or theme/i))
    fireEvent.change(screen.getByPlaceholderText(/genre/i), { target: { value: 'Fantasy' } })
    fireEvent.change(screen.getByPlaceholderText(/theme/i), { target: { value: 'Adventure' } })
    fireEvent.click(screen.getByText(/fetch new prompt/i))

    await waitFor(() => expect(validateInputSpy).toHaveBeenCalledTimes(2))
    await waitFor(() => expect(screen.getByText(mockResponse.response)).toBeInTheDocument())
  })

  it('displays a rate limit error and starts a countdown', async () => {
    const mockResponse = { error: 'Easy, eager writer. You have reached the rate limit.' }
    mockFetch(mockResponse, 429)

    render(<Prompt />)

    await waitFor(() => expect(screen.getByText(mockResponse.error)).toBeInTheDocument())
    await waitFor(() => expect(screen.getByText(/try again in/i)).toBeInTheDocument())
  })
})

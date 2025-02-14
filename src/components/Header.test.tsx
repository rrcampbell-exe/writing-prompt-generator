import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Header from './Header'

describe('Header component', () => {
  it('renders the correct text', () => {
    const { getByText } = render(<Header />)
    expect(getByText("Ryan R. Campbell's")).toBeInTheDocument()
    expect(getByText('📖 Writing Prompt Generator ✍️')).toBeInTheDocument()
  })
})

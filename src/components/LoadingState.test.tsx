import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LoadingState from './LoadingState'

describe('LoadingState component', () => {
  it('renders with the correct class', () => {
    const { container } = render(<LoadingState />)
    expect(container.firstChild).toHaveClass('loading-state')
  })
})

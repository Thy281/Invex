import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Modal from '../Modal'

describe('Modal', () => {
  test('renders when open', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Test Modal">
        <p>Modal content</p>
      </Modal>,
    )
    expect(screen.getByText('Test Modal')).toBeTruthy()
    expect(screen.getByText('Modal content')).toBeTruthy()
  })

  test('does not render when closed', () => {
    render(
      <Modal open={false} onClose={vi.fn()} title="Hidden Modal">
        <p>Content</p>
      </Modal>,
    )
    expect(screen.queryByText('Hidden Modal')).toBeNull()
  })

  test('calls onClose when close button clicked', () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose} title="Test">
        <p>Content</p>
      </Modal>,
    )
    const closeButton = screen.getByRole('button')
    fireEvent.click(closeButton)
    expect(onClose).toHaveBeenCalledOnce()
  })

  test('renders children content', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Test">
        <div data-testid="child">Child element</div>
      </Modal>,
    )
    expect(screen.getByTestId('child')).toBeTruthy()
    expect(screen.getByText('Child element')).toBeTruthy()
  })
})

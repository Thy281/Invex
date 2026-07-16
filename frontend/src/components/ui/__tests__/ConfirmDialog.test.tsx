import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ConfirmDialog from '../ConfirmDialog'

describe('ConfirmDialog', () => {
  test('renders title and message', () => {
    render(
      <ConfirmDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Confirm Delete"
        message="Are you sure you want to delete this?"
      />,
    )
    expect(screen.getByText('Confirm Delete')).toBeTruthy()
    expect(screen.getByText('Are you sure you want to delete this?')).toBeTruthy()
  })

  test('calls onConfirm when Delete clicked', () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={onConfirm}
        title="Delete"
        message="Sure?"
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  test('calls onClose when Cancel clicked', () => {
    const onClose = vi.fn()
    render(
      <ConfirmDialog
        open={true}
        onClose={onClose}
        onConfirm={vi.fn()}
        title="Delete"
        message="Sure?"
      />,
    )
    fireEvent.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  test('shows loading state', () => {
    render(
      <ConfirmDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete"
        message="Sure?"
        loading={true}
      />,
    )
    expect(screen.getByText('Deleting...')).toBeTruthy()
  })
})

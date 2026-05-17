import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Home from '../page'

describe('Home page', () => {
  it('renders all 6 chips', () => {
    render(<Home />)
    expect(screen.getByText('Execute now')).toBeInTheDocument()
    expect(screen.getByText('Research live')).toBeInTheDocument()
    expect(screen.getByText('Architect it')).toBeInTheDocument()
    expect(screen.getByText('Ship it')).toBeInTheDocument()
    expect(screen.getByText('Document it')).toBeInTheDocument()
    expect(screen.getByText('Check status')).toBeInTheDocument()
  })

  it('disables both action buttons when task is empty', () => {
    render(<Home />)
    expect(screen.getByRole('button', { name: 'Route Task' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Fast Execute Here' })).toBeDisabled()
  })

  it('enables action buttons when task has content', () => {
    render(<Home />)
    const textarea = screen.getByPlaceholderText('What needs to move forward?')
    fireEvent.change(textarea, { target: { value: 'Build the login page' } })
    expect(screen.getByRole('button', { name: 'Route Task' })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'Fast Execute Here' })).not.toBeDisabled()
  })

  it('keeps buttons disabled when task is only whitespace', () => {
    render(<Home />)
    const textarea = screen.getByPlaceholderText('What needs to move forward?')
    fireEvent.change(textarea, { target: { value: '   ' } })
    expect(screen.getByRole('button', { name: 'Route Task' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Fast Execute Here' })).toBeDisabled()
  })

  it('applies selected styles to a chip on click', () => {
    render(<Home />)
    const chip = screen.getByText('Execute now')
    fireEvent.click(chip)
    expect(chip).toHaveClass('bg-neutral-100')
  })

  it('deselects a chip when clicked again', () => {
    render(<Home />)
    const chip = screen.getByText('Execute now')
    fireEvent.click(chip)
    fireEvent.click(chip)
    expect(chip).not.toHaveClass('bg-neutral-100')
  })

  it('selecting a new chip deselects the previous one', () => {
    render(<Home />)
    const executeChip = screen.getByText('Execute now')
    const shipChip = screen.getByText('Ship it')
    fireEvent.click(executeChip)
    fireEvent.click(shipChip)
    expect(executeChip).not.toHaveClass('bg-neutral-100')
    expect(shipChip).toHaveClass('bg-neutral-100')
  })

  it('Route Task alert includes the selected chip id and task', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    render(<Home />)
    fireEvent.change(screen.getByPlaceholderText('What needs to move forward?'), {
      target: { value: 'My task' },
    })
    fireEvent.click(screen.getByText('Ship it'))
    fireEvent.click(screen.getByRole('button', { name: 'Route Task' }))
    expect(alertSpy).toHaveBeenCalledWith('Routed: ship\n\nMy task')
    alertSpy.mockRestore()
  })

  it('Route Task alert uses "auto" when no chip is selected', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    render(<Home />)
    fireEvent.change(screen.getByPlaceholderText('What needs to move forward?'), {
      target: { value: 'My task' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Route Task' }))
    expect(alertSpy).toHaveBeenCalledWith('Routed: auto\n\nMy task')
    alertSpy.mockRestore()
  })

  it('Fast Execute alert shows the task text', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    render(<Home />)
    fireEvent.change(screen.getByPlaceholderText('What needs to move forward?'), {
      target: { value: 'Quick task' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Fast Execute Here' }))
    expect(alertSpy).toHaveBeenCalledWith('Executing here:\n\nQuick task')
    alertSpy.mockRestore()
  })
})

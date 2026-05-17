import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
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

  it('marks a chip as pressed on click', () => {
    render(<Home />)
    const chip = screen.getByText('Execute now')
    fireEvent.click(chip)
    expect(chip).toHaveAttribute('aria-pressed', 'true')
  })

  it('unpresses a chip when clicked again', () => {
    render(<Home />)
    const chip = screen.getByText('Execute now')
    fireEvent.click(chip)
    fireEvent.click(chip)
    expect(chip).toHaveAttribute('aria-pressed', 'false')
  })

  it('selecting a new chip unpresses the previous one', () => {
    render(<Home />)
    const executeChip = screen.getByText('Execute now')
    const shipChip = screen.getByText('Ship it')
    fireEvent.click(executeChip)
    fireEvent.click(shipChip)
    expect(executeChip).toHaveAttribute('aria-pressed', 'false')
    expect(shipChip).toHaveAttribute('aria-pressed', 'true')
  })

  describe('alert behavior', () => {
    beforeEach(() => {
      vi.spyOn(window, 'alert').mockImplementation(() => {})
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('Route Task alert includes the selected chip id and task', () => {
      render(<Home />)
      fireEvent.change(screen.getByPlaceholderText('What needs to move forward?'), {
        target: { value: 'My task' },
      })
      fireEvent.click(screen.getByText('Ship it'))
      fireEvent.click(screen.getByRole('button', { name: 'Route Task' }))
      expect(window.alert).toHaveBeenCalledWith('Routed: ship\n\nMy task')
    })

    it('Route Task alert uses "auto" when no chip is selected', () => {
      render(<Home />)
      fireEvent.change(screen.getByPlaceholderText('What needs to move forward?'), {
        target: { value: 'My task' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Route Task' }))
      expect(window.alert).toHaveBeenCalledWith('Routed: auto\n\nMy task')
    })

    it('Fast Execute alert shows the task text', () => {
      render(<Home />)
      fireEvent.change(screen.getByPlaceholderText('What needs to move forward?'), {
        target: { value: 'Quick task' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Fast Execute Here' }))
      expect(window.alert).toHaveBeenCalledWith('Executing here:\n\nQuick task')
    })
  })
})

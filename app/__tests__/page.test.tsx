import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Home from '../page'

vi.mock('@/components/overview-tab', () => ({ default: () => <div>OverviewTab</div> }))
vi.mock('@/components/protocols-tab', () => ({ default: () => <div>ProtocolsTab</div> }))
vi.mock('@/components/sprint-linker-tab', () => ({ default: () => <div>SprintLinkerTab</div> }))
vi.mock('@/components/resumption-log-tab', () => ({ default: () => <div>ResumptionLogTab</div> }))
vi.mock('@/components/biometrics-tab', () => ({ default: () => <div>BiometricsTab</div> }))
vi.mock('@/components/constraint-validator-tab', () => ({ default: () => <div>ConstraintValidatorTab</div> }))
vi.mock('@/components/codex-tab', () => ({ default: () => <div>CodexTab</div> }))

describe('Home page — tab shell', () => {
  it('renders the Legacy Codex heading', () => {
    render(<Home />)
    expect(screen.getByRole('heading', { name: 'Legacy Codex' })).toBeInTheDocument()
  })

  it('renders all 7 tab buttons', () => {
    render(<Home />)
    expect(screen.getAllByRole('tab')).toHaveLength(7)
    ;['Overview', 'Protocols', 'Sprint Linker', 'Resumption Log', 'Biometrics', 'Constraint Validator', 'Codex'].forEach(label => {
      expect(screen.getByRole('tab', { name: label })).toBeInTheDocument()
    })
  })

  it('Overview tab is selected by default', () => {
    render(<Home />)
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true')
  })

  it('all other tabs are not selected by default', () => {
    render(<Home />)
    screen.getAllByRole('tab')
      .filter(tab => tab.textContent !== 'Overview')
      .forEach(tab => expect(tab).toHaveAttribute('aria-selected', 'false'))
  })

  it('clicking a tab selects it and deselects Overview', () => {
    render(<Home />)
    const protocols = screen.getByRole('tab', { name: 'Protocols' })
    fireEvent.click(protocols)
    expect(protocols).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'false')
  })

  it('each tab button has the correct id and aria-controls', () => {
    render(<Home />)
    const overviewTab = screen.getByRole('tab', { name: 'Overview' })
    expect(overviewTab).toHaveAttribute('id', 'tab-overview')
    expect(overviewTab).toHaveAttribute('aria-controls', 'tabpanel-content')
  })

  it('tab panel has role=tabpanel', () => {
    render(<Home />)
    expect(screen.getByRole('tabpanel')).toBeInTheDocument()
  })

  it('tab panel is labelled by the active tab id', () => {
    render(<Home />)
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', 'tab-overview')
  })

  it('tab panel aria-labelledby updates when a tab is clicked', () => {
    render(<Home />)
    fireEvent.click(screen.getByRole('tab', { name: 'Codex' }))
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', 'tab-codex')
  })

  it('shows Overview content by default', () => {
    render(<Home />)
    expect(screen.getByText('OverviewTab')).toBeInTheDocument()
  })

  it('shows Protocols content and hides Overview when Protocols tab is clicked', () => {
    render(<Home />)
    fireEvent.click(screen.getByRole('tab', { name: 'Protocols' }))
    expect(screen.getByText('ProtocolsTab')).toBeInTheDocument()
    expect(screen.queryByText('OverviewTab')).not.toBeInTheDocument()
  })
})

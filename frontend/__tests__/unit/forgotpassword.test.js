import { render, screen } from '@testing-library/react'
import ForgotPassword from '@app/login/forgotpassword/page'
import '@testing-library/jest-dom'

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    route: '/',
    pathname: '/',
    query: '',
    asPath: ''
  }),
}));

describe('Forgot Password Component', () => {
  it('renders the heading', () => {
    render(<ForgotPassword />)
    expect(screen.getByRole('heading', { name: /^Forgotten you password?/i })).toBeInTheDocument()
  })

  it('renders email form fields', () => {
    render(<ForgotPassword />)

    expect(screen.getByLabelText(/^Please enter your e-mail address:/i)).toBeInTheDocument()
  })

  it('renders the back and Send buttons', () => {
    render(<ForgotPassword />)

    expect(screen.getByRole('button', { name: /^Back/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Send Email/i })).toBeInTheDocument()
  })
})

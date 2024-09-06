import { render, screen } from '@testing-library/react'
import Login from '@app/login/page'
import '@testing-library/jest-dom'

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    route: '/',
    pathname: '/',
    query: '',
    asPath: ''
  }),
}));

describe('Login Component', () => {
  it('renders the heading', () => {
    render(<Login />)
    expect(screen.getByRole('heading', { name: /^Login/i })).toBeInTheDocument()
  })

  it('renders Register form fields', () => {
    render(<Login />)

    expect(screen.getByLabelText(/^Email-Address:/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Password:/i)).toBeInTheDocument()
  })

  it('renders the back and login buttons', () => {
    render(<Login />)
    expect(screen.getByRole('button', { name: /^Back/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Login/i })).toBeInTheDocument()
  })

  it('renders the forgot password link', () => {
    render(<Login />)
    expect(screen.getByRole('link', { name: /^Forgot Password?/i })).toBeInTheDocument()
  })
})

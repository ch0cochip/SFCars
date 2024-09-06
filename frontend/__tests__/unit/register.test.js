import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Register from '@app/register/page'
import '@testing-library/jest-dom'

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    route: '/',
    pathname: '/',
    query: '',
    asPath: ''
  }),
}));

const renderFurtherRegistration = async () => {
  render(<Register />)

  await userEvent.type(screen.getByLabelText(/^Email-Address:/i), 'test@example.com');
  await userEvent.type(screen.getByLabelText(/^Confirm your Email-Address:/i), 'test@example.com');
  await userEvent.type(screen.getByLabelText(/^Password:/i), 'Test@12345');

  fireEvent.click(screen.getByRole('button', { name: /Next/i }));
}

describe('Register Component', () => {
    it('renders the heading', () => {
    render(<Register />)
    expect(screen.getByRole('heading', { name: /^Register/i })).toBeInTheDocument()
  })

  it('renders Register form fields', () => {
    render(<Register />)

    expect(screen.getByLabelText(/^Email-Address:/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Confirm your Email-Address:/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Password:/i)).toBeInTheDocument()
  })

  it('renders the back and next buttons', () => {
    render(<Register />)
    expect(screen.getByRole('button', { name: /Back/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument()
  })

  it('renders the further registration heading', async () => {
    await renderFurtherRegistration()

    expect(screen.getByRole('heading', { name: /^Further Registration/i })).toBeInTheDocument()
  })

  it('renders further registration form fields', async () => {
    await renderFurtherRegistration()

    expect(screen.getByLabelText(/^First-Name:/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Last-Name:/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Phone Number:/i)).toBeInTheDocument()
  })

  it('renders the back and register button', async () => {
    await renderFurtherRegistration()

    expect(screen.getByRole('button', { name: /Back/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument()
  })
})

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

describe('FixIt app', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the main landing page', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/Report problems/i)).toBeInTheDocument();
  });

  it('renders the login form', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('renders the complaint form for an authenticated user', () => {
    localStorage.setItem('fixit-token', 'demo-token');
    localStorage.setItem('fixit-user', JSON.stringify({ role: 'USER', name: 'Test User' }));

    render(
      <MemoryRouter initialEntries={['/complaints/new']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /create complaint/i })).toBeInTheDocument();
  });
});

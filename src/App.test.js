import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the undercover game landing page', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Find the Undercover' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Start Game' })).toBeInTheDocument();
});

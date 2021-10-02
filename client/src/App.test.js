import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const labelElement = screen.getByText(/Vehicle app running./i);
  expect(labelElement).toBeInTheDocument();
});

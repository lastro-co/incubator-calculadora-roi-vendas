import { HttpResponse, http } from 'msw';
import { render, screen } from '@/tests/app-test-utils';
import { userFactory } from '@/tests/factories/userFactory';
import { server } from '@/tests/server';
import Header from './Header';

describe('Header component', () => {
  it('should render the header text', () => {
    render(<Header />);
    expect(screen.getByRole('banner')).toHaveTextContent('Header');
  });

  it('can use userFactory for mocks', () => {
    const user = userFactory.build();
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('email');
  });
});

describe('Header API integration', () => {
  it('should mock an API call', async () => {
    server.use(
      http.get('/api/hello', () => {
        return HttpResponse.json({ message: 'Hello from MSW!' });
      })
    );

    const response = await fetch('/api/hello');
    const data = await response.json();
    expect(data).toEqual({ message: 'Hello from MSW!' });
  });
});

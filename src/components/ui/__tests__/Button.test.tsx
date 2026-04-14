import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import { Button } from '../Button';
import { renderWithProviders } from '../../../test/helpers/render';

describe('Button', () => {
  it('renders variants and handles click', async () => {
    const onClick = vi.fn();
    const { user } = renderWithProviders(
      <Button variant="primary" onClick={onClick}>
        저장하기
      </Button>,
    );

    const button = screen.getByRole('button', { name: '저장하기' });

    expect(button.getAttribute('data-variant')).toBe('primary');
    expect(button.className.includes('slcn-button')).toBe(true);

    await user.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('respects disabled and aria-busy state', () => {
    renderWithProviders(
      <Button variant="danger" disabled loading>
        삭제
      </Button>,
    );

    const button = screen.getByRole('button', {
      name: '삭제',
    }) as HTMLButtonElement;

    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
  });
});

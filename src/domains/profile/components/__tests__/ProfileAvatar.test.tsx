import { render, screen } from '@testing-library/react';
import { ProfileAvatar } from '../ProfileAvatar';

describe('ProfileAvatar', () => {
  it('shows the supplied profile image with meaningful alternative text', () => {
    render(
      <ProfileAvatar
        imageUrl='https://images.example.com/profile.png'
        alt='서울촌놈 프로필'
      />
    );

    const image = screen.getByRole('img', { name: '서울촌놈 프로필' });

    expect(image.getAttribute('src')).toBe(
      'https://images.example.com/profile.png'
    );
    expect(image.getAttribute('width')).toBe('42');
    expect(image.getAttribute('height')).toBe('42');
  });

  it('uses the neutral avatar fallback when an image is unavailable', () => {
    const { container } = render(<ProfileAvatar />);

    expect(screen.queryByRole('img')).toBe(null);
    const fallback = container.querySelector('.slcn-profile-avatar__fallback');

    expect(fallback).toBeTruthy();
    expect(fallback?.getAttribute('viewBox')).toBe('0 1 24 24');
  });
});

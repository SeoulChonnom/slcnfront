import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../test/helpers/render';
import { TextField } from '../TextField';

describe('TextField', () => {
  it('connects the label to the input and exposes required state', () => {
    renderWithProviders(
      <TextField
        label='아이디'
        name='userName'
        required
        hint='아이디를 입력하세요.'
      />
    );

    const input = screen.getByLabelText(/아이디/) as HTMLInputElement;

    expect(input.required).toBe(true);
    expect(input.getAttribute('aria-describedby')).toContain('-hint');
    expect(screen.getByText('아이디를 입력하세요.')).toBeTruthy();
  });

  it('renders an error message and marks the field invalid', () => {
    renderWithProviders(
      <TextField label='비밀번호' error='비밀번호를 입력해주세요.' />
    );

    const input = screen.getByLabelText('비밀번호') as HTMLInputElement;

    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByText('비밀번호를 입력해주세요.')).toBeTruthy();
  });
});

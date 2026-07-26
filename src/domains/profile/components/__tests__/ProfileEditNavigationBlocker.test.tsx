import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, Link, RouterProvider } from 'react-router-dom';
import { ProfileEditNavigationBlocker } from '../ProfileEditNavigationBlocker';

function DirtyEditor() {
  return (
    <>
      <ProfileEditNavigationBlocker when />
      <p>사용자 정보 수정</p>
      <Link to='/previous'>이전 화면으로 이동</Link>
    </>
  );
}

function createBlockerRouter() {
  return createMemoryRouter(
    [
      {
        path: '/edit',
        element: <DirtyEditor />,
      },
      {
        path: '/previous',
        element: <p>이전 화면</p>,
      },
    ],
    {
      initialEntries: ['/previous', '/edit'],
      initialIndex: 1,
    }
  );
}

describe('ProfileEditNavigationBlocker', () => {
  it('blocks browser back history when discarding the draft is declined', async () => {
    const confirmBack = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const router = createBlockerRouter();
    render(<RouterProvider router={router} />);

    await act(async () => {
      await router.navigate(-1);
    });

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/edit');
    });
    expect(confirmBack).toHaveBeenCalledWith(
      '저장하지 않은 변경 사항이 있어요. 돌아갈까요?'
    );
    expect(screen.getByText('사용자 정보 수정')).toBeTruthy();
    confirmBack.mockRestore();
  });

  it('allows browser back history after discarding the draft is confirmed', async () => {
    const confirmBack = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const router = createBlockerRouter();
    render(<RouterProvider router={router} />);

    await act(async () => {
      await router.navigate(-1);
    });

    expect(await screen.findByText('이전 화면')).toBeTruthy();
    expect(router.state.location.pathname).toBe('/previous');
    confirmBack.mockRestore();
  });

  it('applies the same confirmation to the visible back link', async () => {
    const confirmBack = vi
      .spyOn(window, 'confirm')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    const router = createBlockerRouter();
    const user = userEvent.setup();
    render(<RouterProvider router={router} />);

    await user.click(screen.getByRole('link', { name: '이전 화면으로 이동' }));
    expect(router.state.location.pathname).toBe('/edit');

    await user.click(screen.getByRole('link', { name: '이전 화면으로 이동' }));
    expect(await screen.findByText('이전 화면')).toBeTruthy();
    expect(confirmBack).toHaveBeenCalledTimes(2);
    confirmBack.mockRestore();
  });
});

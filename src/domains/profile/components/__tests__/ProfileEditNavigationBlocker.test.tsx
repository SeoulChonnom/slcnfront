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
  it('focuses the safe "stay" option, and does not navigate away until the leave action is confirmed', async () => {
    const user = userEvent.setup();
    const router = createBlockerRouter();
    render(<RouterProvider router={router} />);

    await act(async () => {
      await router.navigate(-1);
    });

    await screen.findByRole('dialog', {
      name: '저장하지 않은 변경 사항이 있어요',
    });
    const stayButton = screen.getByRole('button', { name: '계속 수정' });

    await waitFor(() => {
      expect(document.activeElement).toBe(stayButton);
    });

    await user.click(stayButton);

    expect(router.state.location.pathname).toBe('/edit');
    expect(
      screen.queryByRole('dialog', { name: '저장하지 않은 변경 사항이 있어요' })
    ).toBeNull();
    expect(screen.getByText('사용자 정보 수정')).toBeTruthy();
  });

  it('navigates away once the leave action is confirmed', async () => {
    const user = userEvent.setup();
    const router = createBlockerRouter();
    render(<RouterProvider router={router} />);

    await act(async () => {
      await router.navigate(-1);
    });

    await screen.findByRole('dialog', {
      name: '저장하지 않은 변경 사항이 있어요',
    });

    await user.click(screen.getByRole('button', { name: '나가기' }));

    expect(await screen.findByText('이전 화면')).toBeTruthy();
    expect(router.state.location.pathname).toBe('/previous');
  });

  it('cancels navigation on Escape', async () => {
    const user = userEvent.setup();
    const router = createBlockerRouter();
    render(<RouterProvider router={router} />);

    await act(async () => {
      await router.navigate(-1);
    });

    await screen.findByRole('dialog', {
      name: '저장하지 않은 변경 사항이 있어요',
    });

    await user.keyboard('{Escape}');

    expect(router.state.location.pathname).toBe('/edit');
    expect(
      screen.queryByRole('dialog', { name: '저장하지 않은 변경 사항이 있어요' })
    ).toBeNull();
  });

  it('applies the same confirmation to the visible back link', async () => {
    const router = createBlockerRouter();
    const user = userEvent.setup();
    render(<RouterProvider router={router} />);

    await user.click(screen.getByRole('link', { name: '이전 화면으로 이동' }));
    await screen.findByRole('dialog', {
      name: '저장하지 않은 변경 사항이 있어요',
    });
    await user.click(screen.getByRole('button', { name: '계속 수정' }));
    expect(router.state.location.pathname).toBe('/edit');

    await user.click(screen.getByRole('link', { name: '이전 화면으로 이동' }));
    await screen.findByRole('dialog', {
      name: '저장하지 않은 변경 사항이 있어요',
    });
    await user.click(screen.getByRole('button', { name: '나가기' }));
    expect(await screen.findByText('이전 화면')).toBeTruthy();
  });
});

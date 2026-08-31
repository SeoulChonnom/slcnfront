import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { tripApi } from '@/domains/trip/api/trip-api';
import { tripFilesApi } from '@/domains/trip/api/trip-files-api';
import { TripRegisterWizard } from '@/domains/trip/components/TripRegisterWizard';
import type { FileAsset } from '@/domains/trip/types';
import { renderWithProviders } from '@/test/helpers/render';

function fileAsset(overrides: Partial<FileAsset> = {}): FileAsset {
  return {
    fileId: 'file-1',
    type: 'map',
    originalFilename: 'map.png',
    filename: 'map.png',
    path: '/files/map.png',
    mimeType: 'image/png',
    size: 1024,
    ...overrides,
  };
}

const logoAsset = fileAsset({
  fileId: 'logo-1',
  type: 'logo',
  filename: 'logo.png',
  originalFilename: 'logo.png',
});
const firstMapAsset = fileAsset({ fileId: 'map-1', filename: 'map1.png' });
const secondMapAsset = fileAsset({ fileId: 'map-2', filename: 'map2.png' });

vi.mock('@/domains/trip/api/trip-files-api', () => ({
  tripFilesApi: {
    uploadTripFile: vi.fn(),
  },
}));

vi.mock('@/domains/trip/api/trip-api', () => ({
  tripApi: {
    registerTrip: vi.fn(),
  },
}));

const uploadTripFileMock = vi.mocked(tripFilesApi.uploadTripFile);
const registerTripMock = vi.mocked(tripApi.registerTrip);

async function completeTripRegistrationForm(
  user: ReturnType<typeof renderWithProviders>['user'],
  container: HTMLElement,
  options: {
    includeSecondMap?: boolean;
    type?: '아영' | '일권';
    selectAnswer?: boolean;
  } = {}
) {
  await user.click(screen.getByRole('radio', { name: options.type ?? '아영' }));
  await user.type(screen.getByLabelText(/^날짜/), '2099-12-31');
  await user.type(screen.getByLabelText(/^나들이 이름/), '연말 나들이');

  const step1Inputs = container.querySelectorAll<HTMLInputElement>(
    '.slcn-file-dropzone__input'
  );
  const logoInput = step1Inputs[0];

  if (!logoInput) {
    throw new Error('logo input not found');
  }

  await user.upload(
    logoInput,
    new File(['logo'], 'logo.png', { type: 'image/png' })
  );
  await user.click(screen.getByRole('button', { name: '다음' }));

  const step2Inputs = container.querySelectorAll<HTMLInputElement>(
    '.slcn-file-dropzone__input'
  );
  const map1Input = step2Inputs[0];

  if (!map1Input) {
    throw new Error('map1 input not found');
  }

  await user.upload(
    map1Input,
    new File(['map1'], 'map1.png', { type: 'image/png' })
  );

  if (options.includeSecondMap) {
    await user.click(screen.getByRole('button', { name: '2번 지도 추가하기' }));

    const step2InputsWithSecondMap =
      container.querySelectorAll<HTMLInputElement>(
        '.slcn-file-dropzone__input'
      );
    const map2Input = step2InputsWithSecondMap[1];

    if (!map2Input) {
      throw new Error('map2 input not found');
    }

    await user.upload(
      map2Input,
      new File(['map2'], 'map2.png', { type: 'image/png' })
    );
    await user.type(screen.getByLabelText(/^버튼 1/), '다음');
    await user.type(screen.getByLabelText(/^버튼 2/), '이전');
  }

  await user.type(
    screen.getByLabelText(/^드라이브 링크/),
    'https://drive.google.com/x'
  );
  await user.click(screen.getByRole('button', { name: '다음' }));

  await user.type(screen.getByLabelText(/^퀴즈 제목/), '정답은?');
  await user.type(screen.getByRole('textbox', { name: /^보기1/ }), '보기1');
  await user.type(screen.getByRole('textbox', { name: /^보기2/ }), '보기2');
  await user.type(screen.getByRole('textbox', { name: /^보기3/ }), '보기3');
  if (options.selectAnswer !== false) {
    await user.click(screen.getByRole('radio', { name: '2번' }));
  }
  await user.type(screen.getByLabelText(/^정답 제목/), '정답');
  await user.type(screen.getByLabelText(/^정답 텍스트/), '맞았습니다.');
  await user.type(screen.getByLabelText(/^오답 제목/), '오답');
  await user.type(screen.getByLabelText(/^오답 텍스트/), '다시 시도하세요.');
}

describe('TripRegisterWizard', () => {
  beforeEach(() => {
    uploadTripFileMock.mockReset();
    registerTripMock.mockReset();
    sessionStorage.clear();
  });

  it('clears a field error as soon as that field is corrected', async () => {
    const { user } = renderWithProviders(
      <TripRegisterWizard device='main' onSubmit={vi.fn()} />,
      { route: '/main/map/register' }
    );

    await user.click(screen.getByRole('button', { name: '다음' }));

    expect(screen.getByText('유형을 선택해 주세요.')).toBeTruthy();
    expect(screen.getByText('나들이 이름을 입력해 주세요.')).toBeTruthy();

    await user.click(screen.getByRole('radio', { name: '아영' }));

    expect(screen.queryByText('유형을 선택해 주세요.')).toBeNull();
    expect(screen.getByText('나들이 이름을 입력해 주세요.')).toBeTruthy();

    await user.type(screen.getByLabelText(/^나들이 이름/), '연말 나들이');

    expect(screen.queryByText('나들이 이름을 입력해 주세요.')).toBeNull();
  });

  it('confirms before leaving once the form has unsaved input', async () => {
    const { user } = renderWithProviders(
      <TripRegisterWizard device='main' onSubmit={vi.fn()} />,
      { route: '/main/map/register' }
    );

    await user.type(screen.getByLabelText(/^나들이 이름/), '연말 나들이');
    await user.click(screen.getByRole('button', { name: '취소' }));

    expect(screen.getByText('작성을 그만둘까요?')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: '계속 쓸게요' }));

    expect(screen.queryByText('작성을 그만둘까요?')).toBeNull();
    expect(
      (screen.getByLabelText(/^나들이 이름/) as HTMLInputElement).value
    ).toBe('연말 나들이');
  });

  it('restores an abandoned draft and names the files that cannot come back', async () => {
    const first = renderWithProviders(
      <TripRegisterWizard device='main' onSubmit={vi.fn()} />,
      { route: '/main/map/register' }
    );

    await first.user.type(screen.getByLabelText(/^나들이 이름/), '연말 나들이');

    const logoInput = first.container.querySelector<HTMLInputElement>(
      '.slcn-file-dropzone__input'
    );

    if (!logoInput) {
      throw new Error('logo input not found');
    }

    await first.user.upload(
      logoInput,
      new File(['logo'], 'logo.png', { type: 'image/png' })
    );
    first.unmount();

    renderWithProviders(
      <TripRegisterWizard device='main' onSubmit={vi.fn()} />,
      {
        route: '/main/map/register',
      }
    );

    expect(
      (screen.getByLabelText(/^나들이 이름/) as HTMLInputElement).value
    ).toBe('연말 나들이');
    expect(
      screen.getByText(/로고 이미지 파일은 다시 선택해 주세요/)
    ).toBeTruthy();
  });

  it('renders exactly three required quiz options with matching answer choices', async () => {
    const { user, container } = renderWithProviders(
      <TripRegisterWizard device='main' onSubmit={vi.fn()} />,
      {
        route: '/main/map/register',
      }
    );

    await completeTripRegistrationForm(user, container);

    expect(
      screen.getAllByRole('textbox', { name: /^보기[1-3]$/ })
    ).toHaveLength(3);
    expect(screen.queryByRole('textbox', { name: '보기4' })).toBeNull();
    expect(screen.getByRole('radio', { name: '1번' })).toBeTruthy();
    expect(screen.getByRole('radio', { name: '2번' })).toBeTruthy();
    expect(screen.getByRole('radio', { name: '3번' })).toBeTruthy();
    expect(screen.queryByRole('radio', { name: '4번' })).toBeNull();

    for (const optionNumber of [1, 2, 3]) {
      const option = screen.getByRole('textbox', {
        name: new RegExp(`^보기${optionNumber}`),
      });

      expect(option.hasAttribute('required')).toBe(true);
      expect(option.getAttribute('name')).toBe(`quiz-option-${optionNumber}`);
      expect(option.getAttribute('autocomplete')).toBe('off');
      expect(option.getAttribute('aria-describedby')).toContain(
        'quiz-options-hint'
      );
    }

    expect(screen.getByRole('radiogroup', { name: '정답 선택' })).toBeTruthy();
  });

  it('requires each added option before allowing another and stops at six options', async () => {
    const { user, container } = renderWithProviders(
      <TripRegisterWizard device='main' onSubmit={vi.fn()} />,
      {
        route: '/main/map/register',
      }
    );

    await completeTripRegistrationForm(user, container);
    const addOptionButton = screen.getByRole('button', { name: '보기 추가' });

    await user.click(addOptionButton);
    expect(screen.getByRole('textbox', { name: /^보기4/ })).toBeTruthy();
    expect(screen.getByRole('radio', { name: '4번' })).toBeTruthy();
    expect(addOptionButton.hasAttribute('disabled')).toBe(true);

    await user.type(screen.getByRole('textbox', { name: /^보기4/ }), '보기4');
    await user.click(addOptionButton);
    await user.type(screen.getByRole('textbox', { name: /^보기5/ }), '보기5');
    await user.click(addOptionButton);
    await user.type(screen.getByRole('textbox', { name: /^보기6/ }), '보기6');

    expect(
      screen.getAllByRole('textbox', { name: /^보기[1-6]$/ })
    ).toHaveLength(6);
    expect(screen.getByRole('radio', { name: '6번' })).toBeTruthy();
    expect(addOptionButton.hasAttribute('disabled')).toBe(true);
  });

  it('blocks submission and shows validation when an added option is blank', async () => {
    const onSubmit = vi.fn();
    const { user, container } = renderWithProviders(
      <TripRegisterWizard device='main' onSubmit={onSubmit} />,
      {
        route: '/main/map/register',
      }
    );

    await completeTripRegistrationForm(user, container);
    await user.click(screen.getByRole('button', { name: '보기 추가' }));
    await user.click(screen.getByRole('button', { name: '저장' }));

    expect(onSubmit).not.toHaveBeenCalled();
    const optionsError = screen.getByRole('alert');
    const addedOption = screen.getByRole('textbox', { name: /^보기4/ });

    expect(optionsError.textContent).toBe('모든 보기를 입력해 주세요.');
    expect(optionsError.getAttribute('id')).toBe('quiz-options-error');
    expect(optionsError.getAttribute('aria-live')).toBe('assertive');
    expect(
      screen
        .getByRole('radiogroup', { name: '정답 선택' })
        .getAttribute('aria-describedby')
    ).toContain('quiz-options-error');
    for (const optionNumber of [1, 2, 3, 4]) {
      expect(
        screen
          .getByRole('textbox', {
            name: new RegExp(`^보기${optionNumber}`),
          })
          .getAttribute('aria-describedby')
      ).toContain('quiz-options-error');
    }
    expect(document.activeElement).toBe(addedOption);
  });

  it('keeps typing in the focused invalid option after validation', async () => {
    const { user, container } = renderWithProviders(
      <TripRegisterWizard device='main' onSubmit={vi.fn()} />,
      {
        route: '/main/map/register',
      }
    );

    await completeTripRegistrationForm(user, container);
    await user.click(screen.getByRole('button', { name: '보기 추가' }));
    const option4 = screen.getByRole('textbox', { name: /^보기4/ });
    await user.type(option4, '임시');
    await user.click(screen.getByRole('button', { name: '보기 추가' }));
    await user.clear(option4);
    await user.click(screen.getByRole('button', { name: '저장' }));

    expect(document.activeElement).toBe(option4);
    await user.type(option4, '새로운답변');

    expect((option4 as HTMLInputElement).value).toBe('새로운답변');
    expect(
      (screen.getByRole('textbox', { name: /^보기5/ }) as HTMLInputElement)
        .value
    ).toBe('');
    expect(document.activeElement).toBe(option4);
  });

  it('announces missing answer selection and focuses the answer group', async () => {
    const { user, container } = renderWithProviders(
      <TripRegisterWizard device='main' onSubmit={vi.fn()} />,
      {
        route: '/main/map/register',
      }
    );

    await completeTripRegistrationForm(user, container, {
      selectAnswer: false,
    });
    await user.click(screen.getByRole('button', { name: '저장' }));

    const answerError = screen.getByRole('alert');
    const answerGroup = screen.getByRole('radiogroup', {
      name: '정답 선택',
    });

    expect(answerError.textContent).toBe('정답 번호를 선택해 주세요.');
    expect(answerError.getAttribute('id')).toBe('quiz-answer-error');
    expect(answerError.getAttribute('aria-live')).toBe('assertive');
    expect(answerGroup.getAttribute('aria-describedby')).toContain(
      'quiz-answer-error'
    );
    expect(document.activeElement).toBe(
      screen.getByRole('radio', { name: '1번' })
    );
  });

  it('only deletes added options and adjusts the selected answer after deletion', async () => {
    const { user, container } = renderWithProviders(
      <TripRegisterWizard device='main' onSubmit={vi.fn()} />,
      {
        route: '/main/map/register',
      }
    );

    await completeTripRegistrationForm(user, container);
    await user.click(screen.getByRole('button', { name: '보기 추가' }));
    await user.type(screen.getByRole('textbox', { name: /^보기4/ }), '보기4');
    await user.click(screen.getByRole('button', { name: '보기 추가' }));
    await user.type(screen.getByRole('textbox', { name: /^보기5/ }), '보기5');
    await user.click(screen.getByRole('radio', { name: '5번' }));

    expect(screen.queryByRole('button', { name: '보기1 삭제' })).toBeNull();
    expect(screen.getByRole('button', { name: '보기4 삭제' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '보기5 삭제' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: '보기4 삭제' }));

    expect(screen.queryByRole('textbox', { name: /^보기5/ })).toBeNull();
    expect(screen.queryByRole('radio', { name: '5번' })).toBeNull();
    expect(
      (screen.getByRole('radio', { name: '4번' }) as HTMLInputElement).checked
    ).toBe(true);
  });

  it('clears a selected answer when its added option is deleted before submit', async () => {
    const onSubmit = vi.fn();
    const { user, container } = renderWithProviders(
      <TripRegisterWizard device='main' onSubmit={onSubmit} />,
      {
        route: '/main/map/register',
      }
    );

    await completeTripRegistrationForm(user, container);
    await user.click(screen.getByRole('button', { name: '보기 추가' }));
    await user.type(screen.getByRole('textbox', { name: /^보기4/ }), '보기4');
    await user.click(screen.getByRole('radio', { name: '4번' }));
    await user.click(screen.getByRole('button', { name: '보기4 삭제' }));

    expect(
      [1, 2, 3].some(
        (number) =>
          (
            screen.getByRole('radio', {
              name: `${number}번`,
            }) as HTMLInputElement
          ).checked
      )
    ).toBe(false);

    await user.click(screen.getByRole('radio', { name: '2번' }));
    await user.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      quizOptions: ['보기1', '보기2', '보기3'],
      quizAnswer: '2',
    });
  });

  it('adjusts the selected answer when deleting an option from the six-option boundary', async () => {
    const { user, container } = renderWithProviders(
      <TripRegisterWizard device='main' onSubmit={vi.fn()} />,
      {
        route: '/main/map/register',
      }
    );

    await completeTripRegistrationForm(user, container);
    for (const optionNumber of [4, 5, 6]) {
      await user.click(screen.getByRole('button', { name: '보기 추가' }));
      await user.type(
        screen.getByRole('textbox', {
          name: new RegExp(`^보기${optionNumber}`),
        }),
        `보기${optionNumber}`
      );
    }
    await user.click(screen.getByRole('radio', { name: '6번' }));
    await user.click(screen.getByRole('button', { name: '보기5 삭제' }));

    expect(screen.queryByRole('textbox', { name: /^보기6/ })).toBeNull();
    expect(
      (screen.getByRole('radio', { name: '5번' }) as HTMLInputElement).checked
    ).toBe(true);
  });

  it('blocks step navigation until required fields are filled and submits on the last step', async () => {
    const onSubmit = vi.fn();
    const { user, container } = renderWithProviders(
      <TripRegisterWizard device='main' onSubmit={onSubmit} />,
      {
        route: '/main/map/register',
      }
    );

    await user.click(screen.getByRole('button', { name: '다음' }));
    expect(screen.getByText('유형을 선택해 주세요.')).toBeTruthy();

    await completeTripRegistrationForm(user, container);

    expect(
      screen.getByText('지도 정보').closest('li')?.getAttribute('data-active')
    ).toBe('false');
    expect(
      screen.getByText('퀴즈 정보').closest('li')?.getAttribute('data-active')
    ).toBe('true');
    await user.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      type: 'AYO',
      info2: '연말 나들이',
      quizTitle: '정답은?',
      quizAnswer: '2',
    });
  });

  it('submits RYU when the 일권 option is selected', async () => {
    const onSubmit = vi.fn();
    const { user, container } = renderWithProviders(
      <TripRegisterWizard device='main' onSubmit={onSubmit} />,
      {
        route: '/main/map/register',
      }
    );

    await completeTripRegistrationForm(user, container, { type: '일권' });
    await user.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ type: 'RYU' });
  });

  it('uploads assets before posting the trip json payload', async () => {
    uploadTripFileMock
      .mockResolvedValueOnce(logoAsset)
      .mockResolvedValueOnce(firstMapAsset)
      .mockResolvedValueOnce(secondMapAsset);
    registerTripMock.mockResolvedValue({
      id: 'trip-1',
      date: '2099-12-31',
      type: 'AYO',
      name: '연말 나들이',
      logo: logoAsset,
      firstMap: firstMapAsset,
      secondMap: secondMapAsset,
      nextButtonText: '다음',
      previousButtonText: '이전',
      driveUrl: 'https://drive.google.com/x',
    });

    const { user, container } = renderWithProviders(
      <TripRegisterWizard device='main' />,
      {
        route: '/main/map/register',
      }
    );

    await completeTripRegistrationForm(user, container, {
      includeSecondMap: true,
    });
    await user.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(uploadTripFileMock).toHaveBeenCalledTimes(3);
      expect(registerTripMock).toHaveBeenCalledTimes(1);
    });

    expect(uploadTripFileMock.mock.calls).toEqual([
      ['logo', expect.objectContaining({ name: 'logo.png' })],
      ['map1', expect.objectContaining({ name: 'map1.png' })],
      ['map2', expect.objectContaining({ name: 'map2.png' })],
    ]);
    expect(registerTripMock).toHaveBeenCalledWith({
      date: '2099-12-31',
      type: 'AYO',
      name: '연말 나들이',
      files: [
        { fileAssetId: 'logo-1', targetType: 'TRIP', role: 'LOGO' },
        { fileAssetId: 'map-1', targetType: 'TRIP', role: 'FIRST_MAP' },
        { fileAssetId: 'map-2', targetType: 'TRIP', role: 'SECOND_MAP' },
      ],
      nextButtonText: '다음',
      previousButtonText: '이전',
      driveUrl: 'https://drive.google.com/x',
      quiz: {
        title: '정답은?',
        answerTitle: '정답',
        answerText: '맞았습니다.',
        errorTitle: '오답',
        errorText: '다시 시도하세요.',
        options: [
          { text: '보기1', isCorrect: false },
          { text: '보기2', isCorrect: true },
          { text: '보기3', isCorrect: false },
        ],
      },
    });
  });

  it('stops before /trip when a file upload fails', async () => {
    uploadTripFileMock.mockRejectedValueOnce(new Error('logo upload failed'));

    const { user, container } = renderWithProviders(
      <TripRegisterWizard device='main' />,
      {
        route: '/main/map/register',
      }
    );

    await completeTripRegistrationForm(user, container);
    await user.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(registerTripMock).not.toHaveBeenCalled();
    });

    expect(uploadTripFileMock).toHaveBeenCalledTimes(1);
    expect((await screen.findByRole('alert')).textContent).toBe(
      '저장하지 못했어요. 잠시 뒤 다시 시도해 주세요.'
    );
  });

  it('surfaces /trip failures after uploads without fallback or cleanup', async () => {
    uploadTripFileMock
      .mockResolvedValueOnce(logoAsset)
      .mockResolvedValueOnce(firstMapAsset);
    registerTripMock.mockRejectedValueOnce(new Error('trip create failed'));

    const { user, container } = renderWithProviders(
      <TripRegisterWizard device='main' />,
      {
        route: '/main/map/register',
      }
    );

    await completeTripRegistrationForm(user, container);
    await user.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(uploadTripFileMock).toHaveBeenCalledTimes(2);
      expect(registerTripMock).toHaveBeenCalledTimes(1);
    });

    expect((await screen.findByRole('alert')).textContent).toBe(
      '저장하지 못했어요. 잠시 뒤 다시 시도해 주세요.'
    );
  });
});

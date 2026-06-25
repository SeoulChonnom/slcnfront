import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../../test/helpers/render';
import { tripApi } from '../../api/trip-api';
import { tripFilesApi } from '../../api/trip-files-api';
import type { FileAsset } from '../../types';
import { TripRegisterWizard } from '../TripRegisterWizard';

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

vi.mock('../../api/trip-files-api', () => ({
  tripFilesApi: {
    uploadTripFile: vi.fn(),
  },
}));

vi.mock('../../api/trip-api', () => ({
  tripApi: {
    registerTrip: vi.fn(),
  },
}));

const uploadTripFileMock = vi.mocked(tripFilesApi.uploadTripFile);
const registerTripMock = vi.mocked(tripApi.registerTrip);

async function completeTripRegistrationForm(
  user: ReturnType<typeof renderWithProviders>['user'],
  container: HTMLElement,
  options: { includeSecondMap?: boolean } = {}
) {
  await user.click(screen.getByRole('radio', { name: '아영' }));
  await user.type(screen.getByLabelText('날짜'), '2099-12-31');
  await user.type(screen.getByLabelText('나들이 이름'), '연말 나들이');

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
    await user.type(screen.getByLabelText('버튼 1'), '다음');
    await user.type(screen.getByLabelText('버튼 2'), '이전');
  }

  await user.type(
    screen.getByLabelText('드라이브 링크'),
    'https://drive.google.com/x'
  );
  await user.click(screen.getByRole('button', { name: '다음' }));

  await user.type(screen.getByLabelText('퀴즈 제목'), '정답은?');
  await user.type(screen.getByLabelText('정답1'), '보기1');
  await user.type(screen.getByLabelText('정답2'), '보기2');
  await user.click(screen.getByRole('radio', { name: '2번' }));
  await user.type(screen.getByLabelText('정답 제목'), '정답');
  await user.type(screen.getByLabelText('정답 텍스트'), '맞았습니다.');
  await user.type(screen.getByLabelText('오답 제목'), '오답');
  await user.type(screen.getByLabelText('오답 텍스트'), '다시 시도하세요.');
}

describe('TripRegisterWizard', () => {
  beforeEach(() => {
    uploadTripFileMock.mockReset();
    registerTripMock.mockReset();
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
    expect(screen.getByText('유형을 선택해주세요.')).toBeTruthy();

    await completeTripRegistrationForm(user, container);

    expect(screen.getByText('지도 정보').getAttribute('data-active')).toBe(
      'false'
    );
    expect(screen.getByText('퀴즈 정보').getAttribute('data-active')).toBe(
      'true'
    );
    await user.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      info2: '연말 나들이',
      quizTitle: '정답은?',
      quizAnswer: '2',
    });
  });

  it('uploads assets before posting the trip json payload', async () => {
    uploadTripFileMock
      .mockResolvedValueOnce(logoAsset)
      .mockResolvedValueOnce(firstMapAsset)
      .mockResolvedValueOnce(secondMapAsset);
    registerTripMock.mockResolvedValue({
      date: '2099-12-31',
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
      type: 'A',
      name: '연말 나들이',
      logoFileId: 'logo-1',
      firstMapFileId: 'map-1',
      secondMapFileId: 'map-2',
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
    expect((await screen.findByRole('alert')).textContent).toContain(
      'logo upload failed'
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

    expect((await screen.findByRole('alert')).textContent).toContain(
      'trip create failed'
    );
  });
});

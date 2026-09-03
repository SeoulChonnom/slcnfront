import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TravelRegisterSection } from '@/domains/travel/components/TravelRegisterSection';
import type { FileAsset, TravelDetail } from '@/domains/travel/types';
import { renderWithMinimalProviders } from '@/test/helpers/render';

// ── Travel API mock ───────────────────────────────────────────────────────────

const { getTravelDetail, createTravel, updateTravel } = vi.hoisted(() => ({
  getTravelDetail: vi.fn<() => Promise<TravelDetail>>(),
  createTravel: vi.fn(),
  updateTravel: vi.fn(),
}));

vi.mock('@/domains/travel/api/travel-api', () => ({
  travelApi: {
    getTravelDetail,
    createTravel,
    updateTravel,
  },
}));

// ── Travel files API mock ─────────────────────────────────────────────────────

const { uploadTravelFile, uploadTravelFiles } = vi.hoisted(() => ({
  uploadTravelFile: vi.fn<(file: File) => Promise<FileAsset>>(),
  uploadTravelFiles: vi.fn<(files: File[]) => Promise<FileAsset[]>>(),
}));

vi.mock('@/domains/travel/api/travel-files-api', () => ({
  travelFilesApi: {
    uploadTravelFile,
    uploadTravelFiles,
  },
}));

function fileAsset(overrides: Partial<FileAsset> = {}): FileAsset {
  return {
    fileId: 'file-1',
    type: 'travel',
    originalFilename: 'cover.png',
    filename: 'cover.png',
    path: '/files/cover.png',
    mimeType: 'image/png',
    size: 1024,
    ...overrides,
  };
}

/** Fills in the fields required to pass validate() in register mode. */
async function fillRequiredFields(
  user: ReturnType<typeof renderWithMinimalProviders>['user'],
  container: HTMLElement
) {
  await user.type(screen.getByRole('textbox', { name: /제목/ }), '봄여행');
  await user.type(screen.getByRole('textbox', { name: /지역/ }), '부산');

  fireEvent.change(screen.getByLabelText(/^시작일/), {
    target: { value: '2025-06-01' },
  });
  fireEvent.change(screen.getByLabelText(/^종료일/), {
    target: { value: '2025-06-02' },
  });

  const dropzoneInputs = container.querySelectorAll<HTMLInputElement>(
    '.slcn-file-dropzone__input'
  );
  const coverInput = dropzoneInputs[0];

  if (!coverInput) {
    throw new Error('cover photo input not found');
  }

  await user.upload(
    coverInput,
    new File(['cover'], 'cover.png', { type: 'image/png' })
  );

  return { coverInput };
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockTravelDetail: TravelDetail = {
  id: 'item-1',
  travelId: 'travel-1',
  title: 'FE 테스트 부산 2일 여행',
  region: '부산',
  startDate: '2025-06-01',
  endDate: '2025-06-02',
  displayStartDate: '2025.06.01',
  displayEndDate: '2025.06.02',
  dateRangeLabel: '2025.06.01 – 2025.06.02',
  nightsDaysLabel: '1박 2일',
  coverPhotoId: null,
  oneLineReview: null,
  nights: 1,
  days: 2,
  travelDays: [
    {
      id: 'day-1',
      travelId: 'travel-1',
      date: '2025-06-01',
      displayDate: '2025.06.01',
      title: null,
      memo: null,
      coverPhotoId: null,
      dayNumber: 1,
      sortOrder: 0,
      places: [
        {
          id: 'place-1',
          name: 'FE 확인용 장소',
          category: 'TOURIST_SPOT',
          address: null,
          memo: '메모 내용',
          description: null,
          coverPhotoId: null,
          sortOrder: 0,
          photos: [],
        },
      ],
      photos: [],
    },
    {
      id: 'day-2',
      travelId: 'travel-1',
      date: '2025-06-02',
      displayDate: '2025.06.02',
      title: null,
      memo: null,
      coverPhotoId: null,
      dayNumber: 2,
      sortOrder: 1,
      places: [],
      photos: [],
    },
  ],
  places: [],
  photos: [],
  files: [],
  tags: [{ name: '부산여행' }],
  review: null,
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('TravelRegisterSection', () => {
  beforeEach(() => {
    getTravelDetail.mockReset();
    createTravel.mockReset();
    updateTravel.mockReset();
    uploadTravelFile.mockReset();
    uploadTravelFiles.mockReset();
    uploadTravelFiles.mockResolvedValue([]);
  });

  describe('register mode', () => {
    it('renders the form immediately with an empty title field', () => {
      renderWithMinimalProviders(
        <TravelRegisterSection device='main' mode='register' />
      );

      expect(
        screen.getByRole('heading', { name: '새 여행 기록하기' })
      ).toBeTruthy();

      // The title TextField is the required one; the tag input also shares '예) 봄여행'
      // so we find by label text instead.
      const titleInput = screen.getByRole('textbox', { name: /제목/ });
      expect((titleInput as HTMLInputElement).value).toBe('');
    });
  });

  describe('edit mode', () => {
    it('shows a loading state while the travel detail is being fetched', () => {
      // Never resolves — stays pending
      getTravelDetail.mockReturnValue(new Promise(() => {}));

      renderWithMinimalProviders(
        <TravelRegisterSection device='main' mode='edit' travelId='travel-1' />
      );

      expect(screen.getByText('불러오는 중…')).toBeTruthy();
    });

    it('prefills title, region, tags and day/place rows after detail loads', async () => {
      getTravelDetail.mockResolvedValue(mockTravelDetail);

      renderWithMinimalProviders(
        <TravelRegisterSection device='main' mode='edit' travelId='travel-1' />
      );

      // Wait for the form to appear (gated on data load)
      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /제목/ })).toBeTruthy();
      });

      // Title is prefilled
      const titleInput = screen.getByRole('textbox', { name: /제목/ });
      expect((titleInput as HTMLInputElement).value).toBe(
        'FE 테스트 부산 2일 여행'
      );

      // Region is prefilled
      const regionInput = screen.getByRole('textbox', { name: /지역/ });
      expect((regionInput as HTMLInputElement).value).toBe('부산');

      // Tag chip is rendered
      expect(screen.getByText('#부산여행')).toBeTruthy();

      // Both day cards are shown with their day number labels
      expect(screen.getByText('1일차')).toBeTruthy();
      expect(screen.getByText('2일차')).toBeTruthy();

      // The place name for day 1 is prefilled in the place input
      const placeInput = screen.getByDisplayValue('FE 확인용 장소');
      expect(placeInput).toBeTruthy();
    });

    it('shows an error state when the detail fetch fails', async () => {
      getTravelDetail.mockRejectedValue(new Error('network error'));

      renderWithMinimalProviders(
        <TravelRegisterSection device='main' mode='edit' travelId='travel-1' />
      );

      await waitFor(() => {
        expect(
          screen.getByText(
            '여행 정보를 불러오지 못했어요. 여행 목록에서 다시 열어 주세요.'
          )
        ).toBeTruthy();
      });
    });
  });

  describe('photo upload wiring', () => {
    it('uploads the cover photo and sends a files array containing a COVER item', async () => {
      uploadTravelFile.mockResolvedValue(fileAsset({ fileId: 'cover-1' }));
      createTravel.mockResolvedValue({
        ...mockTravelDetail,
        travelId: 'new-travel-id',
      });

      const { user, container } = renderWithMinimalProviders(
        <TravelRegisterSection device='main' mode='register' />
      );

      await fillRequiredFields(user, container);

      await user.click(screen.getByRole('button', { name: '저장하기' }));

      await waitFor(() => {
        expect(createTravel).toHaveBeenCalledTimes(1);
      });

      expect(uploadTravelFile).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'cover.png' })
      );

      const payload = createTravel.mock.calls[0]?.[0];
      expect(payload.files).toContainEqual(
        expect.objectContaining({
          fileAssetId: 'cover-1',
          targetType: 'TRAVEL',
          role: 'COVER',
        })
      );
      // The old, no-longer-valid `photos` field must not be sent.
      expect(payload.photos).toBeUndefined();
    });

    it('surfaces an error and never calls the create mutation when the upload fails', async () => {
      uploadTravelFile.mockRejectedValue(new Error('업로드 서버 오류'));

      const { user, container } = renderWithMinimalProviders(
        <TravelRegisterSection device='main' mode='register' />
      );

      await fillRequiredFields(user, container);

      await user.click(screen.getByRole('button', { name: '저장하기' }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeTruthy();
      });

      expect(createTravel).not.toHaveBeenCalled();

      // The user's input is preserved, not thrown away on failure.
      expect(
        (screen.getByRole('textbox', { name: /제목/ }) as HTMLInputElement)
          .value
      ).toBe('봄여행');
    });
  });

  describe('keyboard accessibility', () => {
    it('keeps both the cover and album dropzone inputs reachable by keyboard', () => {
      const { container } = renderWithMinimalProviders(
        <TravelRegisterSection device='main' mode='register' />
      );

      const dropzoneInputs = container.querySelectorAll<HTMLInputElement>(
        '.slcn-file-dropzone__input'
      );

      expect(dropzoneInputs.length).toBe(2);

      for (const input of dropzoneInputs) {
        expect(getComputedStyle(input).display).not.toBe('none');
        expect(input.hasAttribute('hidden')).toBe(false);
        expect(input.tabIndex).not.toBe(-1);

        input.focus();
        expect(document.activeElement).toBe(input);
      }
    });
  });

  describe('destructive date-change confirmation', () => {
    it('asks for confirmation before dropping a day with content, and cancelling keeps it', async () => {
      const { user } = renderWithMinimalProviders(
        <TravelRegisterSection device='main' mode='register' />
      );

      await user.type(screen.getByRole('textbox', { name: /제목/ }), '봄여행');

      fireEvent.change(screen.getByLabelText(/^시작일/), {
        target: { value: '2025-06-01' },
      });
      fireEvent.change(screen.getByLabelText(/^종료일/), {
        target: { value: '2025-06-02' },
      });

      // Write content into day 1's first place so it is at risk. Day cards
      // start with no place rows, so add one first.
      const day1Heading = screen.getByText('1일차');
      const day1Card = day1Heading.closest('.slcn-travel-day-editor');
      if (!day1Card) throw new Error('day 1 card not found');
      await user.click(
        within(day1Card as HTMLElement).getByRole('button', {
          name: '장소 추가',
        })
      );
      const placeInput = within(day1Card as HTMLElement).getByRole('textbox', {
        name: '장소명',
      });
      await user.type(placeInput, '해운대');

      // Move the start date forward so day 1 (2025-06-01) would be dropped.
      fireEvent.change(screen.getByLabelText(/^시작일/), {
        target: { value: '2025-06-02' },
      });

      const dialog = await screen.findByRole('dialog');
      expect(within(dialog).getByText(/사라져요/)).toBeTruthy();

      await user.click(
        within(dialog).getByRole('button', { name: '계속 둘게요' })
      );

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).toBeNull();
      });

      // Day 1 and its content are still there — the change was not applied.
      expect(screen.getByText('1일차')).toBeTruthy();
      expect(
        (
          within(day1Card as HTMLElement).getByRole('textbox', {
            name: '장소명',
          }) as HTMLInputElement
        ).value
      ).toBe('해운대');
      expect((screen.getByLabelText(/^시작일/) as HTMLInputElement).value).toBe(
        '2025-06-01'
      );
    });
  });

  describe('지역 validation', () => {
    it('blocks submit and shows an error when 지역 is left empty', async () => {
      const { user, container } = renderWithMinimalProviders(
        <TravelRegisterSection device='main' mode='register' />
      );

      await user.type(screen.getByRole('textbox', { name: /제목/ }), '봄여행');

      fireEvent.change(screen.getByLabelText(/^시작일/), {
        target: { value: '2025-06-01' },
      });
      fireEvent.change(screen.getByLabelText(/^종료일/), {
        target: { value: '2025-06-02' },
      });

      const coverInput = container.querySelectorAll<HTMLInputElement>(
        '.slcn-file-dropzone__input'
      )[0];
      if (!coverInput) throw new Error('cover photo input not found');
      await user.upload(
        coverInput,
        new File(['cover'], 'cover.png', { type: 'image/png' })
      );

      // 지역 is left empty on purpose.
      await user.click(screen.getByRole('button', { name: '저장하기' }));

      expect(await screen.findByText('지역을 입력해 주세요.')).toBeTruthy();
      expect(createTravel).not.toHaveBeenCalled();
    });
  });

  describe('date field accessibility', () => {
    it('wires 시작일/종료일 errors to the inputs via aria-describedby after a failed submit', async () => {
      const { user } = renderWithMinimalProviders(
        <TravelRegisterSection device='main' mode='register' />
      );

      await user.type(screen.getByRole('textbox', { name: /제목/ }), '봄여행');
      await user.type(screen.getByRole('textbox', { name: /지역/ }), '부산');

      // 시작일/종료일 left empty on purpose.
      await user.click(screen.getByRole('button', { name: '저장하기' }));

      const startDateInput = (await screen.findByLabelText(
        /^시작일/
      )) as HTMLInputElement;
      const endDateInput = screen.getByLabelText(/^종료일/) as HTMLInputElement;
      const startDateError = await screen.findByText('시작일을 선택해 주세요.');
      const endDateError = await screen.findByText('종료일을 선택해 주세요.');

      expect(startDateInput.getAttribute('aria-invalid')).toBe('true');
      expect(endDateInput.getAttribute('aria-invalid')).toBe('true');

      const startDescribedBy = startDateInput.getAttribute('aria-describedby');
      const endDescribedBy = endDateInput.getAttribute('aria-describedby');

      // Regression: these used to be null even though aria-invalid was set,
      // so a screen-reader user tabbing to the field never heard why it was
      // invalid (the error <p> had no id to point at).
      expect(startDescribedBy).toBeTruthy();
      expect(endDescribedBy).toBeTruthy();
      expect(startDateError.id).toBe(startDescribedBy);
      expect(endDateError.id).toBe(endDescribedBy);
    });
  });

  describe('cover/album file size validation', () => {
    function oversizedFile(name: string): File {
      const file = new File(['x'], name, { type: 'image/png' });
      Object.defineProperty(file, 'size', { value: 11 * 1024 * 1024 });
      return file;
    }

    it('rejects an oversized cover photo with an informal message and blocks submit', async () => {
      const { user, container } = renderWithMinimalProviders(
        <TravelRegisterSection device='main' mode='register' />
      );

      await user.type(screen.getByRole('textbox', { name: /제목/ }), '봄여행');
      await user.type(screen.getByRole('textbox', { name: /지역/ }), '부산');
      fireEvent.change(screen.getByLabelText(/^시작일/), {
        target: { value: '2025-06-01' },
      });
      fireEvent.change(screen.getByLabelText(/^종료일/), {
        target: { value: '2025-06-02' },
      });

      const coverInput = container.querySelectorAll<HTMLInputElement>(
        '.slcn-file-dropzone__input'
      )[0];
      if (!coverInput) throw new Error('cover photo input not found');
      await user.upload(coverInput, oversizedFile('huge-cover.png'));

      expect(
        await screen.findByText('사진은 10MB까지 올릴 수 있어요.')
      ).toBeTruthy();

      // The oversized file never entered form state, so the required
      // cover-photo field is still empty and submit is blocked. The
      // dropzone keeps showing the size message — it is still the most
      // useful, actionable explanation for why nothing was accepted.
      await user.click(screen.getByRole('button', { name: '저장하기' }));

      expect(createTravel).not.toHaveBeenCalled();
      expect(screen.getByText('사진은 10MB까지 올릴 수 있어요.')).toBeTruthy();
    });

    it('rejects an oversized album photo with an informal message', async () => {
      const { user, container } = renderWithMinimalProviders(
        <TravelRegisterSection device='main' mode='register' />
      );

      const albumInput = container.querySelectorAll<HTMLInputElement>(
        '.slcn-file-dropzone__input'
      )[1];
      if (!albumInput) throw new Error('album photo input not found');

      await user.upload(albumInput, oversizedFile('huge-album.png'));

      expect(
        await screen.findByText('사진은 10MB까지 올릴 수 있어요.')
      ).toBeTruthy();
    });
  });

  describe('cover/album file type validation', () => {
    function textFile(name: string): File {
      return new File(['not a photo'], name, { type: 'text/plain' });
    }

    it('rejects a .txt file dropped on the cover dropzone with a message and never selects it', async () => {
      renderWithMinimalProviders(
        <TravelRegisterSection device='main' mode='register' />
      );

      const dropTarget = screen
        .getByText('대표 사진을 끌어다 놓거나 선택하세요')
        .closest('label') as HTMLLabelElement;

      fireEvent.drop(dropTarget, {
        dataTransfer: {
          files: [textFile('notes.txt')],
          items: [],
          types: ['Files'],
        },
      });

      expect(
        await screen.findByText('jpg, jpeg, png 형식의 사진만 올릴 수 있어요.')
      ).toBeTruthy();

      // Rejected file never became the selected cover photo -- no filename
      // rendered anywhere in the dropzone's chosen-file row.
      expect(screen.queryByText('notes.txt')).toBeNull();
    });

    it('rejects a .txt file on the album input change event too (defence in depth on the change path)', () => {
      const { container } = renderWithMinimalProviders(
        <TravelRegisterSection device='main' mode='register' />
      );

      const albumInput = container.querySelectorAll<HTMLInputElement>(
        '.slcn-file-dropzone__input'
      )[1];
      if (!albumInput) throw new Error('album photo input not found');

      // userEvent.upload() itself enforces the input's `accept` attribute
      // (mirroring a real native picker's OS-level filter), so it can't
      // reach this component's own onChange handler with a mismatched
      // file. Firing the change event directly bypasses that simulated
      // filter to prove the handler rejects the file on its own merits --
      // the actual defence for anything that sets .files without going
      // through a filtered native dialog (accept is advisory, not
      // enforced by the DOM itself).
      Object.defineProperty(albumInput, 'files', {
        configurable: true,
        value: [textFile('notes.txt')],
      });
      fireEvent.change(albumInput);

      expect(
        screen.getByText('jpg, jpeg, png 형식의 사진만 올릴 수 있어요.')
      ).toBeTruthy();
      expect(screen.queryByText('notes.txt')).toBeNull();
    });
  });

  describe('place with a memo but no name', () => {
    it('names the day, blocks submit, and does not silently drop the memo', async () => {
      const { user, container } = renderWithMinimalProviders(
        <TravelRegisterSection device='main' mode='register' />
      );

      await fillRequiredFields(user, container);

      const day1Heading = screen.getByText('1일차');
      const day1Card = day1Heading.closest('.slcn-travel-day-editor');
      if (!day1Card) throw new Error('day 1 card not found');

      await user.click(
        within(day1Card as HTMLElement).getByRole('button', {
          name: '장소 추가',
        })
      );
      const memoInput = within(day1Card as HTMLElement).getByRole('textbox', {
        name: '메모',
      });
      await user.type(memoInput, '노을이 예뻤어요');
      // 장소명 is deliberately left blank.

      await user.click(screen.getByRole('button', { name: '저장하기' }));

      expect(
        await screen.findByText(
          '1일차에 메모만 적고 장소명을 비워 둔 곳이 있어요. 장소명을 입력해 주세요.'
        )
      ).toBeTruthy();
      expect(createTravel).not.toHaveBeenCalled();
    });
  });

  describe('여행 기간 with no dates entered', () => {
    it('shows a neutral placeholder and disables both stepper buttons', () => {
      renderWithMinimalProviders(
        <TravelRegisterSection device='main' mode='register' />
      );

      expect(screen.getByText('—')).toBeTruthy();
      expect(
        screen
          .getByRole('button', { name: '여행 기간 줄이기' })
          .hasAttribute('disabled')
      ).toBe(true);
      expect(
        screen
          .getByRole('button', { name: '여행 기간 늘리기' })
          .hasAttribute('disabled')
      ).toBe(true);
    });
  });

  describe('device-aware header', () => {
    it('renders its own visible h1 and back button on device="main"', () => {
      renderWithMinimalProviders(
        <TravelRegisterSection device='main' mode='register' />
      );

      const heading = screen.getByRole('heading', { name: '새 여행 기록하기' });
      expect(heading).toBeTruthy();
      // A visually-hidden h1 is still technically "visible" to
      // getByRole, so also check it isn't the visually-hidden variant.
      expect(heading.className).not.toContain('slcn-visually-hidden');

      expect(screen.getByRole('button', { name: '‹ 돌아가기' })).toBeTruthy();
    });

    it('keeps an accessible h1 but hides it and drops the back button on device="mobile"', () => {
      renderWithMinimalProviders(
        <TravelRegisterSection device='mobile' mode='register' />
      );

      // The mobile shell (DetailMobileShell) supplies the visible title and
      // back arrow for this route, so the section must not draw its own --
      // but a real h1 still has to exist for assistive tech.
      const heading = screen.getByRole('heading', { name: '새 여행 기록하기' });
      expect(heading).toBeTruthy();
      expect(heading.className).toContain('slcn-visually-hidden');

      expect(screen.queryByRole('button', { name: '‹ 돌아가기' })).toBeNull();
    });
  });

  describe('accessible names', () => {
    it('gives the tag, 장소명, and 메모 inputs a real accessible name', async () => {
      const { user } = renderWithMinimalProviders(
        <TravelRegisterSection device='main' mode='register' />
      );

      expect(screen.getByRole('textbox', { name: '태그 추가' })).toBeTruthy();

      fireEvent.change(screen.getByLabelText(/^시작일/), {
        target: { value: '2025-06-01' },
      });
      fireEvent.change(screen.getByLabelText(/^종료일/), {
        target: { value: '2025-06-01' },
      });

      const day1Heading = screen.getByText('1일차');
      const day1Card = day1Heading.closest('.slcn-travel-day-editor');
      if (!day1Card) throw new Error('day 1 card not found');
      await user.click(
        within(day1Card as HTMLElement).getByRole('button', {
          name: '장소 추가',
        })
      );

      expect(
        within(day1Card as HTMLElement).getByRole('textbox', {
          name: '장소명',
        })
      ).toBeTruthy();
      expect(
        within(day1Card as HTMLElement).getByRole('textbox', { name: '메모' })
      ).toBeTruthy();
    });
  });
});

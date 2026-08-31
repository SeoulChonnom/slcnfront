import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { createElement, type PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTripRegisterForm } from '@/domains/trip/hooks/useTripRegisterForm';
import { AppError } from '@/lib/api/errors';
import { createTestQueryClient } from '@/test/helpers/query-client';

const DRAFT_STORAGE_KEY = 'slcn:trip-register-draft';

function createWrapper() {
  const client = createTestQueryClient();

  return function Wrapper({ children }: PropsWithChildren) {
    return createElement(QueryClientProvider, { client }, children);
  };
}

function makeImageFile(name: string) {
  return new File(['x'], name, { type: 'image/png' });
}

function fillStep1(result: {
  current: ReturnType<typeof useTripRegisterForm>;
}) {
  act(() => {
    result.current.updateField('type', 'AYO');
    result.current.updateField('date', '2026-01-01');
    result.current.updateField('info2', '나들이 이름');
    result.current.updateField('logo', makeImageFile('logo.png'));
  });
}

function fillStep3(result: {
  current: ReturnType<typeof useTripRegisterForm>;
}) {
  act(() => {
    result.current.updateField('quizTitle', '퀴즈 제목');
    result.current.updateField('quizAnswerTitle', '정답 제목');
    result.current.updateField('quizAnswerText', '정답 텍스트');
    result.current.updateField('quizErrorTitle', '오답 제목');
    result.current.updateField('quizErrorText', '오답 텍스트');
    result.current.updateQuizOption(0, '보기 1');
    result.current.updateQuizOption(1, '보기 2');
    result.current.updateQuizOption(2, '보기 3');
    result.current.updateField('quizAnswer', '1');
  });
}

describe('useTripRegisterForm', () => {
  beforeEach(() => {
    try {
      sessionStorage.clear();
    } catch {
      // ignore
    }
  });

  it('clears a field error set by goNext once updateField is called for that field, leaving other errors intact', () => {
    const { result } = renderHook(() => useTripRegisterForm(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.goNext();
    });

    expect(result.current.errors.type).toBeDefined();
    expect(result.current.errors.date).toBeDefined();
    expect(result.current.errors.info2).toBeDefined();
    expect(result.current.errors.logo).toBeDefined();

    act(() => {
      result.current.updateField('type', 'AYO');
    });

    expect(result.current.errors.type).toBeUndefined();
    expect(result.current.errors.date).toBeDefined();
    expect(result.current.errors.info2).toBeDefined();
    expect(result.current.errors.logo).toBeDefined();
  });

  it('clears map2/button1/button2 errors when hasSecondMap is turned off', () => {
    const { result } = renderHook(() => useTripRegisterForm(), {
      wrapper: createWrapper(),
    });

    fillStep1(result);
    act(() => {
      result.current.goNext();
    });
    expect(result.current.step).toBe(2);

    act(() => {
      result.current.updateField('map1', makeImageFile('map1.png'));
      result.current.updateField('drive', 'https://drive.example');
      result.current.updateField('hasSecondMap', true);
    });

    act(() => {
      result.current.goNext();
    });

    expect(result.current.step).toBe(2);
    expect(result.current.errors.map2).toBeDefined();
    expect(result.current.errors.button1).toBeDefined();
    expect(result.current.errors.button2).toBeDefined();

    act(() => {
      result.current.updateField('hasSecondMap', false);
    });

    expect(result.current.errors.map2).toBeUndefined();
    expect(result.current.errors.button1).toBeUndefined();
    expect(result.current.errors.button2).toBeUndefined();
  });

  it('clears the quizOptions error when updateQuizOption is called', () => {
    const { result } = renderHook(() => useTripRegisterForm(), {
      wrapper: createWrapper(),
    });

    fillStep3(result);
    act(() => {
      result.current.updateQuizOption(0, '');
    });
    act(() => {
      result.current.submit();
    });

    expect(result.current.errors.quizOptions).toBeDefined();

    act(() => {
      result.current.updateQuizOption(0, '다시 채운 보기');
    });

    expect(result.current.errors.quizOptions).toBeUndefined();
  });

  it('restores a draft written to sessionStorage on a fresh mount, with file fields null and fileNames reported', () => {
    const draft = {
      version: 1,
      step: 2,
      values: {
        type: 'AYO',
        date: '2026-01-01',
        info2: '이어서 작성 중인 나들이',
        hasSecondMap: false,
        button1: '',
        button2: '',
        drive: 'https://drive.example',
        quizTitle: '',
        quizOptions: ['', '', ''],
        quizAnswer: '',
        quizAnswerTitle: '',
        quizAnswerText: '',
        quizErrorTitle: '',
        quizErrorText: '',
      },
      fileNames: {
        logo: 'logo.png',
        map1: 'map1.png',
      },
    };

    sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));

    const { result } = renderHook(() => useTripRegisterForm(), {
      wrapper: createWrapper(),
    });

    // The draft named files that cannot be restored, so the wizard rewinds to
    // step 1 instead of parking the user past a now-empty logo field.
    expect(result.current.step).toBe(1);
    expect(result.current.values.info2).toBe('이어서 작성 중인 나들이');
    expect(result.current.values.logo).toBeNull();
    expect(result.current.values.map1).toBeNull();
    expect(result.current.restoredDraft).toEqual({
      fileNames: { logo: 'logo.png', map1: 'map1.png' },
    });

    act(() => {
      result.current.dismissRestoredDraft();
    });

    expect(result.current.restoredDraft).toBeNull();
  });

  it('keeps the saved step when the draft carried no files', () => {
    sessionStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        step: 3,
        values: {
          type: 'AYO',
          date: '2026-01-01',
          info2: '이어서 작성 중인 나들이',
          hasSecondMap: false,
          button1: '',
          button2: '',
          drive: 'https://drive.example',
          quizTitle: '정답은?',
          quizOptions: ['', '', ''],
          quizAnswer: '',
          quizAnswerTitle: '',
          quizAnswerText: '',
          quizErrorTitle: '',
          quizErrorText: '',
        },
        fileNames: {},
      })
    );

    const { result } = renderHook(() => useTripRegisterForm(), {
      wrapper: createWrapper(),
    });

    expect(result.current.step).toBe(3);
    expect(result.current.values.quizTitle).toBe('정답은?');
  });

  it('discardDraft empties both state and sessionStorage', () => {
    const { result } = renderHook(() => useTripRegisterForm(), {
      wrapper: createWrapper(),
    });

    fillStep1(result);

    expect(sessionStorage.getItem(DRAFT_STORAGE_KEY)).not.toBeNull();

    act(() => {
      result.current.discardDraft();
    });

    expect(sessionStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull();
    expect(result.current.step).toBe(1);
    expect(result.current.errors).toEqual({});
    expect(result.current.values.info2).toBe('');
    expect(result.current.values.logo).toBeNull();
    expect(result.current.restoredDraft).toBeNull();
  });

  it('isDirty is false on a fresh mount and true after a field edit', () => {
    const { result } = renderHook(() => useTripRegisterForm(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isDirty).toBe(false);

    act(() => {
      result.current.updateField('info2', '나들이 이름');
    });

    expect(result.current.isDirty).toBe(true);
  });

  it('maps a NETWORK_ERROR AppError to the Korean network message', async () => {
    const onSubmit = async () => {
      throw new AppError({ code: 'NETWORK_ERROR', message: 'network down' });
    };

    const { result } = renderHook(() => useTripRegisterForm({ onSubmit }), {
      wrapper: createWrapper(),
    });

    fillStep1(result);
    act(() => {
      result.current.updateField('map1', makeImageFile('map1.png'));
      result.current.updateField('drive', 'https://drive.example');
    });
    fillStep3(result);

    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.submitErrorMessage).toBe(
      '네트워크에 연결할 수 없어요. 연결을 확인하고 다시 저장해 주세요.'
    );
  });

  it('maps a 500 HTTP_ERROR AppError to the Korean server-error message', async () => {
    const onSubmit = async () => {
      throw new AppError({
        code: 'HTTP_ERROR',
        message: 'server exploded',
        status: 500,
      });
    };

    const { result } = renderHook(() => useTripRegisterForm({ onSubmit }), {
      wrapper: createWrapper(),
    });

    fillStep1(result);
    act(() => {
      result.current.updateField('map1', makeImageFile('map1.png'));
      result.current.updateField('drive', 'https://drive.example');
    });
    fillStep3(result);

    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.submitErrorMessage).toBe(
      '서버에 문제가 생겨 저장하지 못했어요. 잠시 뒤 다시 시도해 주세요.'
    );
  });

  it('does not throw and keeps working when sessionStorage.setItem throws', () => {
    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('quota exceeded');
      });

    const { result } = renderHook(() => useTripRegisterForm(), {
      wrapper: createWrapper(),
    });

    expect(() => {
      act(() => {
        result.current.updateField('info2', '저장 안 되는 값');
      });
    }).not.toThrow();

    expect(result.current.values.info2).toBe('저장 안 되는 값');

    setItemSpy.mockRestore();
  });
});

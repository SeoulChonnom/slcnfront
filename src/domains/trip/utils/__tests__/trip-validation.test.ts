import { describe, expect, it } from 'vitest';
import { validateTripRegisterStep } from '../trip-validation';
import { createInitialTripRegisterValues } from '../trip-form-data';

describe('trip-validation', () => {
  it('returns typed keys for each step', () => {
    const step1Errors = validateTripRegisterStep(
      1,
      createInitialTripRegisterValues()
    );
    const step3Errors = validateTripRegisterStep(
      3,
      createInitialTripRegisterValues()
    );

    expect(Object.keys(step1Errors)).toEqual(['type', 'date', 'info2', 'logo']);
    expect(Object.keys(step3Errors)).toEqual([
      'quizTitle',
      'quizAnswerTitle',
      'quizAnswerText',
      'quizErrorTitle',
      'quizErrorText',
      'quizOptions',
      'quizAnswer',
    ]);
  });

  it('accepts an original quiz slot number when that specific slot is filled', () => {
    const errors = validateTripRegisterStep(3, {
      ...createInitialTripRegisterValues(),
      quizTitle: '정답은?',
      quizOptions: ['보기1', '', '보기3', ''],
      quizAnswer: '3',
      quizAnswerTitle: '정답',
      quizAnswerText: '맞았습니다.',
      quizErrorTitle: '오답',
      quizErrorText: '다시 시도하세요.',
    });

    expect(errors.quizAnswer).toBeUndefined();
    expect(errors.quizOptions).toBeUndefined();
  });

  it('rejects a selected quiz slot when the original slot is blank', () => {
    const errors = validateTripRegisterStep(3, {
      ...createInitialTripRegisterValues(),
      quizTitle: '정답은?',
      quizOptions: ['보기1', '', '보기3', ''],
      quizAnswer: '2',
      quizAnswerTitle: '정답',
      quizAnswerText: '맞았습니다.',
      quizErrorTitle: '오답',
      quizErrorText: '다시 시도하세요.',
    });

    expect(errors.quizAnswer).toBe(
      '정답 번호가 입력한 보기 수를 초과했습니다.'
    );
  });
});

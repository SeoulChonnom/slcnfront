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
});

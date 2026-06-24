import { describe, expect, it } from 'vitest';
import { AppError } from '../../../../lib/api/errors';
import {
  parseTripDetailResponse,
  parseTripQuizCheckResponse,
  parseTripQuizResponse,
} from '../trip-schemas';

describe('trip-schemas', () => {
  it('defaults optional trip detail fields when omitted', () => {
    expect(
      parseTripDetailResponse(
        {
          date: '2099-12-31',
          firstMap: { type: 'map', filename: 'map1.png' },
          driveUrl: 'https://drive.google.com/x',
        },
        'detail'
      )
    ).toEqual({
      date: '2099-12-31',
      firstMap: { type: 'map', filename: 'map1.png' },
      secondMap: null,
      nextButtonText: '',
      previousButtonText: '',
      driveUrl: 'https://drive.google.com/x',
    });
  });

  it('rejects payloads that use drive instead of driveUrl', () => {
    expect(() =>
      parseTripDetailResponse(
        {
          date: '2099-12-31',
          firstMap: { type: 'map', filename: 'map1.png' },
          drive: 'https://drive.google.com/x',
        },
        'detail'
      )
    ).toThrowError(AppError);
  });

  it('parses quiz payloads that match the current api spec', () => {
    expect(
      parseTripQuizResponse({
        title: '정답은?',
        options: [
          { id: 'option-2', text: '보기 2' },
          { id: 'option-1', text: '보기 1' },
        ],
      })
    ).toEqual({
      title: '정답은?',
      options: [
        { id: 'option-2', text: '보기 2' },
        { id: 'option-1', text: '보기 1' },
      ],
    });
  });

  it('rejects quiz payloads that include malformed option fields', () => {
    expect(() =>
      parseTripQuizResponse({
        title: '정답은?',
        options: [{ id: 'option-1', text: 123 }],
      })
    ).toThrowError(AppError);
  });

  it('parses quiz check payloads that match the current api spec', () => {
    expect(
      parseTripQuizCheckResponse({
        correct: false,
        title: '오답',
        text: '다시 골라보세요.',
      })
    ).toEqual({
      correct: false,
      title: '오답',
      text: '다시 골라보세요.',
    });
  });

  it('rejects quiz check payloads with malformed fields', () => {
    expect(() =>
      parseTripQuizCheckResponse({
        correct: 'false',
        title: '오답',
        text: '다시 골라보세요.',
      })
    ).toThrowError(AppError);
  });
});

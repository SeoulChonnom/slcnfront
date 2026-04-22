import { describe, expect, it } from 'vitest';
import { AppError } from '../../../../lib/api/errors';
import { parseTripDetailResponse } from '../trip-schemas';

describe('trip-schemas', () => {
  it('defaults omitted optional trip detail strings to empty strings', () => {
    expect(
      parseTripDetailResponse(
        {
          date: '2099-12-31',
          firstMap: '/map1.png',
          drive: 'https://drive.google.com/x',
        },
        'detail'
      )
    ).toEqual({
      date: '2099-12-31',
      firstMap: '/map1.png',
      secondMap: '',
      nextButtonText: '',
      previousButtonText: '',
      drive: 'https://drive.google.com/x',
    });
  });

  it('rejects legacy driveUrl-only payloads', () => {
    expect(() =>
      parseTripDetailResponse(
        {
          date: '2099-12-31',
          firstMap: '/map1.png',
          driveUrl: 'https://drive.google.com/x',
        },
        'detail'
      )
    ).toThrowError(AppError);
  });
});

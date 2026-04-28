import { describe, expect, it } from 'vitest';
import {
  buildTripRegisterPayload,
  mapTripDetailDto,
  mapTripListItemDto,
} from '../trip-mappers';

describe('trip-mappers', () => {
  it('maps trip list and detail dto shapes', () => {
    expect(
      mapTripListItemDto({
        id: 'trip-1',
        date: '20991231',
        type: 'year-end',
        name: '연말 나들이',
        logo: '/logo.png',
      })
    ).toMatchObject({
      displayDate: '2099.12.31',
      logoPath: '/logo.png',
      type: 'year-end',
    });

    expect(
      mapTripDetailDto({
        date: '20991231',
        firstMap: '/map1.png',
        secondMap: '',
        nextButtonText: '',
        previousButtonText: '이전',
        driveUrl: 'https://drive.google.com/x',
      })
    ).toMatchObject({
      firstMapPath: '/map1.png',
      secondMapPath: '',
      nextButtonText: '',
      previousButtonText: '이전',
      driveUrl: 'https://drive.google.com/x',
    });
  });

  it('builds a TripCdo-shaped payload with one correct quiz option', () => {
    const payload = buildTripRegisterPayload(
      {
        type: 'A',
        date: '2099-12-31',
        info2: '연말 나들이',
        logo: new File(['logo'], 'logo.png', { type: 'image/png' }),
        map1: new File(['map1'], 'map1.png', { type: 'image/png' }),
        hasSecondMap: true,
        map2: new File(['map2'], 'map2.png', { type: 'image/png' }),
        button1: '1차 경로',
        button2: '2차 경로',
        drive: 'https://drive.google.com/x',
        quizTitle: '정답은?',
        quizOptions: ['보기1', '보기2', '', '보기4'],
        quizAnswer: '2',
        quizAnswerTitle: '정답',
        quizAnswerText: '맞았습니다.',
        quizErrorTitle: '오답',
        quizErrorText: '다시 시도하세요.',
      },
      {
        logo: '/files/logo.png',
        firstMap: '/files/map1.png',
        secondMap: '   /files/map2.png   ',
      }
    );

    expect(payload).toEqual({
      date: '2099-12-31',
      type: 'A',
      name: '연말 나들이',
      logo: '/files/logo.png',
      firstMap: '/files/map1.png',
      secondMap: '/files/map2.png',
      nextButtonText: '1차 경로',
      previousButtonText: '2차 경로',
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
          { text: '보기4', isCorrect: false },
        ],
      },
    });
    expect(
      payload.quiz.options.filter((option) => option.isCorrect)
    ).toHaveLength(1);
  });

  it('preserves the selected answer when blank options appear earlier in the original slots', () => {
    const payload = buildTripRegisterPayload(
      {
        type: 'A',
        date: '2099-12-31',
        info2: '여름 나들이',
        logo: new File(['logo'], 'logo.png', { type: 'image/png' }),
        map1: new File(['map1'], 'map1.png', { type: 'image/png' }),
        hasSecondMap: false,
        map2: null,
        button1: '',
        button2: '',
        drive: 'https://drive.google.com/summer',
        quizTitle: '정답은?',
        quizOptions: ['보기1', '', '보기3', ''],
        quizAnswer: '3',
        quizAnswerTitle: '정답',
        quizAnswerText: '맞았습니다.',
        quizErrorTitle: '오답',
        quizErrorText: '다시 시도하세요.',
      },
      {
        logo: '/files/logo.png',
        firstMap: '/files/map1.png',
      }
    );

    expect(payload.quiz.options).toEqual([
      { text: '보기1', isCorrect: false },
      { text: '보기3', isCorrect: true },
    ]);
    expect(
      payload.quiz.options.filter((option) => option.isCorrect)
    ).toHaveLength(1);
  });

  it('omits blank optional fields from the TripCdo payload', () => {
    const payload = buildTripRegisterPayload(
      {
        type: 'A',
        date: '2099-12-31',
        info2: '봄 나들이',
        logo: new File(['logo'], 'logo.png', { type: 'image/png' }),
        map1: new File(['map1'], 'map1.png', { type: 'image/png' }),
        hasSecondMap: false,
        map2: null,
        button1: '   ',
        button2: '   ',
        drive: 'https://drive.google.com/spring',
        quizTitle: '정답은?',
        quizOptions: ['보기1', '  보기2  ', '', ''],
        quizAnswer: '',
        quizAnswerTitle: '정답',
        quizAnswerText: '설명',
        quizErrorTitle: '오답',
        quizErrorText: '다시 시도',
      },
      {
        logo: '/files/logo.png',
        firstMap: '/files/map1.png',
        secondMap: '   ',
      }
    );

    expect(payload).toEqual({
      date: '2099-12-31',
      type: 'A',
      name: '봄 나들이',
      logo: '/files/logo.png',
      firstMap: '/files/map1.png',
      driveUrl: 'https://drive.google.com/spring',
      quiz: {
        title: '정답은?',
        answerTitle: '정답',
        answerText: '설명',
        errorTitle: '오답',
        errorText: '다시 시도',
        options: [
          { text: '보기1', isCorrect: false },
          { text: '보기2', isCorrect: false },
        ],
      },
    });
    expect(payload).not.toHaveProperty('secondMap');
    expect(payload).not.toHaveProperty('nextButtonText');
    expect(payload).not.toHaveProperty('previousButtonText');
  });
});

import { buildTripRegisterPayload } from '../trip-form-data';

describe('trip-form-data', () => {
  it('builds the multipart payload source with zero-based quiz index', () => {
    const payload = buildTripRegisterPayload({
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
    });

    expect(payload.request).toEqual({
      date: '20991231',
      type: 'A',
      info1: '2099.12.31',
      info2: '연말 나들이',
      button1: '1차 경로',
      button2: '2차 경로',
      drive: 'https://drive.google.com/x',
      quizTitle: '정답은?',
      quizAnswer: '1',
      quizAnswerTitle: '정답',
      quizAnswerText: '맞았습니다.',
      quizErrorTitle: '오답',
      quizErrorText: '다시 시도하세요.',
      quizRegisterRequestList: [
        { quizIndex: '0', answer: '보기1' },
        { quizIndex: '1', answer: '보기2' },
        { quizIndex: '3', answer: '보기4' },
      ],
    });
    expect(payload.files.map2?.name).toBe('map2.png');
  });
});

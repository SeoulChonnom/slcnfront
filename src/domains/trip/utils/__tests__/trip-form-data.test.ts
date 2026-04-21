import { createInitialTripRegisterValues } from '../trip-form-data';

describe('trip-form-data', () => {
  it('creates the default wizard values', () => {
    expect(createInitialTripRegisterValues()).toEqual({
      type: '',
      date: '',
      info2: '',
      logo: null,
      map1: null,
      hasSecondMap: false,
      map2: null,
      button1: '',
      button2: '',
      drive: '',
      quizTitle: '',
      quizOptions: ['', '', '', ''],
      quizAnswer: '',
      quizAnswerTitle: '',
      quizAnswerText: '',
      quizErrorTitle: '',
      quizErrorText: '',
    });
  });
});

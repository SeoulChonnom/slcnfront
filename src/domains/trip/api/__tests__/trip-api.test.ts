import { describe, expect, it, vi } from 'vitest';
import { AppError } from '../../../../lib/api/errors';
import { createApiClient } from '../../../../lib/api/api-client';
import { createTripApi, buildTripRegisterFormData } from '../trip-api';
import { createTripFilesApi } from '../trip-files-api';

describe('trip-api', () => {
  it('builds multipart payload with json blob and file fields', async () => {
    const payload = buildTripRegisterFormData({
      request: {
        date: '2099-12-31',
        type: 'year-end',
        info1: '2099.12.31',
        info2: '연말 나들이',
        button1: '다음',
        button2: '이전',
        drive: 'https://drive.google.com/x',
        quizTitle: '정답은?',
        quizAnswer: '2',
        quizAnswerTitle: '정답',
        quizAnswerText: '설명',
        quizErrorTitle: '오답',
        quizErrorText: '다시 시도',
        quizRegisterRequestList: [{ quizIndex: '0', answer: '보기1' }],
      },
      files: {
        logo: new File(['logo'], 'logo.png', { type: 'image/png' }),
        map1: new File(['map-1'], 'map1.png', { type: 'image/png' }),
      },
    });

    const requestBlob = payload.get('tripRegisterRequest');

    expect(requestBlob).toBeInstanceOf(File);
    expect(JSON.parse(await (requestBlob as File).text())).toMatchObject({
      date: '2099-12-31',
      quizTitle: '정답은?',
    });
    expect(payload.get('logo')).toBeInstanceOf(File);
    expect(payload.get('map1')).toBeInstanceOf(File);
    expect(payload.get('map2')).toBeNull();
  });

  it('calls trip endpoints with the expected request shapes', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              id: 'trip-1',
              date: '2099-12-31',
              type: 'year-end',
              name: '연말 나들이',
              logo: '/logo.png',
            },
          ]),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            date: '2099-12-31',
            firstMap: '/map1.png',
            secondMap: '/map2.png',
            nextButtonText: '다음',
            previousButtonText: '이전',
            driveUrl: 'https://drive.google.com/x',
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            title: '정답은?',
            options: [
              { id: 'option-1', text: '보기1', sortOrder: 1 },
              { id: 'option-2', text: '보기2', sortOrder: 2 },
            ],
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            correct: true,
            title: '정답',
            text: '설명',
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            date: '2099-12-31',
            firstMap: '/map1.png',
            secondMap: '/map2.png',
            nextButtonText: '다음',
            previousButtonText: '이전',
            driveUrl: 'https://drive.google.com/x',
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      )
      .mockResolvedValueOnce(new Response('file-content', { status: 200 }));
    const client = createApiClient({
      fetchFn,
      getBaseUrl: () => 'http://localhost:8080/api',
      getAccessToken: () => 'token-123',
    });
    const tripApi = createTripApi(client);
    const tripFilesApi = createTripFilesApi(client);

    const tripList = await tripApi.getTripList();
    const tripDetail = await tripApi.getTripDetail('trip-1');
    const tripQuiz = await tripApi.getTripQuiz('trip-1');
    const quizFeedback = await tripApi.checkTripQuizAnswer(
      'trip-1',
      'option-2'
    );
    const registeredTrip = await tripApi.registerTrip({
      request: {
        date: '2099-12-31',
        type: 'year-end',
        info1: '2099.12.31',
        info2: '연말 나들이',
        button1: '다음',
        button2: '이전',
        drive: 'https://drive.google.com/x',
        quizTitle: '정답은?',
        quizAnswer: '2',
        quizAnswerTitle: '정답',
        quizAnswerText: '설명',
        quizErrorTitle: '오답',
        quizErrorText: '다시 시도',
        quizRegisterRequestList: [{ quizIndex: '0', answer: '보기1' }],
      },
      files: {},
    });
    const fileBlob = await tripFilesApi.downloadTripFile('/logo.png');

    expect(tripList[0]?.logoPath).toBe('/logo.png');
    expect(tripList[0]?.type).toBe('year-end');
    expect(tripDetail.firstMapPath).toBe('/map1.png');
    expect(tripQuiz.options).toHaveLength(2);
    expect(quizFeedback).toEqual({
      isCorrect: true,
      title: '정답',
      description: '설명',
    });
    expect(registeredTrip.driveUrl).toBe('https://drive.google.com/x');
    expect(await fileBlob.text()).toBe('file-content');
    expect(fetchFn.mock.calls[0]?.[0]).toBe('http://localhost:8080/api/trip');
    expect(fetchFn.mock.calls[1]?.[0]).toBe(
      'http://localhost:8080/api/trip/trip-1'
    );
    expect(fetchFn.mock.calls[2]?.[0]).toBe(
      'http://localhost:8080/api/trip/quiz/trip-1'
    );
    expect(fetchFn.mock.calls[3]?.[0]).toBe(
      'http://localhost:8080/api/trip/quiz/check?arg0=trip-1&arg1=option-2'
    );
    expect(fetchFn.mock.calls[4]?.[0]).toBe('http://localhost:8080/api/trip');
    expect(fetchFn.mock.calls[5]?.[0]).toBe(
      'http://localhost:8080/api/file?path=%2Flogo.png'
    );
    expect(fetchFn.mock.calls[4]?.[1]?.body).toBeInstanceOf(FormData);
  });

  it('rejects malformed trip list payloads as INVALID_RESPONSE', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: 'trip-1',
            date: '2099-12-31',
            type: 123,
            name: '연말 나들이',
            logo: '/logo.png',
          },
        ]),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    );
    const tripApi = createTripApi(
      createApiClient({
        fetchFn,
        getBaseUrl: () => 'http://localhost:8080/api',
      })
    );

    await expect(tripApi.getTripList()).rejects.toMatchObject({
      name: 'AppError',
      code: 'INVALID_RESPONSE',
      message: 'Trip list response payload is invalid.',
    } satisfies Partial<AppError>);
  });

  it('rejects malformed trip quiz payloads as INVALID_RESPONSE', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          title: '정답은?',
          options: [{ id: 'option-1', text: '보기1', sortOrder: '1' }],
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    );
    const tripApi = createTripApi(
      createApiClient({
        fetchFn,
        getBaseUrl: () => 'http://localhost:8080/api',
      })
    );

    await expect(tripApi.getTripQuiz('trip-1')).rejects.toMatchObject({
      name: 'AppError',
      code: 'INVALID_RESPONSE',
      message: 'Trip quiz response payload is invalid.',
    } satisfies Partial<AppError>);
  });

  it('rejects malformed trip quiz check payloads as INVALID_RESPONSE', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          correct: 'true',
          title: '정답',
          text: '설명',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    );
    const tripApi = createTripApi(
      createApiClient({
        fetchFn,
        getBaseUrl: () => 'http://localhost:8080/api',
      })
    );

    await expect(
      tripApi.checkTripQuizAnswer('trip-1', 'option-1')
    ).rejects.toMatchObject({
      name: 'AppError',
      code: 'INVALID_RESPONSE',
      message: 'Trip quiz check response payload is invalid.',
    } satisfies Partial<AppError>);
  });

  it('rejects malformed trip detail payloads as INVALID_RESPONSE', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          date: '2099-12-31',
          firstMap: 123,
          secondMap: '/map2.png',
          nextButtonText: '다음',
          previousButtonText: '이전',
          driveUrl: 'https://drive.google.com/x',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    );
    const tripApi = createTripApi(
      createApiClient({
        fetchFn,
        getBaseUrl: () => 'http://localhost:8080/api',
      })
    );

    await expect(tripApi.getTripDetail('2099-12-31')).rejects.toMatchObject({
      name: 'AppError',
      code: 'INVALID_RESPONSE',
      message: 'Trip detail response payload is invalid.',
    } satisfies Partial<AppError>);
  });

  it('rejects malformed trip register payloads as INVALID_RESPONSE', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          date: '2099-12-31',
          firstMap: '/map1.png',
          secondMap: '/map2.png',
          nextButtonText: '다음',
          previousButtonText: '이전',
          driveUrl: 123,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    );
    const tripApi = createTripApi(
      createApiClient({
        fetchFn,
        getBaseUrl: () => 'http://localhost:8080/api',
      })
    );

    await expect(
      tripApi.registerTrip({
        request: {
          date: '2099-12-31',
          type: 'year-end',
          info1: '2099.12.31',
          info2: '연말 나들이',
          button1: '다음',
          button2: '이전',
          drive: 'https://drive.google.com/x',
          quizTitle: '정답은?',
          quizAnswer: '2',
          quizAnswerTitle: '정답',
          quizAnswerText: '설명',
          quizErrorTitle: '오답',
          quizErrorText: '다시 시도',
          quizRegisterRequestList: [{ quizIndex: '0', answer: '보기1' }],
        },
        files: {},
      })
    ).rejects.toMatchObject({
      name: 'AppError',
      code: 'INVALID_RESPONSE',
      message: 'Trip register response payload is invalid.',
    } satisfies Partial<AppError>);
  });
});

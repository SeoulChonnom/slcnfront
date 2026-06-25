import { describe, expect, it, vi } from 'vitest';
import { createApiClient } from '../../../../lib/api/api-client';
import type { AppError } from '../../../../lib/api/errors';
import type { FileAsset } from '../../types';
import { createTripApi } from '../trip-api';
import { createTripFilesApi } from '../trip-files-api';

function fileAsset(overrides: Partial<FileAsset> = {}): FileAsset {
  return {
    fileId: 'file-1',
    type: 'map',
    originalFilename: 'map.png',
    filename: 'map.png',
    path: '/files/map.png',
    mimeType: 'image/png',
    size: 1024,
    ...overrides,
  };
}

const logoAsset = fileAsset({
  fileId: 'logo-1',
  type: 'logo',
  filename: 'logo.png',
  originalFilename: 'logo.png',
});
const firstMapAsset = fileAsset({ fileId: 'map-1', filename: 'map1.png' });
const secondMapAsset = fileAsset({ fileId: 'map-2', filename: 'map2.png' });

describe('trip-api', () => {
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
              logo: logoAsset,
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
            firstMap: firstMapAsset,
            secondMap: secondMapAsset,
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
              { id: 'option-1', text: '보기1' },
              { id: 'option-2', text: '보기2' },
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
            firstMap: firstMapAsset,
            secondMap: secondMapAsset,
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
      .mockResolvedValueOnce(new Response('file-content', { status: 200 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify(logoAsset), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(secondMapAsset), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );
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
      date: '2099-12-31',
      type: 'year-end',
      name: '연말 나들이',
      logoFileId: 'logo-1',
      firstMapFileId: 'map-1',
      secondMapFileId: 'map-2',
      nextButtonText: '다음',
      previousButtonText: '이전',
      driveUrl: 'https://drive.google.com/x',
      quiz: {
        title: '정답은?',
        answerTitle: '정답',
        answerText: '설명',
        errorTitle: '오답',
        errorText: '다시 시도',
        options: [{ text: '보기1', isCorrect: true }],
      },
    });
    const fileBlob = await tripFilesApi.downloadTripFile(logoAsset);
    const uploadedLogo = await tripFilesApi.uploadTripFile(
      'logo',
      new File(['logo'], 'logo.png', { type: 'image/png' })
    );
    const uploadedMap = await tripFilesApi.uploadTripFile(
      'map2',
      new File(['map-2'], 'map2.png', { type: 'image/png' })
    );

    expect(tripList[0]?.logo).toEqual(logoAsset);
    expect(tripList[0]?.type).toBe('year-end');
    expect(tripDetail.firstMap).toEqual(firstMapAsset);
    expect(tripQuiz.options).toEqual([
      { id: 'option-1', text: '보기1' },
      { id: 'option-2', text: '보기2' },
    ]);
    expect(quizFeedback).toEqual({
      isCorrect: true,
      title: '정답',
      description: '설명',
    });
    expect(registeredTrip.driveUrl).toBe('https://drive.google.com/x');
    expect(await fileBlob.text()).toBe('file-content');
    expect(fetchFn.mock.calls[0]?.[0]).toBe('http://localhost:8080/api/trips');
    expect(fetchFn.mock.calls[1]?.[0]).toBe(
      'http://localhost:8080/api/trips/trip-1'
    );
    expect(fetchFn.mock.calls[2]?.[0]).toBe(
      'http://localhost:8080/api/trips/quiz/trip-1'
    );
    expect(fetchFn.mock.calls[3]?.[0]).toBe(
      'http://localhost:8080/api/trips/quiz/check?tripId=trip-1&optionId=option-2'
    );
    expect(fetchFn.mock.calls[4]?.[0]).toBe('http://localhost:8080/api/trips');
    expect(fetchFn.mock.calls[5]?.[0]).toBe(
      'http://localhost:8080/api/assets/files/logo-1'
    );
    expect(fetchFn.mock.calls[6]?.[0]).toBe(
      'http://localhost:8080/api/assets/file?type=logo'
    );
    expect(fetchFn.mock.calls[7]?.[0]).toBe(
      'http://localhost:8080/api/assets/file?type=map'
    );

    const registerInit = fetchFn.mock.calls[4]?.[1];
    const uploadLogoInit = fetchFn.mock.calls[6]?.[1];
    const uploadMapInit = fetchFn.mock.calls[7]?.[1];

    expect(new Headers(registerInit?.headers).get('content-type')).toBe(
      'application/json'
    );
    expect(registerInit?.body).toBe(
      JSON.stringify({
        date: '2099-12-31',
        type: 'year-end',
        name: '연말 나들이',
        logoFileId: 'logo-1',
        firstMapFileId: 'map-1',
        secondMapFileId: 'map-2',
        nextButtonText: '다음',
        previousButtonText: '이전',
        driveUrl: 'https://drive.google.com/x',
        quiz: {
          title: '정답은?',
          answerTitle: '정답',
          answerText: '설명',
          errorTitle: '오답',
          errorText: '다시 시도',
          options: [{ text: '보기1', isCorrect: true }],
        },
      })
    );

    expect(uploadedLogo).toEqual(logoAsset);
    expect(uploadedMap).toEqual(secondMapAsset);
    expect(uploadLogoInit?.method).toBe('POST');
    expect(uploadLogoInit?.body).toBeInstanceOf(FormData);
    expect(new Headers(uploadLogoInit?.headers).get('content-type')).toBeNull();
    expect((uploadLogoInit?.body as FormData).get('file')).toBeInstanceOf(File);
    expect((uploadLogoInit?.body as FormData).get('type')).toBeNull();
    expect(uploadMapInit?.method).toBe('POST');
    expect(uploadMapInit?.body).toBeInstanceOf(FormData);
    expect(new Headers(uploadMapInit?.headers).get('content-type')).toBeNull();
    expect((uploadMapInit?.body as FormData).get('file')).toBeInstanceOf(File);
    expect((uploadMapInit?.body as FormData).get('type')).toBeNull();
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
            logo: { type: 'logo', filename: 'logo.png' },
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
          options: [{ id: 'option-1', text: 123 }],
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
          secondMap: { type: 'map', filename: 'map2.png' },
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
          firstMap: { type: 'map', filename: 'map1.png' },
          secondMap: { type: 'map', filename: 'map2.png' },
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
        date: '2099-12-31',
        type: 'year-end',
        name: '연말 나들이',
        logoFileId: 'logo-1',
        firstMapFileId: 'map-1',
        secondMapFileId: 'map-2',
        nextButtonText: '다음',
        previousButtonText: '이전',
        driveUrl: 'https://drive.google.com/x',
        quiz: {
          title: '정답은?',
          answerTitle: '정답',
          answerText: '설명',
          errorTitle: '오답',
          errorText: '다시 시도',
          options: [{ text: '보기1', isCorrect: true }],
        },
      })
    ).rejects.toMatchObject({
      name: 'AppError',
      code: 'INVALID_RESPONSE',
      message: 'Trip register response payload is invalid.',
    } satisfies Partial<AppError>);
  });
});

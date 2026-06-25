import { describe, expect, it, vi } from 'vitest';
import { createApiClient } from '../../../../lib/api/api-client';
import type { AppError } from '../../../../lib/api/errors';
import { createTravelApi } from '../travel-api';

// ── Shared fixtures ───────────────────────────────────────────────────────────

const validTravelRdo = {
  id: 'item-1',
  travelId: 'travel-1',
  title: '제주도 여행',
  region: '제주',
  startDate: '2025-06-01',
  endDate: '2025-06-05',
  coverPhotoId: null,
  oneLineReview: '좋았어요',
  nights: 4,
  days: 5,
  tags: [],
};

const validPhoto = {
  id: 'photo-1',
  travelId: 'travel-1',
  travelDayId: 'day-1',
  travelPlaceId: null,
  photoFileId: 'file-1',
  caption: null,
  sortOrder: 0,
};

const validPlace = {
  id: 'place-1',
  travelId: 'travel-1',
  travelDayId: 'day-1',
  name: '한라산',
  category: 'TOURIST_SPOT',
  address: null,
  memo: null,
  description: null,
  coverPhotoId: null,
  sortOrder: 0,
  photos: [],
};

const validDay = {
  id: 'day-1',
  travelId: 'travel-1',
  date: '2025-06-01',
  title: '1일차',
  memo: null,
  coverPhotoId: null,
  dayNumber: 1,
  sortOrder: 0,
  places: [validPlace],
  photos: [validPhoto],
};

const validDetailRdo = {
  id: 'item-1',
  travelId: 'travel-1',
  title: '제주도 여행',
  region: '제주',
  startDate: '2025-06-01',
  endDate: '2025-06-05',
  coverPhotoId: null,
  oneLineReview: '좋았어요',
  nights: 4,
  days: 5,
  travelDays: [validDay],
  places: [validPlace],
  photos: [validPhoto],
  tags: [],
  review: null,
};

const validTagRdo = {
  id: 'tag-1',
  travelId: 'travel-1',
  name: '힐링',
  sortOrder: 0,
};

const validReviewRdo = {
  id: 'review-1',
  travelId: 'travel-1',
  content: '좋았어요',
  oneLineSummary: null,
  goodPoint: null,
  badPoint: null,
  revisitPlace: null,
  finalReview: null,
};

function makeJsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function makeVoidResponse() {
  return new Response(null, { status: 204 });
}

describe('travel-api', () => {
  it('getTravelList: calls /travels and maps the response', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(makeJsonResponse([validTravelRdo]));

    const client = createApiClient({
      fetchFn,
      getBaseUrl: () => 'http://localhost:8080/api',
      getAccessToken: () => 'token-123',
    });
    const api = createTravelApi(client);

    const list = await api.getTravelList();

    expect(list).toHaveLength(1);
    expect(list[0]?.title).toBe('제주도 여행');
    expect(list[0]?.nightsDaysLabel).toBe('4박 5일');
    expect(fetchFn.mock.calls[0]?.[0]).toBe(
      'http://localhost:8080/api/travels'
    );
  });

  it('getTravelDetail: calls /travels/:id and maps the response', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(makeJsonResponse(validDetailRdo));

    const client = createApiClient({
      fetchFn,
      getBaseUrl: () => 'http://localhost:8080/api',
      getAccessToken: () => 'token-123',
    });
    const api = createTravelApi(client);

    const detail = await api.getTravelDetail('travel-1');

    expect(detail.title).toBe('제주도 여행');
    expect(detail.review).toBeNull();
    expect(detail.travelDays).toHaveLength(1);
    expect(fetchFn.mock.calls[0]?.[0]).toBe(
      'http://localhost:8080/api/travels/travel-1'
    );
  });

  it('createTravel: POSTs to /travels with body and maps detail response', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(makeJsonResponse(validDetailRdo));

    const client = createApiClient({
      fetchFn,
      getBaseUrl: () => 'http://localhost:8080/api',
      getAccessToken: () => 'token-123',
    });
    const api = createTravelApi(client);

    const result = await api.createTravel({
      title: '제주도 여행',
      region: '제주',
      startDate: '2025-06-01',
      endDate: '2025-06-05',
      tags: ['힐링'],
      travelDays: [
        {
          date: '2025-06-01',
          sortOrder: 0,
          photos: [],
          places: [
            {
              name: '한라산',
              category: 'TOURIST_SPOT',
              sortOrder: 0,
              photos: [],
            },
          ],
        },
      ],
      photos: [],
      review: { content: '좋았어요' },
    });

    expect(result.id).toBe('item-1');
    const call = fetchFn.mock.calls[0];
    expect(call?.[0]).toBe('http://localhost:8080/api/travels');
    expect(call?.[1]?.method).toBe('POST');
    expect(JSON.parse(call?.[1]?.body as string)).toMatchObject({
      title: '제주도 여행',
      region: '제주',
      tags: ['힐링'],
      travelDays: [
        {
          date: '2025-06-01',
          sortOrder: 0,
          places: [{ name: '한라산', category: 'TOURIST_SPOT', sortOrder: 0 }],
        },
      ],
      photos: [],
      review: { content: '좋았어요' },
    });
  });

  it('updateTravel: PATCHes /travels/:id with body and maps detail response', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        makeJsonResponse({ ...validDetailRdo, title: '수정된 제주' })
      );

    const client = createApiClient({
      fetchFn,
      getBaseUrl: () => 'http://localhost:8080/api',
      getAccessToken: () => 'token-123',
    });
    const api = createTravelApi(client);

    const result = await api.updateTravel('travel-1', {
      title: '수정된 제주',
      region: '제주',
      startDate: '2025-06-01',
      endDate: '2025-06-05',
      tags: [],
      confirmDeleteDays: true,
      travelDays: [],
      photos: [],
      review: {},
    });

    expect(result.title).toBe('수정된 제주');
    const call = fetchFn.mock.calls[0];
    expect(call?.[0]).toBe('http://localhost:8080/api/travels/travel-1');
    expect(call?.[1]?.method).toBe('PATCH');
    expect(JSON.parse(call?.[1]?.body as string)).toMatchObject({
      confirmDeleteDays: true,
      travelDays: [],
    });
  });

  it('putTravel: PUTs /travels/:id with the full nested body and maps detail', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        makeJsonResponse({ ...validDetailRdo, title: '교체된 제주' })
      );

    const client = createApiClient({
      fetchFn,
      getBaseUrl: () => 'http://localhost:8080/api',
      getAccessToken: () => 'token-123',
    });
    const api = createTravelApi(client);

    const result = await api.putTravel('travel-1', {
      title: '교체된 제주',
      region: '제주',
      startDate: '2025-06-01',
      endDate: '2025-06-05',
      tags: ['힐링'],
      confirmDeleteDays: true,
      travelDays: [
        {
          id: 'day-1',
          date: '2025-06-01',
          sortOrder: 0,
          photos: [],
          places: [
            {
              name: '한라산',
              category: 'TOURIST_SPOT',
              sortOrder: 0,
              photos: [],
            },
          ],
        },
      ],
      photos: [],
      review: { content: '좋았어요' },
    });

    expect(result.title).toBe('교체된 제주');
    const call = fetchFn.mock.calls[0];
    expect(call?.[0]).toBe('http://localhost:8080/api/travels/travel-1');
    expect(call?.[1]?.method).toBe('PUT');
    expect(JSON.parse(call?.[1]?.body as string)).toMatchObject({
      title: '교체된 제주',
      confirmDeleteDays: true,
      travelDays: [{ id: 'day-1', date: '2025-06-01' }],
    });
  });

  it('deleteTravel: DELETEs /travels/:id', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(makeVoidResponse());

    const client = createApiClient({
      fetchFn,
      getBaseUrl: () => 'http://localhost:8080/api',
      getAccessToken: () => 'token-123',
    });
    const api = createTravelApi(client);

    await api.deleteTravel('travel-1');

    const call = fetchFn.mock.calls[0];
    expect(call?.[0]).toBe('http://localhost:8080/api/travels/travel-1');
    expect(call?.[1]?.method).toBe('DELETE');
  });

  it('updateTravelDay: PATCHes /travels/:id/days/:dayId and maps the day', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        makeJsonResponse({ ...validDay, title: '업데이트된 1일차' })
      );

    const client = createApiClient({
      fetchFn,
      getBaseUrl: () => 'http://localhost:8080/api',
      getAccessToken: () => 'token-123',
    });
    const api = createTravelApi(client);

    const day = await api.updateTravelDay('travel-1', 'day-1', {
      date: '2025-06-01',
      title: '업데이트된 1일차',
      sortOrder: 0,
      photos: [],
      places: [],
    });

    expect(day.id).toBe('day-1');
    expect(day.displayDate).toBe('2025.06.01');
    const call = fetchFn.mock.calls[0];
    expect(call?.[0]).toBe(
      'http://localhost:8080/api/travels/travel-1/days/day-1'
    );
    expect(call?.[1]?.method).toBe('PATCH');
  });

  it('createTravelPlace: POSTs to /travels/:id/days/:dayId/places and maps place', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(makeJsonResponse(validPlace));

    const client = createApiClient({
      fetchFn,
      getBaseUrl: () => 'http://localhost:8080/api',
      getAccessToken: () => 'token-123',
    });
    const api = createTravelApi(client);

    const place = await api.createTravelPlace('travel-1', 'day-1', {
      travelDayId: 'day-1',
      name: '한라산',
    });

    expect(place.id).toBe('place-1');
    expect(place.name).toBe('한라산');
    const call = fetchFn.mock.calls[0];
    expect(call?.[0]).toBe(
      'http://localhost:8080/api/travels/travel-1/days/day-1/places'
    );
    expect(call?.[1]?.method).toBe('POST');
  });

  it('updateTravelPlace: PATCHes /travels/:id/days/:dayId/places/:placeId', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        makeJsonResponse({ ...validPlace, name: '백록담' })
      );

    const client = createApiClient({
      fetchFn,
      getBaseUrl: () => 'http://localhost:8080/api',
      getAccessToken: () => 'token-123',
    });
    const api = createTravelApi(client);

    const place = await api.updateTravelPlace('travel-1', 'day-1', 'place-1', {
      name: '백록담',
      category: 'TOURIST_SPOT',
      sortOrder: 0,
      photos: [],
    });

    expect(place.name).toBe('백록담');
    const call = fetchFn.mock.calls[0];
    expect(call?.[0]).toBe(
      'http://localhost:8080/api/travels/travel-1/days/day-1/places/place-1'
    );
    expect(call?.[1]?.method).toBe('PATCH');
  });

  it('deleteTravelPlace: DELETEs /travels/:id/days/:dayId/places/:placeId', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(makeVoidResponse());

    const client = createApiClient({
      fetchFn,
      getBaseUrl: () => 'http://localhost:8080/api',
      getAccessToken: () => 'token-123',
    });
    const api = createTravelApi(client);

    await api.deleteTravelPlace('travel-1', 'day-1', 'place-1');

    const call = fetchFn.mock.calls[0];
    expect(call?.[0]).toBe(
      'http://localhost:8080/api/travels/travel-1/days/day-1/places/place-1'
    );
    expect(call?.[1]?.method).toBe('DELETE');
  });

  it('addTravelPhoto: POSTs to /travels/:id/photos and maps the photo', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(makeJsonResponse(validPhoto));

    const client = createApiClient({
      fetchFn,
      getBaseUrl: () => 'http://localhost:8080/api',
      getAccessToken: () => 'token-123',
    });
    const api = createTravelApi(client);

    const photo = await api.addTravelPhoto('travel-1', {
      photoFileId: 'file-1',
    });

    expect(photo.id).toBe('photo-1');
    const call = fetchFn.mock.calls[0];
    expect(call?.[0]).toBe('http://localhost:8080/api/travels/travel-1/photos');
    expect(call?.[1]?.method).toBe('POST');
  });

  it('deleteTravelPhoto: DELETEs /travels/:id/photos/:photoId', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(makeVoidResponse());

    const client = createApiClient({
      fetchFn,
      getBaseUrl: () => 'http://localhost:8080/api',
      getAccessToken: () => 'token-123',
    });
    const api = createTravelApi(client);

    await api.deleteTravelPhoto('travel-1', 'photo-1');

    const call = fetchFn.mock.calls[0];
    expect(call?.[0]).toBe(
      'http://localhost:8080/api/travels/travel-1/photos/photo-1'
    );
    expect(call?.[1]?.method).toBe('DELETE');
  });

  it('putTravelReview: PUTs /travels/:id/review with body and maps review', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(makeJsonResponse(validReviewRdo));

    const client = createApiClient({
      fetchFn,
      getBaseUrl: () => 'http://localhost:8080/api',
      getAccessToken: () => 'token-123',
    });
    const api = createTravelApi(client);

    const review = await api.putTravelReview('travel-1', {
      content: '좋았어요',
    });

    expect(review.id).toBe('review-1');
    expect(review.content).toBe('좋았어요');
    const call = fetchFn.mock.calls[0];
    expect(call?.[0]).toBe('http://localhost:8080/api/travels/travel-1/review');
    expect(call?.[1]?.method).toBe('PUT');
  });

  it('addTravelTag: POSTs to /travels/:id/tags and maps tag', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(makeJsonResponse(validTagRdo));

    const client = createApiClient({
      fetchFn,
      getBaseUrl: () => 'http://localhost:8080/api',
      getAccessToken: () => 'token-123',
    });
    const api = createTravelApi(client);

    const tag = await api.addTravelTag('travel-1', { name: '힐링' });

    expect(tag.id).toBe('tag-1');
    expect(tag.name).toBe('힐링');
    const call = fetchFn.mock.calls[0];
    expect(call?.[0]).toBe('http://localhost:8080/api/travels/travel-1/tags');
    expect(call?.[1]?.method).toBe('POST');
  });

  it('deleteTravelTag: DELETEs /travels/:id/tags/:tagId', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(makeVoidResponse());

    const client = createApiClient({
      fetchFn,
      getBaseUrl: () => 'http://localhost:8080/api',
      getAccessToken: () => 'token-123',
    });
    const api = createTravelApi(client);

    await api.deleteTravelTag('travel-1', 'tag-1');

    const call = fetchFn.mock.calls[0];
    expect(call?.[0]).toBe(
      'http://localhost:8080/api/travels/travel-1/tags/tag-1'
    );
    expect(call?.[1]?.method).toBe('DELETE');
  });

  it('rejects malformed travel list responses as INVALID_RESPONSE', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        makeJsonResponse([{ ...validTravelRdo, nights: 'four' }])
      );

    const api = createTravelApi(
      createApiClient({
        fetchFn,
        getBaseUrl: () => 'http://localhost:8080/api',
      })
    );

    await expect(api.getTravelList()).rejects.toMatchObject({
      name: 'AppError',
      code: 'INVALID_RESPONSE',
      message: 'Travel list response payload is invalid.',
    } satisfies Partial<AppError>);
  });

  it('rejects malformed travel detail responses as INVALID_RESPONSE', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        makeJsonResponse({ ...validDetailRdo, days: 'five' })
      );

    const api = createTravelApi(
      createApiClient({
        fetchFn,
        getBaseUrl: () => 'http://localhost:8080/api',
      })
    );

    await expect(api.getTravelDetail('travel-1')).rejects.toMatchObject({
      name: 'AppError',
      code: 'INVALID_RESPONSE',
      message: 'Travel detail response payload is invalid.',
    } satisfies Partial<AppError>);
  });
});

import { apiClient, type createApiClient } from '../../../lib/api/api-client';
import {
  mapTripDetailDto,
  mapTripListItemDto,
  mapTripQuizCheckDto,
  mapTripQuizDto,
} from '../mappers/trip-mappers';
import type {
  TripDetail,
  TripListItem,
  TripQuiz,
  TripQuizFeedback,
  TripRegisterPayload,
} from '../types';
import {
  parseTripDetailResponse,
  parseTripListResponse,
  parseTripQuizCheckResponse,
  parseTripQuizResponse,
  type TripDetailDto,
  type TripListItemDto,
  type TripQuizCheckDto,
  type TripQuizDto,
} from './trip-schemas';

type ApiClientLike = Pick<ReturnType<typeof createApiClient>, 'get' | 'post'>;

export function buildTripRegisterFormData(payload: TripRegisterPayload) {
  const formData = new FormData();
  const requestBlob = new Blob([JSON.stringify(payload.request)], {
    type: 'application/json',
  });

  formData.append('tripRegisterRequest', requestBlob);

  if (payload.files.logo) {
    formData.append('logo', payload.files.logo);
  }

  if (payload.files.map1) {
    formData.append('map1', payload.files.map1);
  }

  if (payload.files.map2) {
    formData.append('map2', payload.files.map2);
  }

  return formData;
}

export function createTripApi(client: ApiClientLike = apiClient) {
  return {
    async getTripList(): Promise<TripListItem[]> {
      const response = await client.get<TripListItemDto[]>({
        path: '/trip',
      });

      return parseTripListResponse(response).map(mapTripListItemDto);
    },
    async getTripDetail(id: string): Promise<TripDetail> {
      const response = await client.get<TripDetailDto>({
        path: `/trip/${encodeURIComponent(id)}`,
      });

      return mapTripDetailDto(parseTripDetailResponse(response, 'detail'));
    },
    async getTripQuiz(tripId: string): Promise<TripQuiz> {
      const response = await client.get<TripQuizDto>({
        path: `/trip/quiz/${encodeURIComponent(tripId)}`,
      });

      return mapTripQuizDto(parseTripQuizResponse(response));
    },
    async checkTripQuizAnswer(
      tripId: string,
      optionId: string
    ): Promise<TripQuizFeedback> {
      const response = await client.get<TripQuizCheckDto>({
        path: '/trip/quiz/check',
        query: {
          arg0: tripId,
          arg1: optionId,
        },
      });

      return mapTripQuizCheckDto(parseTripQuizCheckResponse(response));
    },
    async registerTrip(payload: TripRegisterPayload): Promise<TripDetail> {
      const response = await client.post<TripDetailDto>({
        path: '/trip',
        body: buildTripRegisterFormData(payload),
      });

      return mapTripDetailDto(parseTripDetailResponse(response, 'register'));
    },
  };
}

export const tripApi = createTripApi();

import { apiClient, type createApiClient } from '../../../lib/api/api-client';
import {
  mapTripDetailDto,
  mapTripListItemDto,
  mapTripQuizCheckDto,
  mapTripQuizDto,
} from '../mappers/trip-mappers';
import type {
  QuizRdo,
  QuizResultRdo,
  TripDetail,
  TripCdo,
  TripListItem,
  TripQuiz,
  TripQuizFeedback,
} from '../types';
import {
  parseTripDetailResponse,
  parseTripListResponse,
  parseTripQuizCheckResponse,
  parseTripQuizResponse,
  type TripDetailDto,
  type TripListItemDto,
} from './trip-schemas';

type ApiClientLike = Pick<ReturnType<typeof createApiClient>, 'get' | 'post'>;

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
      const response = await client.get<QuizRdo>({
        path: `/trip/quiz/${encodeURIComponent(tripId)}`,
      });

      return mapTripQuizDto(parseTripQuizResponse(response));
    },
    async checkTripQuizAnswer(
      tripId: string,
      optionId: string
    ): Promise<TripQuizFeedback> {
      const response = await client.get<QuizResultRdo>({
        path: '/trip/quiz/check',
        query: {
          arg0: tripId,
          arg1: optionId,
        },
      });

      return mapTripQuizCheckDto(parseTripQuizCheckResponse(response));
    },
    async registerTrip(payload: TripCdo): Promise<TripDetail> {
      const response = await client.post<TripDetailDto>({
        path: '/trip',
        body: payload,
      });

      return mapTripDetailDto(parseTripDetailResponse(response, 'register'));
    },
  };
}

export const tripApi = createTripApi();

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
  TripCdo,
  TripDetail,
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
        path: '/trips',
      });

      return parseTripListResponse(response).map(mapTripListItemDto);
    },
    async getTripDetail(id: string): Promise<TripDetail> {
      const response = await client.get<TripDetailDto>({
        path: `/trips/${encodeURIComponent(id)}`,
      });

      return mapTripDetailDto(parseTripDetailResponse(response, 'detail'));
    },
    async getTripQuiz(tripId: string): Promise<TripQuiz> {
      const response = await client.get<QuizRdo>({
        path: `/trips/quiz/${encodeURIComponent(tripId)}`,
      });

      return mapTripQuizDto(parseTripQuizResponse(response));
    },
    async checkTripQuizAnswer(
      tripId: string,
      optionId: string
    ): Promise<TripQuizFeedback> {
      const response = await client.get<QuizResultRdo>({
        path: '/trips/quiz/check',
        query: {
          tripId,
          optionId,
        },
      });

      return mapTripQuizCheckDto(parseTripQuizCheckResponse(response));
    },
    async registerTrip(payload: TripCdo): Promise<TripDetail> {
      const response = await client.post<TripDetailDto>({
        path: '/trips',
        body: payload,
      });

      return mapTripDetailDto(parseTripDetailResponse(response, 'register'));
    },
  };
}

export const tripApi = createTripApi();

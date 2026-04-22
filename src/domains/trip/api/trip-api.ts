import { apiClient, type createApiClient } from '../../../lib/api/api-client';
import { mapTripDetailDto, mapTripListItemDto } from '../mappers/trip-mappers';
import type { TripDetail, TripListItem, TripRegisterPayload } from '../types';
import {
  parseTripDetailResponse,
  parseTripListResponse,
  type TripDetailDto,
  type TripListItemDto,
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
    async getTripDetail(date: string): Promise<TripDetail> {
      const response = await client.get<TripDetailDto>({
        path: '/trip/detail',
        query: {
          tripDate: date,
        },
      });

      return mapTripDetailDto(parseTripDetailResponse(response, 'detail'));
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

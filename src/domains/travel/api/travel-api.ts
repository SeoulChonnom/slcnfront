import {
  parseTravelDetailResponse,
  parseTravelListResponse,
  type TravelDetailRdoDto,
} from '@/domains/travel/api/travel-schemas';
import {
  mapTravelDetailDto,
  mapTravelListItemDto,
} from '@/domains/travel/mappers/travel-mappers';
import type {
  TravelCdo,
  TravelDetail,
  TravelListItem,
  TravelUdo,
} from '@/domains/travel/types';
import { apiClient, type createApiClient } from '@/lib/api/api-client';

type ApiClientLike = Pick<
  ReturnType<typeof createApiClient>,
  'get' | 'post' | 'put' | 'delete'
>;

export function createTravelApi(client: ApiClientLike = apiClient) {
  return {
    async getTravelList(): Promise<TravelListItem[]> {
      const response = await client.get<unknown[]>({ path: '/travels' });
      return parseTravelListResponse(response).map(mapTravelListItemDto);
    },

    async getTravelDetail(id: string): Promise<TravelDetail> {
      const response = await client.get<TravelDetailRdoDto>({
        path: `/travels/${encodeURIComponent(id)}`,
      });
      return mapTravelDetailDto(parseTravelDetailResponse(response, 'detail'));
    },

    async createTravel(payload: TravelCdo): Promise<TravelDetail> {
      const response = await client.post<TravelDetailRdoDto>({
        path: '/travels',
        body: payload,
      });
      return mapTravelDetailDto(parseTravelDetailResponse(response, 'create'));
    },

    async updateTravel(id: string, payload: TravelUdo): Promise<TravelDetail> {
      const response = await client.put<TravelDetailRdoDto>({
        path: `/travels/${encodeURIComponent(id)}`,
        body: payload,
      });
      return mapTravelDetailDto(parseTravelDetailResponse(response, 'update'));
    },

    async putTravel(id: string, payload: TravelUdo): Promise<TravelDetail> {
      const response = await client.put<TravelDetailRdoDto>({
        path: `/travels/${encodeURIComponent(id)}`,
        body: payload,
      });
      return mapTravelDetailDto(parseTravelDetailResponse(response, 'update'));
    },

    async deleteTravel(id: string): Promise<void> {
      await client.delete<void>({
        path: `/travels/${encodeURIComponent(id)}`,
        responseType: 'void',
      });
    },
  };
}

export const travelApi = createTravelApi();

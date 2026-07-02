import { apiClient, type createApiClient } from '../../../lib/api/api-client';
import {
  mapTravelDetailDto,
  mapTravelListItemDto,
} from '../mappers/travel-mappers';
import type {
  TravelCdo,
  TravelDetail,
  TravelListItem,
  TravelUdo,
} from '../types';
import {
  parseTravelDetailResponse,
  parseTravelListResponse,
  type TravelDetailRdoDto,
} from './travel-schemas';

type ApiClientLike = Pick<
  ReturnType<typeof createApiClient>,
  'get' | 'post' | 'patch' | 'put' | 'delete'
>;

export function createTravelApi(client: ApiClientLike = apiClient) {
  return {
    // ── Travel CRUD ───────────────────────────────────────────────────────────

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
      const response = await client.patch<TravelDetailRdoDto>({
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

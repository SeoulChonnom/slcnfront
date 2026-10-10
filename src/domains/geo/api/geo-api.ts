import {
  type AddressSearchResult,
  parseAddressSearchResponse,
  parseWalkingRouteResponse,
  type WalkingRoute,
} from '@/domains/geo/api/geo-schemas';
import { apiClient, type createApiClient } from '@/lib/api/api-client';

type ApiClientLike = Pick<ReturnType<typeof createApiClient>, 'get' | 'post'>;

export type AddressSearchParams = {
  keyword: string;
  page?: number;
  size?: number;
};

function createGeoApi(client: ApiClientLike = apiClient) {
  return {
    /** api.md §8-2 — 행안부 도로명주소 검색 프록시. 아무것도 저장하지 않는다. */
    async searchAddresses(
      params: AddressSearchParams
    ): Promise<AddressSearchResult> {
      const response = await client.get<unknown>({
        path: '/geo/addresses',
        query: {
          keyword: params.keyword,
          page: params.page,
          size: params.size,
        },
      });
      return parseAddressSearchResponse(response);
    },

    /** api.md §8-3 — 외부 유료 호출. 버튼을 눌렀을 때만 부르고 서버는 저장하지 않는다. */
    async fetchWalkingRoute(visitId: string): Promise<WalkingRoute> {
      const response = await client.post<unknown>({
        path: `/inspection-visits/${encodeURIComponent(visitId)}/walking-route`,
      });
      return parseWalkingRouteResponse(response);
    },
  };
}

const geoApi = createGeoApi();

export function searchAddresses(params: AddressSearchParams) {
  return geoApi.searchAddresses(params);
}

export function fetchWalkingRoute(visitId: string) {
  return geoApi.fetchWalkingRoute(visitId);
}

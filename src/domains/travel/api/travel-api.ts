import { apiClient, type createApiClient } from '../../../lib/api/api-client';
import {
  mapTravelDayDto,
  mapTravelDetailDto,
  mapTravelListItemDto,
  mapTravelPhotoDto,
  mapTravelPlaceDto,
  mapTravelReviewDto,
  mapTravelTagDto,
} from '../mappers/travel-mappers';
import type {
  TravelCdo,
  TravelDay,
  TravelDayUdo,
  TravelDetail,
  TravelListItem,
  TravelPhoto,
  TravelPhotoCdo,
  TravelPlace,
  TravelPlaceCdo,
  TravelPlaceUdo,
  TravelReview,
  TravelReviewUdo,
  TravelTag,
  TravelTagCdo,
  TravelUdo,
} from '../types';
import {
  parseTravelDayRdoResponse,
  parseTravelDetailResponse,
  parseTravelListResponse,
  parseTravelPhotoListResponse,
  parseTravelPlaceRdoResponse,
  parseTravelReviewRdoResponse,
  parseTravelTagRdoResponse,
  type TravelDetailRdoDto,
  type TravelPhotoRdoDto,
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

    // ── Travel Day ────────────────────────────────────────────────────────────

    async updateTravelDay(
      travelId: string,
      travelDayId: string,
      payload: TravelDayUdo
    ): Promise<TravelDay> {
      const response = await client.patch({
        path: `/travels/${encodeURIComponent(travelId)}/days/${encodeURIComponent(travelDayId)}`,
        body: payload,
      });
      return mapTravelDayDto(parseTravelDayRdoResponse(response));
    },

    // ── Travel Place ──────────────────────────────────────────────────────────

    async createTravelPlace(
      travelId: string,
      travelDayId: string,
      payload: TravelPlaceCdo
    ): Promise<TravelPlace> {
      const response = await client.post({
        path: `/travels/${encodeURIComponent(travelId)}/days/${encodeURIComponent(travelDayId)}/places`,
        body: payload,
      });
      return mapTravelPlaceDto(parseTravelPlaceRdoResponse(response));
    },

    async updateTravelPlace(
      travelId: string,
      travelDayId: string,
      placeId: string,
      payload: TravelPlaceUdo
    ): Promise<TravelPlace> {
      const response = await client.patch({
        path: `/travels/${encodeURIComponent(travelId)}/days/${encodeURIComponent(travelDayId)}/places/${encodeURIComponent(placeId)}`,
        body: payload,
      });
      return mapTravelPlaceDto(parseTravelPlaceRdoResponse(response));
    },

    async deleteTravelPlace(
      travelId: string,
      travelDayId: string,
      placeId: string
    ): Promise<void> {
      await client.delete<void>({
        path: `/travels/${encodeURIComponent(travelId)}/days/${encodeURIComponent(travelDayId)}/places/${encodeURIComponent(placeId)}`,
        responseType: 'void',
      });
    },

    // ── Travel Photos (travel-level) ──────────────────────────────────────────

    async getTravelPhotos(travelId: string): Promise<TravelPhoto[]> {
      const response = await client.get<TravelPhotoRdoDto[]>({
        path: `/travels/${encodeURIComponent(travelId)}/photos`,
      });
      return parseTravelPhotoListResponse(response).map(mapTravelPhotoDto);
    },

    async addTravelPhoto(
      travelId: string,
      payload: TravelPhotoCdo
    ): Promise<TravelPhoto> {
      const response = await client.post({
        path: `/travels/${encodeURIComponent(travelId)}/photos`,
        body: payload,
      });
      const parsed = parseTravelPhotoListResponse([response]);
      return mapTravelPhotoDto(parsed[0]);
    },

    async deleteTravelPhoto(travelId: string, photoId: string): Promise<void> {
      await client.delete<void>({
        path: `/travels/${encodeURIComponent(travelId)}/photos/${encodeURIComponent(photoId)}`,
        responseType: 'void',
      });
    },

    // ── Day photos ────────────────────────────────────────────────────────────

    async getDayPhotos(
      travelId: string,
      travelDayId: string
    ): Promise<TravelPhoto[]> {
      const response = await client.get<TravelPhotoRdoDto[]>({
        path: `/travels/${encodeURIComponent(travelId)}/days/${encodeURIComponent(travelDayId)}/photos`,
      });
      return parseTravelPhotoListResponse(response).map(mapTravelPhotoDto);
    },

    // ── Place photos ──────────────────────────────────────────────────────────

    async getPlacePhotos(
      travelId: string,
      travelDayId: string,
      placeId: string
    ): Promise<TravelPhoto[]> {
      const response = await client.get<TravelPhotoRdoDto[]>({
        path: `/travels/${encodeURIComponent(travelId)}/days/${encodeURIComponent(travelDayId)}/places/${encodeURIComponent(placeId)}/photos`,
      });
      return parseTravelPhotoListResponse(response).map(mapTravelPhotoDto);
    },

    // ── Review ────────────────────────────────────────────────────────────────

    async putTravelReview(
      travelId: string,
      payload: TravelReviewUdo
    ): Promise<TravelReview> {
      const response = await client.put({
        path: `/travels/${encodeURIComponent(travelId)}/review`,
        body: payload,
      });
      return mapTravelReviewDto(parseTravelReviewRdoResponse(response));
    },

    // ── Tags ──────────────────────────────────────────────────────────────────

    async addTravelTag(
      travelId: string,
      payload: TravelTagCdo
    ): Promise<TravelTag> {
      const response = await client.post({
        path: `/travels/${encodeURIComponent(travelId)}/tags`,
        body: payload,
      });
      return mapTravelTagDto(parseTravelTagRdoResponse(response));
    },

    async deleteTravelTag(travelId: string, tagId: string): Promise<void> {
      await client.delete<void>({
        path: `/travels/${encodeURIComponent(travelId)}/tags/${encodeURIComponent(tagId)}`,
        responseType: 'void',
      });
    },
  };
}

export const travelApi = createTravelApi();

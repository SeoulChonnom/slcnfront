import {
  parseAreaViewedPropertyListResponse,
  parseComplexNameListResponse,
  parseInspectionAreaDetailResponse,
  parseInspectionAreaListResponse,
  parseInspectionAreaResponse,
  parseInspectionQuestionListResponse,
  parseInspectionQuestionResponse,
  parseInspectionQuestionVersionListResponse,
  parseInspectionTagListResponse,
  parseInspectionVisitDetailResponse,
  parseInspectionVisitListResponse,
  parseViewedPropertyDetailResponse,
} from '@/domains/inspection/api/inspection-schemas';
import {
  mapAreaViewedPropertyDto,
  mapInspectionAreaDto,
  mapInspectionAreaListResponse,
  mapInspectionQuestionDto,
  mapInspectionQuestionVersionDto,
  mapInspectionTagDto,
  mapInspectionVisitDetailDto,
  mapInspectionVisitListResponse,
  mapInspectionVisitSummaryDto,
  mapViewedPropertyDetailDto,
} from '@/domains/inspection/mappers/inspection-mappers';
import type {
  AreaViewedProperty,
  ComplexNameScope,
  InspectionArea,
  InspectionAreaCdo,
  InspectionAreaDetail,
  InspectionAreaListParams,
  InspectionAreaListResult,
  InspectionAreaUdo,
  InspectionQuestion,
  InspectionQuestionCdo,
  InspectionQuestionContentUdo,
  InspectionQuestionPolicyUdo,
  InspectionQuestionVersion,
  InspectionStatus,
  InspectionTag,
  InspectionVisitCdo,
  InspectionVisitDetail,
  InspectionVisitListParams,
  InspectionVisitListResult,
  InspectionVisitUdo,
  OrderItem,
  PropertyAnswerPayload,
  TagScope,
  ViewedPropertyCdo,
  ViewedPropertyDetail,
  ViewedPropertyUdo,
} from '@/domains/inspection/types';
import { apiClient, type createApiClient } from '@/lib/api/api-client';

type ApiClientLike = Pick<
  ReturnType<typeof createApiClient>,
  'get' | 'post' | 'put' | 'patch' | 'delete'
>;

function createInspectionApi(client: ApiClientLike = apiClient) {
  return {
    // ── Areas ───────────────────────────────────────────────────────────────

    async getAreaList(
      params: InspectionAreaListParams = {}
    ): Promise<InspectionAreaListResult> {
      const response = await client.get<unknown>({
        path: '/inspection-areas',
        query: {
          keyword: params.keyword,
          revisitIntent: params.revisitIntent,
          sort: params.sort,
          page: params.page,
          size: params.size,
        },
      });
      return mapInspectionAreaListResponse(
        parseInspectionAreaListResponse(response)
      );
    },

    async getAreaDetail(
      areaId: string,
      params: { visitId?: string; includeProperties?: boolean } = {}
    ): Promise<InspectionAreaDetail> {
      const response = await client.get<unknown>({
        path: `/inspection-areas/${encodeURIComponent(areaId)}`,
        query: {
          visitId: params.visitId,
          includeProperties: params.includeProperties,
        },
      });
      const dto = parseInspectionAreaDetailResponse(response);
      return {
        area: mapInspectionAreaDto(dto.area),
        visits: dto.visits.map(mapInspectionVisitSummaryDto),
        hasMoreVisits: dto.hasMoreVisits,
        visitPageSize: dto.visitPageSize,
        selectedVisit: dto.selectedVisit
          ? mapInspectionVisitDetailDto(dto.selectedVisit)
          : null,
      };
    },

    async getAreaProperties(
      areaId: string,
      complexName: string,
      name: string
    ): Promise<AreaViewedProperty[]> {
      const response = await client.get<unknown>({
        path: `/inspection-areas/${encodeURIComponent(areaId)}/properties`,
        query: { complexName, name },
      });
      return parseAreaViewedPropertyListResponse(response).map(
        mapAreaViewedPropertyDto
      );
    },

    async createArea(payload: InspectionAreaCdo): Promise<InspectionArea> {
      const response = await client.post<unknown>({
        path: '/inspection-areas',
        body: payload,
      });
      return mapInspectionAreaDto(
        parseInspectionAreaResponse(response, 'create')
      );
    },

    async updateArea(
      areaId: string,
      payload: InspectionAreaUdo
    ): Promise<InspectionArea> {
      const response = await client.put<unknown>({
        path: `/inspection-areas/${encodeURIComponent(areaId)}`,
        body: payload,
      });
      return mapInspectionAreaDto(
        parseInspectionAreaResponse(response, 'update')
      );
    },

    async deleteArea(areaId: string): Promise<void> {
      await client.delete<void>({
        path: `/inspection-areas/${encodeURIComponent(areaId)}`,
        responseType: 'void',
      });
    },

    // ── Properties ──────────────────────────────────────────────────────────

    async getProperty(propertyId: string): Promise<ViewedPropertyDetail> {
      const response = await client.get<unknown>({
        path: `/inspection-properties/${encodeURIComponent(propertyId)}`,
      });
      return mapViewedPropertyDetailDto(
        parseViewedPropertyDetailResponse(response, 'detail')
      );
    },

    async getVisitProperty(
      visitId: string,
      propertyId: string
    ): Promise<ViewedPropertyDetail> {
      const response = await client.get<unknown>({
        path: `/inspection-visits/${encodeURIComponent(visitId)}/properties/${encodeURIComponent(propertyId)}`,
      });
      return mapViewedPropertyDetailDto(
        parseViewedPropertyDetailResponse(response, 'detail')
      );
    },

    async createProperty(
      visitId: string,
      payload: ViewedPropertyCdo
    ): Promise<ViewedPropertyDetail> {
      const response = await client.post<unknown>({
        path: `/inspection-visits/${encodeURIComponent(visitId)}/properties`,
        body: payload,
      });
      return mapViewedPropertyDetailDto(
        parseViewedPropertyDetailResponse(response, 'create')
      );
    },

    async updateProperty(
      visitId: string,
      propertyId: string,
      payload: ViewedPropertyUdo
    ): Promise<ViewedPropertyDetail> {
      const response = await client.put<unknown>({
        path: `/inspection-visits/${encodeURIComponent(visitId)}/properties/${encodeURIComponent(propertyId)}`,
        body: payload,
      });
      return mapViewedPropertyDetailDto(
        parseViewedPropertyDetailResponse(response, 'update')
      );
    },

    async updatePropertyStatus(
      visitId: string,
      propertyId: string,
      status: InspectionStatus
    ): Promise<ViewedPropertyDetail> {
      const response = await client.patch<unknown>({
        path: `/inspection-visits/${encodeURIComponent(visitId)}/properties/${encodeURIComponent(propertyId)}/status`,
        body: { status },
      });
      return mapViewedPropertyDetailDto(
        parseViewedPropertyDetailResponse(response, 'status')
      );
    },

    async savePropertyAnswers(
      visitId: string,
      propertyId: string,
      answers: PropertyAnswerPayload[]
    ): Promise<ViewedPropertyDetail> {
      const response = await client.put<unknown>({
        path: `/inspection-visits/${encodeURIComponent(visitId)}/properties/${encodeURIComponent(propertyId)}/answers`,
        body: { answers },
      });
      return mapViewedPropertyDetailDto(
        parseViewedPropertyDetailResponse(response, 'answers')
      );
    },

    async deleteProperty(visitId: string, propertyId: string): Promise<void> {
      await client.delete<void>({
        path: `/inspection-visits/${encodeURIComponent(visitId)}/properties/${encodeURIComponent(propertyId)}`,
        responseType: 'void',
      });
    },

    async reorderVisitProperties(
      visitId: string,
      items: OrderItem[]
    ): Promise<void> {
      await client.put<void>({
        path: `/inspection-visits/${encodeURIComponent(visitId)}/properties/order`,
        body: items.map((item) => ({
          propertyId: item.id,
          sortOrder: item.sortOrder,
        })),
        responseType: 'void',
      });
    },

    async reorderVisitImages(
      visitId: string,
      items: OrderItem[]
    ): Promise<void> {
      await client.put<void>({
        path: `/inspection-visits/${encodeURIComponent(visitId)}/images/order`,
        body: items.map((item) => ({
          itemId: item.id,
          sortOrder: item.sortOrder,
        })),
        responseType: 'void',
      });
    },

    async getComplexNames(
      visitId: string,
      scope: ComplexNameScope = 'VISIT'
    ): Promise<string[]> {
      const response = await client.get<unknown>({
        path: `/inspection-visits/${encodeURIComponent(visitId)}/complex-names`,
        query: { scope },
      });
      return parseComplexNameListResponse(response);
    },

    // ── Visits ──────────────────────────────────────────────────────────────

    async getVisitList(
      params: InspectionVisitListParams = {}
    ): Promise<InspectionVisitListResult> {
      const response = await client.get<unknown>({
        path: '/inspection-visits',
        query: {
          areaId: params.areaId,
          status: params.status,
          revisitIntent: params.revisitIntent,
          // Multiple tags AND together. The endpoint binds `tag` to a
          // `List<String>`, and Spring splits a single comma-joined value
          // into that list on its own (verified against the real server —
          // `tag=a,b` behaves identically to repeating `tag=a&tag=b`), so a
          // single scalar param is enough; `apiClient` has no array support
          // to repeat the key with.
          tag:
            params.tag && params.tag.length > 0
              ? params.tag.join(',')
              : undefined,
          from: params.from,
          to: params.to,
          page: params.page,
          size: params.size,
        },
      });
      return mapInspectionVisitListResponse(
        parseInspectionVisitListResponse(response)
      );
    },

    async getVisit(visitId: string): Promise<InspectionVisitDetail> {
      const response = await client.get<unknown>({
        path: `/inspection-visits/${encodeURIComponent(visitId)}`,
      });
      return mapInspectionVisitDetailDto(
        parseInspectionVisitDetailResponse(response, 'detail')
      );
    },

    async createVisit(
      payload: InspectionVisitCdo
    ): Promise<InspectionVisitDetail> {
      const response = await client.post<unknown>({
        path: '/inspection-visits',
        body: payload,
      });
      return mapInspectionVisitDetailDto(
        parseInspectionVisitDetailResponse(response, 'create')
      );
    },

    async updateVisit(
      visitId: string,
      payload: InspectionVisitUdo
    ): Promise<InspectionVisitDetail> {
      const response = await client.put<unknown>({
        path: `/inspection-visits/${encodeURIComponent(visitId)}`,
        body: payload,
      });
      return mapInspectionVisitDetailDto(
        parseInspectionVisitDetailResponse(response, 'update')
      );
    },

    async updateVisitStatus(
      visitId: string,
      status: InspectionStatus
    ): Promise<InspectionVisitDetail> {
      const response = await client.patch<unknown>({
        path: `/inspection-visits/${encodeURIComponent(visitId)}/status`,
        body: { status },
      });
      return mapInspectionVisitDetailDto(
        parseInspectionVisitDetailResponse(response, 'status')
      );
    },

    async deleteVisit(visitId: string): Promise<void> {
      await client.delete<void>({
        path: `/inspection-visits/${encodeURIComponent(visitId)}`,
        responseType: 'void',
      });
    },

    // ── Tags ────────────────────────────────────────────────────────────────

    async getTags(
      params: { keyword?: string; scope?: TagScope } = {}
    ): Promise<InspectionTag[]> {
      const response = await client.get<unknown>({
        path: '/inspection-tags',
        query: { keyword: params.keyword, scope: params.scope },
      });
      return parseInspectionTagListResponse(response).map(mapInspectionTagDto);
    },

    // ── Questions (admin) ───────────────────────────────────────────────────

    async getQuestions(
      params: { includeDisabled?: boolean; withAnswerCount?: boolean } = {}
    ): Promise<InspectionQuestion[]> {
      const response = await client.get<unknown>({
        path: '/inspection-questions',
        query: {
          includeDisabled: params.includeDisabled,
          withAnswerCount: params.withAnswerCount,
        },
      });
      return parseInspectionQuestionListResponse(response).map(
        mapInspectionQuestionDto
      );
    },

    async getQuestionVersions(
      questionId: string
    ): Promise<InspectionQuestionVersion[]> {
      const response = await client.get<unknown>({
        path: `/inspection-questions/${encodeURIComponent(questionId)}/versions`,
      });
      return parseInspectionQuestionVersionListResponse(response).map(
        mapInspectionQuestionVersionDto
      );
    },

    async createQuestion(
      payload: InspectionQuestionCdo
    ): Promise<InspectionQuestion> {
      const response = await client.post<unknown>({
        path: '/inspection-questions',
        body: payload,
      });
      return mapInspectionQuestionDto(
        parseInspectionQuestionResponse(response, 'create')
      );
    },

    async updateQuestionContent(
      questionId: string,
      payload: InspectionQuestionContentUdo
    ): Promise<InspectionQuestion> {
      const response = await client.put<unknown>({
        path: `/inspection-questions/${encodeURIComponent(questionId)}`,
        body: payload,
      });
      return mapInspectionQuestionDto(
        parseInspectionQuestionResponse(response, 'update')
      );
    },

    async updateQuestionPolicy(
      questionId: string,
      payload: InspectionQuestionPolicyUdo
    ): Promise<InspectionQuestion> {
      const response = await client.patch<unknown>({
        path: `/inspection-questions/${encodeURIComponent(questionId)}/policy`,
        body: payload,
      });
      return mapInspectionQuestionDto(
        parseInspectionQuestionResponse(response, 'policy')
      );
    },

    async updateQuestionStatus(
      questionId: string,
      enabled: boolean
    ): Promise<InspectionQuestion> {
      const response = await client.patch<unknown>({
        path: `/inspection-questions/${encodeURIComponent(questionId)}/status`,
        body: { enabled },
      });
      return mapInspectionQuestionDto(
        parseInspectionQuestionResponse(response, 'status')
      );
    },

    async reorderQuestions(items: OrderItem[]): Promise<void> {
      await client.put<void>({
        path: '/inspection-questions/order',
        body: items.map((item) => ({
          questionId: item.id,
          sortOrder: item.sortOrder,
        })),
        responseType: 'void',
      });
    },
  };
}

export const inspectionApi = createInspectionApi();

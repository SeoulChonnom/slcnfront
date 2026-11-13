import {
  budgetPolicySchema,
  compareSchema,
  complexDetailSchema,
  complexesSchema,
  complexSearchSchema,
  complexSummarySchema,
  houseMetaSchema,
  rankingsSchema,
} from '@/domains/house/api/house-schemas';
import type {
  AreaBucket,
  CompareItem,
  ComplexesParams,
  RankingType,
  SummaryParams,
} from '@/domains/house/types';
import { toCompareApiItems } from '@/domains/house/utils/compare-param';
import { apiClient, type createApiClient } from '@/lib/api/api-client';
import { parseOrThrow } from '@/lib/api/errors';

type ApiClientLike = Pick<ReturnType<typeof createApiClient>, 'get'>;

export function createHouseApi(client: ApiClientLike = apiClient) {
  return {
    async getBudgetPolicy(signal?: AbortSignal) {
      return parseOrThrow(
        budgetPolicySchema,
        await client.get({ path: '/house/budget-policy', signal }),
        'House budget policy'
      );
    },
    async getMeta(signal?: AbortSignal) {
      return parseOrThrow(
        houseMetaSchema,
        await client.get({ path: '/house/meta', signal }),
        'House meta'
      );
    },
    async getComplexes(params: ComplexesParams, signal?: AbortSignal) {
      return parseOrThrow(
        complexesSchema,
        await client.get({ path: '/house/complexes', query: params, signal }),
        'House complexes'
      );
    },
    async getSummary(params: SummaryParams, signal?: AbortSignal) {
      return parseOrThrow(
        complexSummarySchema,
        await client.get({
          path: '/house/complexes/summary',
          query: params,
          signal,
        }),
        'House summary'
      );
    },
    async searchComplexes(keyword: string, signal?: AbortSignal) {
      return parseOrThrow(
        complexSearchSchema,
        await client.get({
          path: '/house/complexes/search',
          query: { keyword: keyword.trim(), size: 10 },
          signal,
        }),
        'House search'
      );
    },
    async getComplexDetail(
      complexId: string,
      area: AreaBucket,
      signal?: AbortSignal
    ) {
      return parseOrThrow(
        complexDetailSchema,
        await client.get({
          path: `/house/complexes/${encodeURIComponent(complexId)}`,
          query: { area },
          signal,
        }),
        'House complex detail'
      );
    },
    async getCompare(items: CompareItem[], signal?: AbortSignal) {
      return parseOrThrow(
        compareSchema,
        await client.get({
          path: '/house/compare',
          query: { items: toCompareApiItems(items) },
          signal,
        }),
        'House comparison'
      );
    },
    async getRankings(
      type: RankingType,
      area: AreaBucket,
      signal?: AbortSignal
    ) {
      return parseOrThrow(
        rankingsSchema,
        await client.get({
          path: '/house/rankings',
          query: { type, area },
          signal,
        }),
        'House rankings'
      );
    },
  };
}

export const houseApi = createHouseApi();

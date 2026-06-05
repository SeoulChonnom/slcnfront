import { apiClient, type createApiClient } from '../../../lib/api/api-client';
import {
  mapScheduleEventDto,
  type ScheduleEvent,
  type ScheduleMutationPayload,
  type ScheduleRangeQuery,
} from '../types';
import {
  parseScheduleListResponse,
  parseScheduleResponse,
  type ScheduleEventDto,
} from './calendar-schemas';

type ApiClientLike = Pick<
  ReturnType<typeof createApiClient>,
  'delete' | 'get' | 'patch' | 'post' | 'put'
>;

export function createScheduleApi(client: ApiClientLike = apiClient) {
  return {
    async getCurrentSchedules(): Promise<ScheduleEvent[]> {
      const response = await client.get<ScheduleEventDto[]>({
        path: '/schedule/now',
      });

      return parseScheduleListResponse(response, 'current').map(
        mapScheduleEventDto
      );
    },
    async getSchedulesInRange(
      query: ScheduleRangeQuery
    ): Promise<ScheduleEvent[]> {
      const response = await client.get<ScheduleEventDto[]>({
        path: '/schedule',
        query,
      });

      return parseScheduleListResponse(response, 'range').map(
        mapScheduleEventDto
      );
    },
    async createSchedule(
      payload: ScheduleMutationPayload
    ): Promise<ScheduleEvent> {
      const response = await client.post<ScheduleEventDto>({
        path: '/schedule',
        body: payload,
      });

      return mapScheduleEventDto(parseScheduleResponse(response, 'create'));
    },
    async updateSchedule(
      payload: ScheduleMutationPayload
    ): Promise<ScheduleEvent> {
      const response = await client.put<ScheduleEventDto>({
        path: '/schedule',
        body: payload,
      });

      return mapScheduleEventDto(parseScheduleResponse(response, 'update'));
    },
    async deleteSchedule(id: string) {
      await client.delete<void>({
        path: `/schedule/${encodeURIComponent(id)}`,
        responseType: 'void',
      });
    },
    async hideSchedule(id: string) {
      await client.patch<void>({
        path: `/schedule/${encodeURIComponent(id)}/hide`,
        responseType: 'void',
      });
    },
  };
}

export const scheduleApi = createScheduleApi();

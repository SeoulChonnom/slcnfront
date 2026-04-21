import { apiClient, type createApiClient } from '../../../lib/api/api-client';
import {
  mapScheduleEventDto,
  type ScheduleEvent,
  type ScheduleEventDto,
  type ScheduleMutationPayload,
  type ScheduleRangeQuery,
} from '../types';

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

      return response.map(mapScheduleEventDto);
    },
    async getSchedulesInRange(
      query: ScheduleRangeQuery
    ): Promise<ScheduleEvent[]> {
      const response = await client.get<ScheduleEventDto[]>({
        path: '/schedule',
        query,
      });

      return response.map(mapScheduleEventDto);
    },
    async createSchedule(
      payload: ScheduleMutationPayload
    ): Promise<ScheduleEvent> {
      const response = await client.post<ScheduleEventDto>({
        path: '/schedule',
        body: payload,
      });

      return mapScheduleEventDto(response);
    },
    async updateSchedule(
      payload: ScheduleMutationPayload
    ): Promise<ScheduleEvent> {
      const response = await client.put<ScheduleEventDto>({
        path: '/schedule',
        body: payload,
      });

      return mapScheduleEventDto(response);
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

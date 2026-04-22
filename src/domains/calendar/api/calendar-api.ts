import { apiClient, type createApiClient } from '../../../lib/api/api-client';
import {
  mapCalendarMetaDto,
  type CalendarCreatePayload,
  type CalendarMeta,
  type CalendarUpdatePayload,
} from '../types';
import {
  parseCalendarListResponse,
  parseCalendarResponse,
  type CalendarMetaDto,
} from './calendar-schemas';

type ApiClientLike = Pick<
  ReturnType<typeof createApiClient>,
  'delete' | 'get' | 'post' | 'put'
>;

export function createCalendarApi(client: ApiClientLike = apiClient) {
  return {
    async getCalendars(): Promise<CalendarMeta[]> {
      const response = await client.get<CalendarMetaDto[]>({
        path: '/calendar',
      });

      return parseCalendarListResponse(response)
        .map(mapCalendarMetaDto)
        .toSorted((left, right) => left.sortOrder - right.sortOrder);
    },
    async createCalendar(
      payload: CalendarCreatePayload
    ): Promise<CalendarMeta> {
      const response = await client.post<CalendarMetaDto>({
        path: '/calendar',
        body: payload,
      });

      return mapCalendarMetaDto(parseCalendarResponse(response, 'create'));
    },
    async updateCalendar(
      payload: CalendarUpdatePayload
    ): Promise<CalendarMeta> {
      const response = await client.put<CalendarMetaDto>({
        path: '/calendar',
        body: payload,
      });

      return mapCalendarMetaDto(parseCalendarResponse(response, 'update'));
    },
    async deleteCalendar(id: string) {
      await client.delete<void>({
        path: `/calendar/${encodeURIComponent(id)}`,
        responseType: 'void',
      });
    },
  };
}

export const calendarApi = createCalendarApi();

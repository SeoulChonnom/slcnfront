import {
  type CalendarMetaDto,
  parseCalendarListResponse,
  parseCalendarResponse,
} from '@/domains/calendar/api/calendar-schemas';
import {
  type CalendarCreatePayload,
  type CalendarMeta,
  type CalendarUpdatePayload,
  mapCalendarMetaDto,
} from '@/domains/calendar/types';
import { apiClient, type createApiClient } from '@/lib/api/api-client';

type ApiClientLike = Pick<
  ReturnType<typeof createApiClient>,
  'delete' | 'get' | 'post' | 'put'
>;

export function createCalendarApi(client: ApiClientLike = apiClient) {
  return {
    async getCalendars(): Promise<CalendarMeta[]> {
      const response = await client.get<CalendarMetaDto[]>({
        path: '/calendars',
      });

      return parseCalendarListResponse(response)
        .map(mapCalendarMetaDto)
        .toSorted((left, right) => left.sortOrder - right.sortOrder);
    },
    async createCalendar(
      payload: CalendarCreatePayload
    ): Promise<CalendarMeta> {
      const response = await client.post<CalendarMetaDto>({
        path: '/calendars',
        body: payload,
      });

      return mapCalendarMetaDto(parseCalendarResponse(response, 'create'));
    },
    async updateCalendar(
      payload: CalendarUpdatePayload
    ): Promise<CalendarMeta> {
      const response = await client.put<CalendarMetaDto>({
        path: '/calendars',
        body: payload,
      });

      return mapCalendarMetaDto(parseCalendarResponse(response, 'update'));
    },
    async deleteCalendar(id: string) {
      await client.delete<void>({
        path: `/calendars/${encodeURIComponent(id)}`,
        responseType: 'void',
      });
    },
  };
}

export const calendarApi = createCalendarApi();

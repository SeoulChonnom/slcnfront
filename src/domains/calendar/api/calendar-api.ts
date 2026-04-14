import { apiClient, type createApiClient } from '../../../lib/api/api-client';
import {
  mapCalendarMetaDto,
  type CalendarMeta,
  type CalendarMetaDto,
} from '../types';

type ApiClientLike = Pick<ReturnType<typeof createApiClient>, 'get'>;

export function createCalendarApi(client: ApiClientLike = apiClient) {
  return {
    async getCalendars(): Promise<CalendarMeta[]> {
      const response = await client.get<CalendarMetaDto[]>({
        path: '/calendar',
      });

      return response
        .map(mapCalendarMetaDto)
        .toSorted((left, right) => left.sortOrder - right.sortOrder);
    },
  };
}

export const calendarApi = createCalendarApi();

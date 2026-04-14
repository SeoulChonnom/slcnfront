import { describe, expect, it, vi } from 'vitest';
import { createApiClient } from '../../../lib/api/api-client';
import { createCalendarApi } from './calendar-api';

describe('calendar-api', () => {
  it('loads and sorts calendars', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: 'cal-2',
            name: '일권',
            backgroundColor: '#111111',
            borderColor: '#111111',
            textColor: '#ffffff',
            visible: true,
            editable: true,
            startEditable: true,
            durationEditable: true,
            defaultSelected: false,
            sortOrder: 2,
          },
          {
            id: 'cal-1',
            name: '아영',
            backgroundColor: '#fe9fc8',
            borderColor: '#fe9fc8',
            textColor: '#111111',
            visible: true,
            editable: true,
            startEditable: true,
            durationEditable: true,
            defaultSelected: true,
            sortOrder: 1,
          },
        ]),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );
    const client = createApiClient({
      fetchFn,
      getBaseUrl: () => 'http://localhost:8080/api',
      getAccessToken: () => 'token-123',
    });
    const calendarApi = createCalendarApi(client);

    const result = await calendarApi.getCalendars();

    expect(result.map((calendar) => calendar.id)).toEqual(['cal-1', 'cal-2']);
    expect(fetchFn.mock.calls[0]?.[0]).toBe('http://localhost:8080/api/calendar');
  });
});

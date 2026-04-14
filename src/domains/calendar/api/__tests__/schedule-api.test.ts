import { describe, expect, it, vi } from 'vitest';
import { createApiClient } from '../../../../lib/api/api-client';
import { createScheduleApi } from '../schedule-api';

describe('schedule-api', () => {
  it('calls range, current, create, update, hide and delete endpoints correctly', async () => {
    const eventBody = {
      id: 'schedule-1',
      calendarId: 'cal-1',
      title: '봄 산책',
      body: '석촌호수',
      start: '2026-04-10T10:00:00+09:00',
      end: '2026-04-10T12:00:00+09:00',
      allDay: false,
      location: 'Seoul',
    };
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify([eventBody]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify([eventBody]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(eventBody), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(eventBody), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const client = createApiClient({
      fetchFn,
      getBaseUrl: () => 'http://localhost:8080/api',
      getAccessToken: () => 'token-123',
    });
    const scheduleApi = createScheduleApi(client);
    const payload = {
      calendarId: 'cal-1',
      title: '봄 산책',
      body: '석촌호수',
      start: '2026-04-10T10:00:00+09:00',
      end: '2026-04-10T12:00:00+09:00',
      allDay: false,
      location: 'Seoul',
    };

    const rangeResult = await scheduleApi.getSchedulesInRange({
      start: '2026-04-01T00:00:00+09:00',
      end: '2026-05-01T00:00:00+09:00',
    });
    const currentResult = await scheduleApi.getCurrentSchedules();
    const createdResult = await scheduleApi.createSchedule(payload);
    const updatedResult = await scheduleApi.updateSchedule({
      ...payload,
      id: 'schedule-1',
    });
    await scheduleApi.hideSchedule('schedule-1');
    await scheduleApi.deleteSchedule('schedule-1');

    expect(rangeResult[0]?.allDay).toBe(false);
    expect(currentResult[0]?.title).toBe('봄 산책');
    expect(createdResult.id).toBe('schedule-1');
    expect(updatedResult.location).toBe('Seoul');
    expect(fetchFn.mock.calls[0]?.[0]).toBe(
      'http://localhost:8080/api/schedule?start=2026-04-01T00%3A00%3A00%2B09%3A00&end=2026-05-01T00%3A00%3A00%2B09%3A00',
    );
    expect(fetchFn.mock.calls[1]?.[0]).toBe(
      'http://localhost:8080/api/schedule/now',
    );
    expect(fetchFn.mock.calls[2]?.[1]?.method).toBe('POST');
    expect(fetchFn.mock.calls[3]?.[1]?.method).toBe('PUT');
    expect(fetchFn.mock.calls[4]?.[0]).toBe(
      'http://localhost:8080/api/schedule/schedule-1/hide',
    );
    expect(fetchFn.mock.calls[4]?.[1]?.method).toBe('PATCH');
    expect(fetchFn.mock.calls[5]?.[0]).toBe(
      'http://localhost:8080/api/schedule/schedule-1',
    );
  });
});

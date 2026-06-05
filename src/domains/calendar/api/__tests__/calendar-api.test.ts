import { describe, expect, it, vi } from 'vitest';
import { createApiClient } from '../../../../lib/api/api-client';
import type { AppError } from '../../../../lib/api/errors';
import { createCalendarApi } from '../calendar-api';

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
        }
      )
    );
    const client = createApiClient({
      fetchFn,
      getBaseUrl: () => 'http://localhost:8080/api',
      getAccessToken: () => 'token-123',
    });
    const calendarApi = createCalendarApi(client);

    const result = await calendarApi.getCalendars();

    expect(result.map((calendar) => calendar.id)).toEqual(['cal-1', 'cal-2']);
    expect(fetchFn.mock.calls[0]?.[0]).toBe(
      'http://localhost:8080/api/calendar'
    );
  });

  it('calls create, update and delete calendar endpoints correctly', async () => {
    const calendarBody = {
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
    };
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify(calendarBody), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(calendarBody), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(new Response(null, { status: 200 }));
    const client = createApiClient({
      fetchFn,
      getBaseUrl: () => 'http://localhost:8080/api',
      getAccessToken: () => 'token-123',
    });
    const calendarApi = createCalendarApi(client);

    await calendarApi.createCalendar({
      name: '아영',
      backgroundColor: '#fe9fc8',
      borderColor: '#fe9fc8',
      textColor: '#111111',
      editable: true,
      startEditable: true,
      durationEditable: true,
      defaultSelected: true,
      sortOrder: 1,
    });
    await calendarApi.updateCalendar({
      id: 'cal-1',
      name: '아영',
      backgroundColor: '#fe9fc8',
      borderColor: '#fe9fc8',
      textColor: '#111111',
      editable: true,
      startEditable: true,
      durationEditable: true,
      defaultSelected: true,
      sortOrder: 1,
    });
    await calendarApi.deleteCalendar('cal-1');

    expect(fetchFn.mock.calls[0]?.[1]?.method).toBe('POST');
    expect(fetchFn.mock.calls[1]?.[1]?.method).toBe('PUT');
    expect(fetchFn.mock.calls[2]?.[0]).toBe(
      'http://localhost:8080/api/calendar/cal-1'
    );
    expect(fetchFn.mock.calls[2]?.[1]?.method).toBe('DELETE');
  });

  it('rejects malformed calendar list payloads as INVALID_RESPONSE', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: 'cal-1',
            name: '아영',
            backgroundColor: '#fe9fc8',
            borderColor: '#fe9fc8',
            textColor: '#111111',
            visible: 'true',
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
        }
      )
    );
    const calendarApi = createCalendarApi(
      createApiClient({
        fetchFn,
        getBaseUrl: () => 'http://localhost:8080/api',
      })
    );

    await expect(calendarApi.getCalendars()).rejects.toMatchObject({
      name: 'AppError',
      code: 'INVALID_RESPONSE',
      message: 'Calendar list response payload is invalid.',
    } satisfies Partial<AppError>);
  });

  it('rejects malformed calendar create payloads as INVALID_RESPONSE', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
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
          sortOrder: '1',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );
    const calendarApi = createCalendarApi(
      createApiClient({
        fetchFn,
        getBaseUrl: () => 'http://localhost:8080/api',
      })
    );

    await expect(
      calendarApi.createCalendar({
        name: '아영',
        backgroundColor: '#fe9fc8',
        borderColor: '#fe9fc8',
        textColor: '#111111',
        editable: true,
        startEditable: true,
        durationEditable: true,
        defaultSelected: true,
        sortOrder: 1,
      })
    ).rejects.toMatchObject({
      name: 'AppError',
      code: 'INVALID_RESPONSE',
      message: 'Calendar create response payload is invalid.',
    } satisfies Partial<AppError>);
  });

  it('rejects malformed calendar update payloads as INVALID_RESPONSE', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'cal-1',
          name: '아영',
          backgroundColor: '#fe9fc8',
          borderColor: '#fe9fc8',
          textColor: '#111111',
          visible: true,
          editable: true,
          startEditable: true,
          durationEditable: 'true',
          defaultSelected: true,
          sortOrder: 1,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );
    const calendarApi = createCalendarApi(
      createApiClient({
        fetchFn,
        getBaseUrl: () => 'http://localhost:8080/api',
      })
    );

    await expect(
      calendarApi.updateCalendar({
        id: 'cal-1',
        name: '아영',
        backgroundColor: '#fe9fc8',
        borderColor: '#fe9fc8',
        textColor: '#111111',
        editable: true,
        startEditable: true,
        durationEditable: true,
        defaultSelected: true,
        sortOrder: 1,
      })
    ).rejects.toMatchObject({
      name: 'AppError',
      code: 'INVALID_RESPONSE',
      message: 'Calendar update response payload is invalid.',
    } satisfies Partial<AppError>);
  });
});

import type { ScheduleEvent } from '../calendar/types';
import type { TravelListItem } from '../travel/types';
import type { TripListItem } from '../trip/types';

/**
 * The home surface merges three sources into one chronological spine.
 * `sortKey` is digits-only (YYYYMMDD…) so trips, travels, and schedules can be
 * compared as strings regardless of which date format the API returned.
 */
type HomeTimelineBase = {
  id: string;
  sortKey: string;
  isoDate: string;
};

export type HomeTimelineEntry = HomeTimelineBase &
  (
    | { kind: 'schedule'; schedule: ScheduleEvent }
    | { kind: 'trip'; trip: TripListItem }
    | { kind: 'travel'; travel: TravelListItem }
  );

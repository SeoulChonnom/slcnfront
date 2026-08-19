import { Link } from 'react-router-dom';
import type { DeviceType } from '../../../app/router/route-constants';
import {
  buildDeviceCalendarMonthPath,
  buildDeviceTravelDetailPath,
  buildDeviceTripDetailPath,
} from '../../../lib/routing/route-builders';
import type { HomeTimelineEntry } from '../types';
import {
  formatRailDay,
  formatRailWeekday,
  formatRailYear,
  formatScheduleTime,
} from '../utils/home-dates';

type HomeTimelineRowProps = {
  entry: HomeTimelineEntry;
  device: DeviceType;
  /** Resolved object URL for the entry's image, when it has one. */
  imageUrl?: string | null;
};

function DateRail({ isoDate }: { isoDate: string }) {
  const year = formatRailYear(isoDate);
  // The year is noise on this year's records; it only earns its place once the
  // timeline reaches back past the current one.
  const showYear = year !== String(new Date().getFullYear());

  return (
    <div className='slcn-home-row__rail'>
      <span className='slcn-home-row__rail-day slcn-num'>
        {formatRailDay(isoDate)}
      </span>
      <span className='slcn-home-row__rail-weekday'>
        {formatRailWeekday(isoDate)}
      </span>
      {showYear ? (
        <span className='slcn-home-row__rail-year slcn-num'>{year}</span>
      ) : null}
    </div>
  );
}

export function HomeTimelineRow({
  entry,
  device,
  imageUrl,
}: HomeTimelineRowProps) {
  if (entry.kind === 'schedule') {
    const time = formatScheduleTime(
      entry.schedule.start,
      entry.schedule.allDay
    );

    return (
      <li className='slcn-home-row slcn-home-row--schedule'>
        <Link
          to={buildDeviceCalendarMonthPath(device)}
          className='slcn-home-row__link'
        >
          <DateRail isoDate={entry.isoDate} />
          <div className='slcn-home-row__body'>
            <h2 className='slcn-home-row__title'>{entry.schedule.title}</h2>
            <p className='slcn-home-row__meta'>
              {[time, entry.schedule.location].filter(Boolean).join(' · ')}
            </p>
          </div>
        </Link>
      </li>
    );
  }

  if (entry.kind === 'trip') {
    return (
      <li className='slcn-home-row slcn-home-row--trip'>
        <Link
          to={buildDeviceTripDetailPath(device, entry.trip.id)}
          className='slcn-home-row__link'
        >
          <DateRail isoDate={entry.isoDate} />
          <div className='slcn-home-row__body'>
            <h2 className='slcn-home-row__title'>{entry.trip.name}</h2>
            <p className='slcn-home-row__meta'>
              {[entry.trip.type, entry.trip.description]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
          <span className='slcn-home-row__mark'>
            {imageUrl ? <img src={imageUrl} alt='' /> : null}
          </span>
        </Link>
      </li>
    );
  }

  return (
    <li className='slcn-home-row slcn-home-row--travel'>
      <Link
        to={buildDeviceTravelDetailPath(device, entry.travel.travelId)}
        className='slcn-home-row__link'
      >
        <DateRail isoDate={entry.isoDate} />
        <div className='slcn-home-row__body'>
          {entry.travel.coverPhotoId ? (
            <div className='slcn-home-row__photo'>
              {imageUrl ? <img src={imageUrl} alt='' /> : null}
            </div>
          ) : null}
          <h2 className='slcn-home-row__title slcn-home-row__title--travel'>
            {entry.travel.title}
          </h2>
          <p className='slcn-home-row__meta'>
            {[
              entry.travel.region,
              entry.travel.dateRangeLabel,
              entry.travel.nightsDaysLabel,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
          {entry.travel.oneLineReview ? (
            <p className='slcn-home-row__review'>
              {entry.travel.oneLineReview}
            </p>
          ) : null}
        </div>
      </Link>
    </li>
  );
}

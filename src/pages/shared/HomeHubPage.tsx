import { Link } from 'react-router-dom';
import type { DeviceType } from '../../app/router/route-constants';
import logo from '../../assets/img/SLCN.png';
import {
  buildDeviceCalendarMonthPath,
  buildDeviceShoesCatalogPath,
  buildDeviceTravelListPath,
  buildDeviceTripListPath,
} from '../../lib/routing/route-builders';

type HomeHubPageProps = {
  device: DeviceType;
};

const FILM_URL = 'http://naver.me/52RjLNuT';
const DDAY_START = new Date('2024-11-10T00:00:00+09:00');

function getDdayCount() {
  return Math.floor((Date.now() - DDAY_START.getTime()) / 86_400_000) + 1;
}

export function HomeHubPage({ device }: HomeHubPageProps) {
  const tripListPath = buildDeviceTripListPath(device);
  const travelListPath = buildDeviceTravelListPath(device);
  const calendarPath = buildDeviceCalendarMonthPath(device);
  const shoesPath = buildDeviceShoesCatalogPath(device);
  const ddayDays = getDdayCount();
  const isMobile = device === 'mobile';

  if (!isMobile) {
    return (
      <section className='slcn-home-hub slcn-home-hub--desktop'>
        <div className='slcn-home-hub__desktop-header'>
          <img src={logo} alt='SLCN' className='slcn-home-hub__desktop-logo' />
          <div className='slcn-home-hub__desktop-headline'>
            <h1 className='slcn-home-hub__desktop-title'>
              서울 촌놈 나들이 기록
            </h1>
            <p className='slcn-home-hub__desktop-subtitle'>
              사진과 지도로 남기는 조용한 서울 포토 저널.
            </p>
          </div>
          <div className='slcn-home-hub__dday-badge'>
            <span className='slcn-home-hub__dday-icon' aria-hidden='true'>
              <svg
                width='17'
                height='17'
                viewBox='0 0 24 24'
                fill='#FE9FC8'
                stroke='#FE9FC8'
                strokeWidth='1.6'
                aria-hidden='true'
              >
                <path d='M12 20s-7-4.6-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.4-7 10-7 10z' />
              </svg>
            </span>
            <div className='slcn-home-hub__dday-text'>
              <p className='slcn-home-hub__dday-label'>D-day</p>
              <p className='slcn-home-hub__dday-value'>
                만난 지 <strong>{ddayDays}</strong>일째
              </p>
            </div>
          </div>
        </div>

        <div className='slcn-home-hub__desktop-grid'>
          <Link to={tripListPath} className='slcn-home-hub__desktop-card'>
            <div className='slcn-home-hub__card-icon-wrap'>
              <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='#1B1B1B'
                strokeWidth='1.8'
                aria-hidden='true'
              >
                <path d='M12 21s-7-5.3-7-11a7 7 0 0114 0c0 5.7-7 11-7 11z' />
                <circle cx='12' cy='10' r='2.4' />
              </svg>
            </div>
            <p className='slcn-home-hub__card-eyebrow'>Map</p>
            <h3 className='slcn-home-hub__card-title'>나들이 기록</h3>
            <p className='slcn-home-hub__card-desc'>
              걸었던 길과 장소를 지도에 남겨요.
            </p>
          </Link>

          <Link to={travelListPath} className='slcn-home-hub__desktop-card'>
            <div className='slcn-home-hub__card-icon-wrap'>
              <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='#1B1B1B'
                strokeWidth='1.8'
                aria-hidden='true'
              >
                <polygon points='1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6' />
                <line x1='8' y1='2' x2='8' y2='18' />
                <line x1='16' y1='6' x2='16' y2='22' />
              </svg>
            </div>
            <p className='slcn-home-hub__card-eyebrow'>JOURNEY</p>
            <span className='slcn-home-hub__card-new'>New</span>
            <h3 className='slcn-home-hub__card-title'>여행 기록</h3>
            <p className='slcn-home-hub__card-desc'>
              1박 이상 여행을 날짜별로 기록해요.
            </p>
          </Link>

          <Link to={calendarPath} className='slcn-home-hub__desktop-card'>
            <div className='slcn-home-hub__card-icon-wrap'>
              <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='#1B1B1B'
                strokeWidth='1.8'
                aria-hidden='true'
              >
                <rect x='4' y='5' width='16' height='15' rx='2.5' />
                <path d='M4 9h16M8 3v4M16 3v4' />
              </svg>
            </div>
            <p className='slcn-home-hub__card-eyebrow'>Calendar</p>
            <h3 className='slcn-home-hub__card-title'>서울 촌놈 달력</h3>
            <p className='slcn-home-hub__card-desc'>
              다가오는 나들이를 미리 계획해요.
            </p>
          </Link>

          <Link to={shoesPath} className='slcn-home-hub__desktop-card'>
            <div className='slcn-home-hub__card-icon-wrap'>
              <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='#1B1B1B'
                strokeWidth='1.8'
                aria-hidden='true'
              >
                <path d='M3 16h16a2 2 0 002-2c0-1-1-1.6-2.5-2.2L13 9l-2-3H6v8l-3 2z' />
                <path d='M3 16v2h18' />
              </svg>
            </div>
            <p className='slcn-home-hub__card-eyebrow'>Shoes</p>
            <h3 className='slcn-home-hub__card-title'>신발 추천</h3>
            <p className='slcn-home-hub__card-desc'>
              오래 걷기 좋은 신발 아카이브.
            </p>
          </Link>

          <a
            href={FILM_URL}
            target='_blank'
            rel='noreferrer'
            className='slcn-home-hub__desktop-card'
          >
            <div className='slcn-home-hub__card-header-row'>
              <div className='slcn-home-hub__card-icon-wrap'>
                <svg
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='#1B1B1B'
                  strokeWidth='1.8'
                  aria-hidden='true'
                >
                  <rect x='3' y='4' width='18' height='16' rx='2.5' />
                  <path d='M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4' />
                </svg>
              </div>
              <svg
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='#9B8C92'
                strokeWidth='2'
                aria-hidden='true'
              >
                <path d='M7 17L17 7M9 7h8v8' />
              </svg>
            </div>
            <p className='slcn-home-hub__card-eyebrow'>Film</p>
            <h3 className='slcn-home-hub__card-title'>Choi&apos;s Film Art</h3>
            <p className='slcn-home-hub__card-desc'>필름 작업 외부 링크</p>
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className='slcn-home-hub slcn-home-hub--mobile'>
      <div className='slcn-home-hub__mobile-hero'>
        <p className='slcn-home-hub__mobile-eyebrow'>Seoul Chonnom</p>
        <h1 className='slcn-home-hub__mobile-title'>서울 촌놈 나들이 기록</h1>
        <p className='slcn-home-hub__mobile-subtitle'>
          사진과 지도로 남기는 조용한 서울 포토 저널.
        </p>
        <div className='slcn-home-hub__mobile-stats'>
          <div className='slcn-home-hub__mobile-stat'>
            <p className='slcn-home-hub__mobile-stat-label'>D-day</p>
            <p className='slcn-home-hub__mobile-stat-value slcn-num'>
              {ddayDays}일째
            </p>
          </div>
          <a
            href={FILM_URL}
            target='_blank'
            rel='noreferrer'
            className='slcn-home-hub__mobile-stat'
          >
            <p className='slcn-home-hub__mobile-stat-label'>Film ↗</p>
            <p className='slcn-home-hub__mobile-stat-value slcn-home-hub__mobile-stat-value--film'>
              Choi&apos;s Film Art
            </p>
          </a>
        </div>
      </div>

      <Link to={tripListPath} className='slcn-home-hub__mobile-tile'>
        <div className='slcn-home-hub__mobile-tile-icon'>
          <svg
            width='22'
            height='22'
            viewBox='0 0 24 24'
            fill='none'
            stroke='#1B1B1B'
            strokeWidth='1.8'
            aria-hidden='true'
          >
            <path d='M12 21s-7-5.3-7-11a7 7 0 0114 0c0 5.7-7 11-7 11z' />
            <circle cx='12' cy='10' r='2.4' />
          </svg>
        </div>
        <div className='slcn-home-hub__mobile-tile-body'>
          <p className='slcn-home-hub__mobile-tile-eyebrow'>Map</p>
          <h3 className='slcn-home-hub__mobile-tile-title'>나들이 기록</h3>
          <p className='slcn-home-hub__mobile-tile-desc'>걸었던 길과 장소</p>
        </div>
        <svg
          width='18'
          height='18'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#C9B9BF'
          strokeWidth='2'
          aria-hidden='true'
        >
          <path d='M9 6l6 6-6 6' />
        </svg>
      </Link>

      <Link to={travelListPath} className='slcn-home-hub__mobile-tile'>
        <div className='slcn-home-hub__mobile-tile-icon'>
          <svg
            width='22'
            height='22'
            viewBox='0 0 24 24'
            fill='none'
            stroke='#1B1B1B'
            strokeWidth='1.8'
            aria-hidden='true'
          >
            <polygon points='1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6' />
            <line x1='8' y1='2' x2='8' y2='18' />
            <line x1='16' y1='6' x2='16' y2='22' />
          </svg>
        </div>
        <div className='slcn-home-hub__mobile-tile-body'>
          <p className='slcn-home-hub__mobile-tile-eyebrow'>JOURNEY</p>
          <div className='slcn-home-hub__mobile-tile-title-row'>
            <h3 className='slcn-home-hub__mobile-tile-title'>여행 기록</h3>
            <span className='slcn-home-hub__card-new'>New</span>
          </div>
          <p className='slcn-home-hub__mobile-tile-desc'>1박 이상 여행 기록</p>
        </div>
        <svg
          width='18'
          height='18'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#C9B9BF'
          strokeWidth='2'
          aria-hidden='true'
        >
          <path d='M9 6l6 6-6 6' />
        </svg>
      </Link>

      <Link to={calendarPath} className='slcn-home-hub__mobile-tile'>
        <div className='slcn-home-hub__mobile-tile-icon'>
          <svg
            width='22'
            height='22'
            viewBox='0 0 24 24'
            fill='none'
            stroke='#1B1B1B'
            strokeWidth='1.8'
            aria-hidden='true'
          >
            <rect x='4' y='5' width='16' height='15' rx='2.5' />
            <path d='M4 9h16M8 3v4M16 3v4' />
          </svg>
        </div>
        <div className='slcn-home-hub__mobile-tile-body'>
          <p className='slcn-home-hub__mobile-tile-eyebrow'>Calendar</p>
          <h3 className='slcn-home-hub__mobile-tile-title'>서울 촌놈 달력</h3>
          <p className='slcn-home-hub__mobile-tile-desc'>
            다가오는 나들이 계획
          </p>
        </div>
        <svg
          width='18'
          height='18'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#C9B9BF'
          strokeWidth='2'
          aria-hidden='true'
        >
          <path d='M9 6l6 6-6 6' />
        </svg>
      </Link>

      <Link to={shoesPath} className='slcn-home-hub__mobile-tile'>
        <div className='slcn-home-hub__mobile-tile-icon'>
          <svg
            width='22'
            height='22'
            viewBox='0 0 24 24'
            fill='none'
            stroke='#1B1B1B'
            strokeWidth='1.8'
            aria-hidden='true'
          >
            <path d='M3 16h16a2 2 0 002-2c0-1-1-1.6-2.5-2.2L13 9l-2-3H6v8l-3 2z' />
            <path d='M3 16v2h18' />
          </svg>
        </div>
        <div className='slcn-home-hub__mobile-tile-body'>
          <p className='slcn-home-hub__mobile-tile-eyebrow'>Shoes</p>
          <h3 className='slcn-home-hub__mobile-tile-title'>신발 추천</h3>
          <p className='slcn-home-hub__mobile-tile-desc'>오래 걷기 좋은 신발</p>
        </div>
        <svg
          width='18'
          height='18'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#C9B9BF'
          strokeWidth='2'
          aria-hidden='true'
        >
          <path d='M9 6l6 6-6 6' />
        </svg>
      </Link>
    </section>
  );
}

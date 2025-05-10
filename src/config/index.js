//주소 등 필요한 정보들 선언용 Javascript

const API_HOST_URL = process.env.VUE_APP_API_URL;
const USER = 'user/';
const TRIP = 'trip/';
const SCHEDULE = 'schedule/';

export default {
  account: {
    postLogin: () => encodeURI(API_HOST_URL + USER + 'login'),
    getAccessToken: () => encodeURI(API_HOST_URL + USER + 'token'),
  },
  trip: {
    getTripList: () => encodeURI(API_HOST_URL + TRIP),
    registerTrip: () => encodeURI(API_HOST_URL + TRIP),
    getTripInfo: (tripDate) => encodeURI(API_HOST_URL + TRIP + `${tripDate}`),
    getFile: (path) =>
      encodeURI(API_HOST_URL + TRIP + 'file?path=' + `${path}`),
  },
  schedule: {
    getScheduleList: () => encodeURI(API_HOST_URL + SCHEDULE),
    getScheduleListForYearAndMonth: (year, month) =>
      encodeURI(
        API_HOST_URL + SCHEDULE + 'date?year=' + year + '&month=' + month
      ),
    registerSchedule: () => encodeURI(API_HOST_URL + SCHEDULE + 'register'),
    updateSchedule: () => encodeURI(API_HOST_URL + SCHEDULE + 'modify'),
    removeSchedule: (scheduleId) =>
      encodeURI(API_HOST_URL + SCHEDULE + 'remove/' + scheduleId),
  },
};

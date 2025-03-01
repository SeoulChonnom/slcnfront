//주소 등 필요한 정보들 선언용 Javascript

const API_HOST_URL = 'http://localhost:8080/';
const USER = 'user/';
const TRIP = 'trip/';

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
};

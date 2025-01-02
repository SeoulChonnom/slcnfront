//주소 등 필요한 정보들 선언용 Javascript

const API_HOST_URL = "localhost:8080/";
const USER = "user/";
const TRIP = "trip/";

export default {
    account: {
        postLogin: () => API_HOST_URL + USER + "login",
        getAccessToken: () => API_HOST_URL + USER + "token",
      },
      trip: {
        getAllTrip: () => API_HOST_URL + TRIP,
        addTrip: () => API_HOST_URL + TRIP,
        getTripInfo: (tripDate) => API_HOST_URL + TRIP + `${tripDate}`,
        getFile: () => API_HOST_URL + TRIP + "file",
      }
}
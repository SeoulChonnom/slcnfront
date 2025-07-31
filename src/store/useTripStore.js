import { defineStore } from 'pinia';
import apiService from '@/utils/apiUtils';
import config from '@/config';
// Todo: date는 Unique가 아님. 캐싱 로직 수정 필요.
export const useTripStore = defineStore('trip', {
  persist: {
    storage: sessionStorage,
    paths: ['userInfo'],
  },
  state: () => ({
    tripList: [],
    tripInfoList: [],
  }),
  actions: {
    async getTripList() {
      const data = await apiService.get(config.trip.getTripList());
      this.tripList = [...data];
    },
    async findTripInfo(date) {
      const cachedInfo = this.tripInfoList.find((info) => info.date === date);
      if (cachedInfo) {
        return cachedInfo;
      }

      const getInfo = await this.getTripInfo(date);
      return getInfo;
    },
    async getTripInfo(date) {
      const data = await apiService.get(config.trip.getTripInfo(date));
      this.tripInfoList.push(data);
      return data;
    },
    async registerTrip(data, logo, map1, map2) {
      const form = new FormData();

      const jsonBlob = new Blob([JSON.stringify(data)], {
        type: 'application/json',
      });
      form.append('tripRegisterRequest', jsonBlob);

      if (logo) form.append('logo', logo);
      if (map1) form.append('map1', map1);
      if (map2) form.append('map2', map2);

      const response = await apiService.uploadFile(
        config.trip.registerTrip(),
        form
      );
      return response;
    },
    async getFile(path) {
      return await apiService.downloadFile(config.trip.getFile(path));
    },
    registerTripTest(data, logo, map1, map2) {
      console.log(data);
      console.log(logo);
      console.log(map1);
      console.log(map2);
    },
  },
});

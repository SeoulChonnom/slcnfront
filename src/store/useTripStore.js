import axios from "axios";
import { defineStore } from "pinia";
import { useUserStore } from "@/store/useUserStore";
import config from "@/config";
// Todo: date는 Unique가 아님. 캐싱 로직 수정 필요.
export const useTripStore = defineStore("trip", {
  persist: {
    storage: sessionStorage,
    paths: ["userInfo"],
  },
  state: () => ({
    tripList: [],
    tripInfoList: [],
  }),
  actions: {
    async getTripList() {
      try {
        const res = await axios({
          url: config.trip.getTripList(),
          method: "GET",
          headers: { "X-AUTH-TOKEN": useUserStore().token },
        });
        this.tripList = res.data.data;
      } catch (e) {
        if (e.response?.status === 400) {
          throw new Error(e.response.data.message);
        } else {
          throw new Error("알 수 없는 오류입니다.");
        }
      }
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
      try {
        const res = await axios({
          url: config.trip.getTripInfo(date),
          method: "Get",
          headers: { "X-AUTH-TOKEN": useUserStore().token },
        });
        this.tripInfoList.push(res.data.data);
        return res.data.data;
      } catch (e) {
        if (e.response?.status === 400) {
          throw new Error(e.response.data.message);
        } else {
          throw new Error("알 수 없는 오류입니다.");
        }
      }
    },
    async registerTrip(data) {
      try {
        await axios({
          url: config.trip.registerTrip(),
          method: "POST",
          headers: { "X-AUTH-TOKEN": useUserStore().token },
          data: data,
        });
      } catch (e) {
        if (e.response?.status === 400) {
          throw new Error(e.response.data.message);
        } else {
          throw new Error("알 수 없는 오류입니다.");
        }
      }
    },
    async getFile(path) {
      try {
        const response = await axios({
          url: config.trip.getFile(path),
          method: "GET",
          headers: { "X-AUTH-TOKEN": useUserStore().token },
          responseType: "blob",
        });
        return URL.createObjectURL(response.data);
      } catch (e) {
        if (e.response?.status === 400) {
          throw new Error(e.response.data.message);
        } else {
          throw new Error("알 수 없는 오류입니다.");
        }
      }
    },
  },
});

import axios from "axios";
import { defineStore } from "pinia";
import config from "@/config";

export const useUserStore = defineStore("user", {
  persist: {
    storage: sessionStorage,
    paths: ["userInfo"],
  },
  state: () => ({
    token: null,
    userInfo: {},
  }),
  getters: {
    isLogin(state) {
      return !!state.token;
    },
  },
  actions: {
    async loginByInput(userName, password) {
      try {
        const res = await axios({
          url: config.account.postLogin(),
          method: "POST",
          data: {
            username: userName,
            password: password,
          },
        });
        this.token = res.data.data.accessToken;
        this.userInfo = {
          name: res.data.data.name,
          userName: res.data.data.username,
          roleList: res.data.data.roleList,
        };
      } catch (e) {
        if (e.response && e.status === 400) {
          throw new Error(e.response.data.message);
        } else {
          throw new Error("알 수 없는 오류입니다.");
        }
      }
    },
    async loginByRefreshToken() {
      try {
        const res = await axios({
          url: config.account.getAccessToken(),
          method: "GET",
        });
        this.token = res.data.data.accessToken;
        this.userInfo = {
          name: res.data.data.name,
          userName: res.data.data.username,
          roleList: res.data.data.roleList,
        };
      } catch (e) {
        throw new Error(e.response.data.message);
      }
    },
  },
});

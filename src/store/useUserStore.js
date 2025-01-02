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
    login(userName, password) {
      console.log(config.account.postLogin);
      axios({
        url: config.account.postLogin,
        method: "POST",
        data: {
          username: userName,
          password: password,
        },
      }).then((res) => {
        console.log(res.data);
      });
    },
  },
});

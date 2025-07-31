import { defineStore } from 'pinia';
import apiService from '@/utils/apiUtils';
import config from '@/config';

export const useUserStore = defineStore('user', {
  persist: {
    storage: sessionStorage,
    paths: ['userInfo'],
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
      const data = await apiService.post(config.account.postLogin(), {
        username: userName,
        password: password,
      });
      this.token = data.accessToken;
      this.userInfo = {
        name: data.name,
        userName: data.username,
        roleList: data.roleList,
      };
    },
    async loginByRefreshToken() {
      const data = await apiService.getSilent(config.account.getAccessToken());
      this.token = data.accessToken;
      this.userInfo = {
        name: data.name,
        userName: data.username,
        roleList: data.roleList,
      };
    },
  },
});

<template>
  <div class="login-container">
    <h1>SLCN Login</h1>
    <form @submit.prevent="sumbitLoginForm" class="login-form">
      <div class="login-form-group">
        <label class="login-label" for="userName">아이디</label>
        <input
          class="login-input"
          id="userName"
          type="text"
          v-model="userName"
          required
          placeholder="Enter your id"
        />
      </div>
      <div class="login-form-group">
        <label class="login-label" for="password">비밀번호</label>
        <input
          class="login-input"
          id="password"
          type="password"
          v-model="password"
          required
          placeholder="Enter your password"
        />
      </div>
      <button type="submit" class="login-button">Login</button>
    </form>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/useUserStore";

const router = useRouter();
const userStore = useUserStore();

const userName = ref("");
const password = ref("");

const sumbitLoginForm = async () => {
  if (!userName.value || !password.value) {
    alert("입력값이 잘못되었습니다.");
    return;
  }
  try {
    await userStore.loginByInput(userName.value, password.value);
    if (userStore.token) {
      router.push("/");
    }
  } catch (error) {
    alert(error.message);
  }
};

const getAccessTokenByRefreshToken = async () => {
  try {
    await userStore.loginByRefreshToken();
    if (userStore.token) {
      router.push("/");
    }
  } catch (error) {
    //alert(error.message);
    console.log(error.message);
  }
};

onMounted(() => {
  getAccessTokenByRefreshToken();
});
</script>

<style>
@import "@/assets/css/loginPage.css";
</style>

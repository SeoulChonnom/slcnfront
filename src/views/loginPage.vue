<template>
  <div class="login-container">
    <h1>SLCN Login</h1>
    <form @submit.prevent="sumbitLoginForm" class="login-form">
      <div class="login-form-group">
        <label class="login-label" for="userName">아이디</label>
        <input
          class="login-input"
          id="username"
          type="text"
          v-model="username"
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
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/useUserStore';
import { validateForm } from '@/utils/validationUtils';
import { showErrorAlert } from '@/utils/alertUtils';
import { ERROR_MESSAGES } from '@/constants/validation';

const router = useRouter();
const userStore = useUserStore();

const username = ref('');
const password = ref('');

const sumbitLoginForm = async () => {
  const formData = {
    username: username.value,
    password: password.value,
  };

  const validation = validateForm(formData, ['username', 'password']);
  if (!validation.isValid) {
    showErrorAlert(ERROR_MESSAGES.INVALID_INPUT);
    return;
  }

  try {
    await userStore.loginByInput(username.value, password.value);
    if (userStore.token) {
      router.push('/');
    }
  } catch (error) {
    showErrorAlert(error.message);
  }
};

const getAccessTokenByRefreshToken = async () => {
  try {
    await userStore.loginByRefreshToken();
    if (userStore.token) {
      router.push('/');
    }
  } catch (error) {
    // Silent fail for refresh token - user can still login manually
    console.log('Refresh token failed');
  }
};

onMounted(() => {
  getAccessTokenByRefreshToken();
});
</script>

<style>
@import '@/assets/css/loginPage.css';
</style>

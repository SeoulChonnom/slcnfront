<template>
  <div id="mainDiv" :class="mainDivClass">
    <div id="header">
      <img id="SLCN" src="./assets/img/SLCN.png" @click="onClickSLCN()" />
    </div>
    <router-view></router-view>
    <div id="footer">© Seoul CHONNOM</div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const onClickSLCN = () => {
  router.push("/");
};
const mainDivClass = computed(() => route.meta.mainDivClass || "");
</script>

<style>
@import "./assets/css/common.css";

.login-page-body {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>

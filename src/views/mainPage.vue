<template>
  <div id="content">
    <div id="infoDiv">서울 촌놈 나들이 기록 📷</div>
    <div id="mapListDiv">
      <tripList v-for="trip in trips" :key="trip.date" v-bind:trip="trip" />
    </div>
    <div id="tobecontinueDiv">서울 촌놈 나들이는 계속 될 예정....🥳</div>
    <div
      class="fixButtonDiv"
      :class="{ fix1: !shoesRecom && ayo, fix2: ayo, fixNone: !ayo }"
      id="ayoFilmButtonDiv"
      @click="onclickFilm"
    >
      Choi's Film Art~🎞
      <div
        class="fixButtonCloseDiv"
        id="ayoFilmButtonCloseDiv"
        @click.stop="onclickClose(1)"
      >
        X
      </div>
    </div>
    <div
      class="fixButtonDiv"
      :class="{ fix1: shoesRecom, fixNone: !shoesRecom }"
      id="shoesRecomButtonDiv"
      @click="onclickShoes"
    >
      서울 촌놈의 신발 추천~👟
      <div
        class="fixButtonCloseDiv"
        id="shoesRecomButtonCloseDiv"
        @click.stop="onclickClose(2)"
      >
        X
      </div>
    </div>
  </div>
</template>
  

<script setup>
import { useUserStore } from "@/store/useUserStore";
import { onMounted } from "vue";
import tripList from "@/components/trip/tripList.vue";
import { globalTrip } from "@/global/global.js";
import { useRouter } from "vue-router";
import { ref } from "vue";

const router = useRouter();
const userStore = useUserStore();
const trips = globalTrip.trips;
const ayo = ref(true);
const shoesRecom = ref(true);

const onclickShoes = () => {
  router.push("/shoesRecom");
};

const onclickFilm = () => {
  window.open("http://naver.me/52RjLNuT");
};

const onclickClose = (id) => {
  if (id == 1) {
    ayo.value = !ayo.value;
  } else {
    shoesRecom.value = !shoesRecom.value;
  }
};

const isLogined = () => {
  if (userStore.token) {
    return true;
  }
  return false;
};

onMounted(() => {
  if (!isLogined()) {
    alert("로그인이 필요한 페이지입니다.");
    router.push("/login");
  }
});
</script>
  
  <!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
@import "../assets/css/index.css";
</style>
  
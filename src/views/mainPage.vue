<template>
  <div id="content">
    <div id="infoDiv">서울 촌놈 나들이 기록 📷</div>
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
import { useTripStore } from "@/store/useTripStore";
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { ref } from "vue";

const router = useRouter();
const tripStore = useTripStore();
const ayo = ref(true);
const shoesRecom = ref(true);

const onclickShoes = () => {
  router.push("/shoesRecom");
};

const onclickFilm = () => {
  //window.open("http://naver.me/52RjLNuT");
  router.push("/map");
};

const onclickClose = (id) => {
  if (id == 1) {
    ayo.value = !ayo.value;
  } else {
    shoesRecom.value = !shoesRecom.value;
  }
};

const getTripList = async () => {
  try {
    await tripStore.getTripList();
  } catch (e) {
    return;
  }
};

onMounted(() => {
  getTripList();
});
</script>

<style>
@import "../assets/css/index.css";
</style>
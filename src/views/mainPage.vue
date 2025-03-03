<template>
  <div id="content">
    <!-- <div id="infoDiv">서울 촌놈 나들이 기록 📷</div> -->
    <div id="mainContentDiv">
      <div class="contentListDiv doubleContentList">
        <ddayComponent></ddayComponent>
        <calendarComponent></calendarComponent>
      </div>
      <div class="contentListDiv">
        <mapComponent></mapComponent>
      </div>
      <div class="contentListDiv doubleContentList">
        <choiFilmArtComponent></choiFilmArtComponent>
        <recomComponent></recomComponent>
      </div>
    </div>
    <!-- <div
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
    </div> -->
  </div>
</template>
  

<script setup>
// import { useRouter } from 'vue-router';
// import { ref } from 'vue';
import ddayComponent from '@/components/main/ddayComponent.vue';
import calendarComponent from '@/components/main/calendarComponent.vue';
import mapComponent from '@/components/main/mapComponent.vue';
import choiFilmArtComponent from '@/components/main/choiFilmArtComponent.vue';
import recomComponent from '@/components/main/recomComponent.vue';

// const router = useRouter();
// const ayo = ref(true);
// const shoesRecom = ref(true);

// const onclickShoes = () => {
//   router.push('/shoesRecom');
// };

// const onclickFilm = () => {
//   //window.open("http://naver.me/52RjLNuT");
//   router.push('/map');
// };

// const onclickClose = (id) => {
//   if (id == 1) {
//     ayo.value = !ayo.value;
//   } else {
//     shoesRecom.value = !shoesRecom.value;
//   }
// };
</script>

<style>
@import '../assets/css/index.css';
#mainContentDiv {
  margin-top: 30px;
}
.contentListDiv {
  margin-bottom: 30px;
  width: 100%;
}
.doubleContentList {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
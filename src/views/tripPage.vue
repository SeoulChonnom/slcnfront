<template>
  <div id="content">
    <div id="infoDiv">서울 촌놈 나들이 경로 😎</div>
    <div id="mapDiv">
      <img v-if="showMap" class="map" id="map1" :src="getMap1()" />
      <img v-if="!showMap" class="map" id="map2" :src="getMap2()" />
    </div>
    <div v-if="getMap2()" id="move">
      <button id="moveButton" @click="moveButtonClick()">
        {{ getMoveButtonText() }}
      </button>
    </div>
    <div id="photoDiv">
      <a id="myboxLink" v-bind:href="getDrive()" target="_blank">
        <img id="mybox" src="@/assets/img/mybox.png" />
      </a>
      <div id="myboxDiv">
        사진은 드라이브에서 📷
        <div id="pwDiv">암호 🔒 : 입사일</div>
      </div>
    </div>
  </div>
</template>

<script>
import { globalTrip } from "@/global/global";

export default {
  name: "tripPage",
  data() {
    return {
      showMap: true,
      globalTrip,
      date: this.$route.params.date,
    };
  },
  methods: {
    getMap1() {
      return globalTrip.trips.find((item) => item.date === this.date).map;
    },
    getDrive() {
      return globalTrip.trips.find((item) => item.date === this.date).drive;
    },
    getMap2() {
      return globalTrip.trips.find((item) => item.date === this.date).map2;
    },
    getButtonText1() {
      return globalTrip.trips.find((item) => item.date === this.date)
        .buttonText1;
    },
    getButtonText2() {
      return globalTrip.trips.find((item) => item.date === this.date)
        .buttonText2;
    },
    getMoveButtonText() {
      if (this.showMap) {
        return this.getButtonText1();
      }
      return this.getButtonText2();
    },
    moveButtonClick() {
      this.showMap = !this.showMap;
    },
  },
  onMounted() {
    console.log(globalTrip.getTrip(this.date));
    console.log(this.date);
  },
};
</script>

<style scoped>
@import "@/assets/css/map.css";
</style>
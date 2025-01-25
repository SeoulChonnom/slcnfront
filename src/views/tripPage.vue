<template>
  <div id="content">
    <div id="infoDiv">서울 촌놈 나들이 경로 😎</div>
    <div id="mapDiv">
      <img v-if="isMap1" class="map" id="map1" :src="map1" />
      <img v-if="!isMap1" class="map" id="map2" :src="map2" />
    </div>
    <div v-if="isMultiMapTrip()" id="move">
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

<script setup>
import { ref, onBeforeMount, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useTripStore } from "@/store/useTripStore";

const isMap1 = ref(true);
const route = useRoute();
const tripStore = useTripStore();
const date = route.params.date;
const tripData = ref({
  date: null,
  map1: null,
  map2: null,
  button1: null,
  button2: null,
  drive: null,
});
const map1 = ref(null);
const map2 = ref(null);

const moveButtonClick = () => {
  isMap1.value = !isMap1.value;
};

const isMultiMapTrip = () => {
  if (tripData.value.map2?.length > 0) {
    return true;
  }
  return false;
};

const getMap1 = () => {
  tripStore.getFile(tripData.value.map1).then((data) => {
    map1.value = data;
  });
};

const getMap2 = () => {
  if (isMultiMapTrip()) {
    tripStore.getFile(tripData.value.map2).then((data) => {
      map2.value = data;
    });
  } else {
    map2.value = map1.value;
  }
};

const getDrive = () => {
  return tripData.value.drive;
};

const getButtonText1 = () => {
  return tripData.value.button1;
};

const getButtonText2 = () => {
  return tripData.value.button2;
};

const getMoveButtonText = () => {
  if (isMap1.value) {
    return getButtonText1();
  }
  return getButtonText2();
};

onBeforeMount(() => {});

onMounted(() => {
  tripStore.findTripInfo(date).then((data) => {
    tripData.value = data;
    getMap1();
    getMap2();
    console.log(tripData.value);
  });
});
</script>

<style scoped>
@import "@/assets/css/map.css";
</style>
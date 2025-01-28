<template>
  <div id="content">
    <div id="infoDiv">서울 촌놈 나들이 기록 📷</div>
    <div id="mapListDiv">
      <div id="mapCreateDiv" @click="createTrip()">새 나들이 기록하기</div>
      <tripList v-for="trip in trips" :key="trip.date" v-bind:trip="trip" />
    </div>
    <div id="tobecontinueDiv">서울 촌놈 나들이는 계속 될 예정....🥳</div>
  </div>
</template>
    
  
  <script setup>
import { useTripStore } from "@/store/useTripStore";
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import tripList from "@/components/trip/tripList.vue";

const tripStore = useTripStore();
const router = useRouter();
const trips = tripStore.tripList;

const getTripList = async () => {
  try {
    await tripStore.getTripList();
  } catch (e) {
    return;
  }
};

const createTrip = () => {
  router.push("/map/register");
};

onMounted(() => {
  getTripList();
});
</script>
  
<style>
@import "../assets/css/mapPage.css";
</style>
<template>
  <div id="mainPageMapDiv" @click="onClickMapDiv()">map</div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const onClickMapDiv = () => {
  router.push('/map');
};
</script>

<style scoped>
#mainPageMapDiv {
  background-color: rgb(241, 214, 208);
  width: 94%;
  margin-left: 3%;
  margin-right: 3%;
  border-radius: 15px;
  /* aspect-ratio: 8/7; */
  height: 190px;
}
</style>

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
  width: 84%;
  margin-left: 8%;
  margin-right: 8%;
  border-radius: 25px;
  aspect-ratio: 2.4;
  /* height: 175px; */
}
</style>

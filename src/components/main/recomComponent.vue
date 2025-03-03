<template>
  <div id="recomDiv" @click="onClickRecomDiv()">recom</div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const onClickRecomDiv = () => {
  router.push('/shoesRecom');
};
</script>

<style scoped>
#recomDiv {
  background-color: rgb(241, 214, 208);
  width: 35%;
  padding: 2%;
  margin-left: 3%;
  margin-right: 8%;
  border-radius: 25px;
  aspect-ratio: 1;
  /* height: 175px; */
}
</style>

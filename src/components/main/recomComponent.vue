<template>
  <div id="recomDiv" @click="onClickRecomDiv()">recom</div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const onClickRecomDiv = () => {
  router.push("/shoesRecom");
};
</script>

<style scoped>
#recomDiv {
  background-color: rgb(241, 214, 208);
  width: 41%;
  padding: 2%;
  margin-left: 2%;
  margin-right: 3%;
  border-radius: 15px;
  /* aspect-ratio: 8/7; */
  height: 190px;
}
</style>

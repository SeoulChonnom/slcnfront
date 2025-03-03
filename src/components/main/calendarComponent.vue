<template>
  <div id="calendarDiv" @click="onClickCalendar()">calander</div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const onClickCalendar = () => {
  router.push('/calendar');
};
</script>

<style scoped>
div:where(.swal2-container) .swal2-radio label {
  font-family: 'NotoKR-Medium Medium';
}
div:where(.swal2-container) .swal2-html-container {
  font-family: 'NotoKR-Medium Medium';
}
@media (hover: none) and (pointer: coarse) {
  div:where(.swal2-container) .swal2-radio label {
    font-family: 'NotoKR-Medium Medium';
    font-size: 1rem;
  }
}
#calendarDiv {
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

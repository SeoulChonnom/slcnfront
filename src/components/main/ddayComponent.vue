<template>
  <div id="ddayDiv" @click="onClickDday()">
    만난지<br /><span id="ddaySpan">{{ getDday() }}</span> 일째
  </div>
</template>

<script setup>
import swal from 'sweetalert2';
import dayjs from 'dayjs';

const today = dayjs();
const d_day = dayjs('2024-11-10');

const onClickDday = () => {
  swal.fire('GOOD');
};

const getDday = () => {
  return today.diff(d_day, 'd') + 1;
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
#ddayDiv {
  text-align: right;
  font-family: 'NotoKR-Medium Medium';
  background-color: rgb(241, 214, 208);
  width: 41%;
  padding: 2%;
  margin-right: 2%;
  margin-left: 3%;
  border-radius: 15px;
  font-size: 0.85rem;
  /* aspect-ratio: 8/7; */
  height: 190px;
}
#ddaySpan {
  font-weight: bold;
  font-size: 1.1rem;
}
</style>

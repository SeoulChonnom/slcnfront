<template>
  <div id="calanderDiv" @click="onClickCalander()">calander</div>
</template>

<script setup>
import swal from "sweetalert2";

const onClickCalander = () => {
  swal.fire("calender");
};
</script>

<style scoped>
div:where(.swal2-container) .swal2-radio label {
  font-family: "NotoKR-Medium Medium";
}
div:where(.swal2-container) .swal2-html-container {
  font-family: "NotoKR-Medium Medium";
}
@media (hover: none) and (pointer: coarse) {
  div:where(.swal2-container) .swal2-radio label {
    font-family: "NotoKR-Medium Medium";
    font-size: 1rem;
  }
}
#calanderDiv {
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

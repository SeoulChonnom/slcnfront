<template>
  <div id="choiFilmArtDiv" @click="onclickFilm()">Choi's Film Art~🎞</div>
</template>

<script setup>
const onclickFilm = () => {
  window.open('http://naver.me/52RjLNuT');
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
#choiFilmArtDiv {
  background-color: rgb(241, 214, 208);
  width: 35%;
  padding: 2%;
  margin-right: 3%;
  margin-left: 8%;
  border-radius: 25px;
  aspect-ratio: 1;
  /* height: 175px; */
}
</style>

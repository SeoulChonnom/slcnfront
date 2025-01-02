<template>
  <div class="mapDiv" @click="onClickMap()">
    <div class="mapImgDiv">
      <img class="map" :src="trip.logo" />
    </div>
    <div class="mapDesc">
      {{ trip.desc1 }}<br />
      {{ trip.desc2 }}
    </div>
  </div>
</template>

<script>
import swal from "sweetalert2";

export default {
  name: "mapList",
  props: { trip: Object },
  methods: {
    async onClickMap() {
      const inputOptions = new Promise((resolve) => {
        setTimeout(() => {
          resolve(this.trip.radio);
        }, 500);
      });
      const { value: ans } = await swal.fire({
        icon: "question",
        title: this.trip.title,
        input: "radio",
        inputOptions,
        inputValidator: (value) => {
          if (!value) {
            return "정답을 선택해주세요!";
          }
        },
      });
      if (ans === this.trip.answer) {
        swal
          .fire({
            icon: "success",
            title: this.trip.answerTitle,
            text: this.trip.answerText,
            timer: 1000,
            timerProgressBar: true,
            showConfirmButton: false,
          })
          .then(() => {
            this.$router.push("/map/" + this.trip.date);
          });
      } else {
        swal.fire({
          icon: "error",
          title: this.trip.errorTitle,
          text: this.trip.errorText,
          timer: 1000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      }
    },
  },
  data() {
    return {};
  },
};
</script>

<style>
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
</style>
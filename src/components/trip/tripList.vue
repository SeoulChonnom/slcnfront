<template>
  <div class="mapDiv" @click="onClickMap()">
    <div class="mapImgDiv">
      <img class="map" :src="logo" />
    </div>
    <div class="mapDesc">
      {{ trip.info1 }}<br />
      {{ trip.info2 }}
    </div>
  </div>
</template>

<script setup>
import swal from "sweetalert2";
import { defineProps, ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useTripStore } from "@/store/useTripStore";

const router = useRouter();
const tripStore = useTripStore();
const props = defineProps({
  trip: Object,
});
const logo = ref(null);

const makeQuizAnswer = () => {
  const quiz = {
    answer: undefined,
    responses: [],
  };

  props.trip.quizResponses.forEach((response) => {
    quiz.responses.push(response.answer);
    if (response.quizIndex === props.trip.quizAnswer) {
      quiz.answer = response.answer;
    }
  });

  return quiz;
};

const isCorrect = (answer, idx) => {
  const response = props.trip.quizResponses.find(
    (response) => response.quizIndex === idx
  );
  return response ? answer === response.answer : false;
};

const onClickMap = async () => {
  const quiz = makeQuizAnswer();
  const inputOptions = new Promise((resolve) => {
    setTimeout(() => {
      resolve(quiz.responses);
    }, 500);
  });
  const { value: ans } = await swal.fire({
    icon: "question",
    title: props.trip.quizTitle.replace("\\n", "\n"),
    input: "radio",
    inputOptions,
    inputValidator: (value) => {
      if (!value) {
        return "정답을 선택해주세요!";
      }
    },
  });
  if (isCorrect(quiz.answer, ans)) {
    swal
      .fire({
        icon: "success",
        title: props.trip.quizAnswerTitle,
        text: props.trip.quizAnswerText,
        timer: 1000,
        timerProgressBar: true,
        showConfirmButton: false,
      })
      .then(() => {
        router.push("/map/" + props.trip.date);
      });
  } else {
    swal.fire({
      icon: "error",
      title: props.trip.quizErrorTitle,
      text: props.trip.quizErrorText,
      timer: 1000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  }
};

onMounted(() => {
  tripStore.getFile(props.trip.logo).then((data) => {
    logo.value = data;
  });
});

onBeforeUnmount(() => {
  if (logo.value) {
    URL.revokeObjectURL(logo.value);
  }
});
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
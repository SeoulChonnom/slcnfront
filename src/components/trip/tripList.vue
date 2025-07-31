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
import { defineProps, ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useTripStore } from '@/store/useTripStore';
import { showRadioAlert, showSuccessAlert, showErrorAlert } from '@/utils/alertUtils';

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
  try {
    const quiz = makeQuizAnswer();
    const result = await showRadioAlert(
      props.trip.quizTitle.replace('\\n', '\n'),
      quiz.responses
    );
    
    if (result.isConfirmed && isCorrect(quiz.answer, result.value)) {
      await showSuccessAlert(props.trip.quizAnswerText, props.trip.quizAnswerTitle);
      router.push('/map/' + props.trip.date);
    } else if (result.isConfirmed) {
      await showErrorAlert(props.trip.quizErrorText, props.trip.quizErrorTitle);
    }
  } catch (error) {
    showErrorAlert('퀴즈를 불러오는 중 오류가 발생했습니다.');
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
/* SweetAlert2 styling moved to variables.css */
@media (hover: none) and (pointer: coarse) {
  div:where(.swal2-container) .swal2-radio label {
    font-size: 1rem;
  }
}
</style>
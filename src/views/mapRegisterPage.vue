<template>
  <div id="content">
    <div id="infoDiv">서울 촌놈 나들이 추가</div>
    <div class="trip-container">
      <form @submit.prevent="sumbitTripForm" class="trip-form">
        <div class="trip-form-type">
          <label class="trip-type-label" for="A">아영</label>
          <input
            class="trip--type-input"
            v-model="formData.type"
            value="A"
            id="A"
            type="radio"
          />
          <label class="trip-type-label" for="I">일권</label>
          <input
            class="trip--type-input"
            v-model="formData.type"
            value="I"
            id="I"
            type="radio"
          />
        </div>
        <div class="trip-form-group">
          <label class="trip-label" for="date">날짜</label>
          <input class="trip-input" id="date" type="date" v-model="date" />
        </div>
        <div class="trip-form-group">
          <label class="trip-label" for="logo">로고</label>
          <input
            class="trip-input"
            id="logo"
            type="file"
            @change="(e) => handleFileUpload(e, 'logo')"
            ref="logoImage"
            required
            accept=".jpg, .jpeg, .png, .gif, .svg"
          />
        </div>
        <div class="trip-form-group">
          <label class="trip-label" for="info2">나들이 이름</label>
          <input
            class="trip-input"
            id="info2"
            type="text"
            v-model="formData.info2"
            required
            placeholder="나들이 이름"
          />
        </div>
        <div class="trip-form-group">
          <label class="trip-label" for="map1">지도</label>
          <input
            class="trip-input"
            id="map1"
            type="file"
            @change="(e) => handleFileUpload(e, 'map1')"
            ref="map1Image"
            required
            accept=".jpg, .jpeg, .png, .gif, .svg"
          />
        </div>
        <div class="trip-multi-map-button" @click="toggleMultiMap()">
          {{ getMultiMapButtonText() }}
        </div>
        <div class="trip-form-group" v-if="multiMap">
          <label class="trip-label" for="map2">지도 2</label>
          <input
            class="trip-input"
            id="map2"
            type="file"
            @change="(e) => handleFileUpload(e, 'map2')"
            ref="map2Image"
            accept=".jpg, .jpeg, .png, .gif, .svg"
          />
        </div>
        <div class="trip-form-group" v-if="multiMap">
          <label class="trip-label" for="button1">버튼 1</label>
          <input
            class="trip-input"
            id="button1"
            type="text"
            v-model="formData.button1"
            placeholder="버튼 1"
          />
        </div>
        <div class="trip-form-group" v-if="multiMap">
          <label class="trip-label" for="button2">버튼 2</label>
          <input
            class="trip-input"
            id="button2"
            type="text"
            v-model="formData.button2"
            placeholder="버튼 2"
          />
        </div>
        <div class="trip-form-group">
          <label class="trip-label" for="drive">드라이브 링크</label>
          <input
            class="trip-input"
            id="drive"
            type="text"
            v-model="formData.drive"
            required
            placeholder="드라이브 링크"
          />
        </div>
        <div class="trip-form-group">
          <label class="trip-label" for="quizTitle">퀴즈 제목</label>
          <input
            class="trip-input"
            id="quizTitle"
            type="text"
            v-model="formData.quizTitle"
            required
            placeholder="퀴즈 제목"
          />
        </div>
        <div class="trip-form-group">
          <label class="trip-label" for="quizAnswerTitle">정답 제목</label>
          <input
            class="trip-input"
            id="quizAnswerTitle"
            type="text"
            v-model="formData.quizAnswerTitle"
            required
            placeholder="정답 제목"
          />
        </div>
        <div class="trip-form-group">
          <label class="trip-label" for="quizAnswerText">정답 텍스트</label>
          <input
            class="trip-input"
            id="quizAnswerText"
            type="text"
            v-model="formData.quizAnswerText"
            required
            placeholder="정답 텍스트"
          />
        </div>
        <div class="trip-form-group">
          <label class="trip-label" for="quizErrorTitle">오답 제목</label>
          <input
            class="trip-input"
            id="quizErrorTitle"
            type="text"
            v-model="formData.quizErrorTitle"
            required
            placeholder="오답 제목"
          />
        </div>
        <div class="trip-form-group">
          <label class="trip-label" for="quizErrorText">오답 텍스트</label>
          <input
            class="trip-input"
            id="quizErrorText"
            type="text"
            v-model="formData.quizErrorText"
            required
            placeholder="오답 텍스트"
          />
        </div>
        <div class="trip-form-group">
          <label class="trip-label" for="quizAnswer">정답 번호</label>
          <input
            class="trip-input"
            id="quizAnswer"
            type="number"
            v-model="formData.quizAnswer"
            required
            placeholder="정답 번호"
          />
        </div>
        <div class="trip-form-group">
          <label class="trip-label" for="quizAnswer1">정답1</label>
          <input
            class="trip-input"
            id="quizAnswer1"
            type="text"
            v-model="quizList.quizRegisterRequestList[0].answer"
            required
            placeholder="정답1"
          />
        </div>
        <div class="trip-form-group">
          <label class="trip-label" for="quizAnswer2">정답2</label>
          <input
            class="trip-input"
            id="quizAnswer2"
            type="text"
            v-model="quizList.quizRegisterRequestList[1].answer"
            required
            placeholder="정답2"
          />
        </div>
        <div class="trip-form-group">
          <label class="trip-label" for="quizAnswer3">정답3</label>
          <input
            class="trip-input"
            id="quizAnswer3"
            type="text"
            v-model="quizList.quizRegisterRequestList[2].answer"
            placeholder="정답3"
          />
        </div>
        <div class="trip-form-group">
          <label class="trip-label" for="quizAnswer4">정답4</label>
          <input
            class="trip-input"
            id="quizAnswer4"
            type="text"
            v-model="quizList.quizRegisterRequestList[3].answer"
            placeholder="정답4"
          />
        </div>
        <button type="submit" class="trip-button">저장</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import swal from "sweetalert2";
import { useTripStore } from "@/store/useTripStore";
import dayjs from "dayjs";
import { useRouter } from "vue-router";

const tripStore = useTripStore();
const router = useRouter();
const allowedExtensions = ["jpg", "jpeg", "png", "gif", "svg"];
const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/svg+xml",
];
const maxSize = 10 * 1024 * 1024;

const date = ref("");
const multiMap = ref(false);

const formData = ref({
  date: "",
  type: "",
  info1: "",
  info2: "",
  button1: "",
  button2: "",
  drive: "",
  quizTitle: "",
  quizAnswer: "",
  quizAnswerTitle: "",
  quizAnswerText: "",
  quizErrorTitle: "",
  quizErrorText: "",
  quizRegisterRequestList: [],
});

const quizList = ref({
  quizRegisterRequestList: [
    { quizIndex: "0", answer: "" },
    { quizIndex: "1", answer: "" },
    { quizIndex: "2", answer: "" },
    { quizIndex: "3", answer: "" },
  ],
});
const logoImage = ref(null);
const map1Image = ref(null);
const map2Image = ref(null);

const imageData = ref({
  logo: null,
  map1: null,
  map2: null,
});

const validateForm = () => {
  for (const key in formData.value) {
    if (!formData.value[key]) {
      if (!multiMap.value && (key == "button1" || key == "button2")) {
        continue;
      }
      swal.fire("빈칸을 채워주세요.");
      return false;
    }
  }

  formData.value.quizRegisterRequestList =
    quizList.value.quizRegisterRequestList.filter((data) => data.answer !== "");

  return true;
};

const sumbitTripForm = () => {
  if (date.value) {
    formData.value.info1 = dayjs(date.value).format("YYYY.MM.DD");
    formData.value.date = dayjs(date.value).format("YYYYMMDD");
  }

  if (!validateForm()) {
    return;
  }

  formData.value.quizAnswer = formData.value.quizAnswer - 1;

  if (!multiMap.value) {
    imageData.value.map2 = null;
    formData.value.button1 = "";
    formData.value.button2 = "";
  }

  tripStore
    .registerTrip(
      formData.value,
      imageData.value.logo,
      imageData.value.map1,
      imageData.value.map2
    )
    .then(
      swal
        .fire({
          icon: "success",
          text: "저장에 성공하였습니다.",
          timer: 1000,
          timerProgressBar: true,
          showConfirmButton: false,
        })
        .then(() => router.push("/map"))
    )
    .catch((e) => {
      swal.fire(e.message);
    });
};

const handleFileUpload = (event, key) => {
  const files = event.target.files;

  if (files && files[0]) {
    const file = files[0];
    const fileExtension = file.name.split(".").pop().toLowerCase();

    // 이미지 파일 여부 검사
    if (
      !allowedExtensions.includes(fileExtension) ||
      !allowedMimeTypes.includes(file.type)
    ) {
      swal.fire(`허용되지 않은 파일 형식입니다. 이미지 파일만 업로드해주세요.`);
      event.target.value = "";
      return;
    }

    // 파일 사이즈 검사
    if (file.size > maxSize) {
      alert("파일 크기는 10MB를 초과할 수 없습니다.");
      event.target.value = "";
      return;
    }

    imageData.value[key] = file;
  }
};

const toggleMultiMap = () => {
  if (multiMap.value) {
    multiMap.value = false;
  } else {
    multiMap.value = true;
  }
};

const getMultiMapButtonText = () => {
  if (multiMap.value) {
    return "2번 지도 지우기";
  }
  return "2번 지도 추가하기";
};
</script>

<style scoped>
@import "@/assets/css/mapRegisterPage.css";
</style>

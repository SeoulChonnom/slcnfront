<template>
  <div id="content">
    <div id="infoDiv">서울촌놈 나들이 일정 🗓️</div>
    <hr id="calendar_hr" />
    <nav class="navbar">
      <button class="button is-rounded today">Today</button>
      <button class="button is-rounded prev">
        <img
          class="arrow_img"
          alt="prev"
          src="../assets/img/calendar/left-arrow.png"
        />
      </button>
      <button class="button is-rounded next">
        <img
          class="arrow_img"
          alt="next"
          src="../assets/img/calendar/right-arrow.png"
        />
      </button>
      <span class="navbar--range">{{ year }}.{{ month }}</span>
    </nav>
    <div
      ref="calendarRef"
      style="height: 600px; width: 95%; margin: 0.5rem auto"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Calendar from '@toast-ui/calendar';
import {
  getSchedulesForNow,
  registerSchedule,
  updateSchedule,
  removeSchedule,
} from '@/service/scheduleService';
import { formattingDate, pad } from '@/utils/dateUtils';
import { isNullToBlank } from '@/utils/stringUtils';

import 'tui-date-picker/dist/tui-date-picker.css';
import 'tui-time-picker/dist/tui-time-picker.css';
import swal from 'sweetalert2';

const calendarRef = ref(null);
let calendar = null;

const year = ref(null);
const month = ref(null);

// TODO: 달 변경시 해당 달 이벤트 조회 추가

const applyChanges = (event, changes) => {
  Object.keys(changes).forEach((key) => {
    event[key] = changes[key];
  });
  return event;
};

onMounted(() => {
  const now = new Date();
  year.value = now.getFullYear();
  month.value = pad(now.getMonth() + 1);
  const options = {
    defaultView: 'month',
    usageStatistics: false,
    useFormPopup: true,
    useDetailPopup: true,
    isReadOnly: false,
    timezone: {
      zones: [
        {
          timezoneName: 'Asia/Seoul',
          displayLabel: 'Seoul',
        },
      ],
    },
    calendars: [
      {
        id: 'cal1',
        name: 'ayo',
        backgroundColor: '#03bd9e',
      },
      {
        id: 'cal2',
        name: 'rik',
        backgroundColor: '#00a9ff',
      },
    ],
  };

  calendar = new Calendar(calendarRef.value, options);
  calendar.setTheme({
    common: {
      backgroundColor: 'rgb(252, 242, 242)',
    },
  });

  calendar.on('beforeCreateEvent', async (data) => {
    data.body = isNullToBlank(data.body);
    data.start = formattingDate(data.start);
    data.end = formattingDate(data.end);
    data.category = data.isAllday ? 'allday' : 'time';
    data.isVisible = true;

    try {
      data.id = await registerSchedule(data);
    } catch (e) {
      swal.fire(e.message);
      return;
    }

    calendar.createEvents([data]);
    calendar.clearGridSelections();
  });

  calendar.on('beforeUpdateEvent', async ({ event, changes }) => {
    const changeEvent = calendar.getEvent(event.id, event.calendarId);

    if (changes.isAllday) {
      changes.category = changes.isAllday ? 'allday' : 'time';
    }

    applyChanges(changeEvent, changes);
    changeEvent.start = formattingDate(changeEvent.start);
    changeEvent.end = formattingDate(changeEvent.end);

    await updateSchedule(changeEvent);

    calendar.updateEvent(event.id, event.calendarId, changes);
  });

  calendar.on('beforeDeleteEvent', async (data) => {
    await removeSchedule(data.id);
    calendar.deleteEvent(data.id, data.calendarId);
  });

  getSchedulesForNow().then((data) => {
    calendar.createEvents(data);
  });
});
</script>

<style scoped>
@import '@/assets/css/toastCalendar.css';

#calendar_hr {
  padding: 0;
  border: 0;
  height: 1px;
  background-image: linear-gradient(
    to right,
    rgba(0, 0, 0, 0),
    rgba(0, 0, 0, 0.75),
    rgba(0, 0, 0, 0)
  );
}

.button {
  background-color: #fff;
  border-color: #dbdbdb;
  border-width: 2px;
  color: #363636;
  cursor: pointer;
  justify-content: center;
  padding-bottom: calc(0.5em + 0.25rem);
  padding-left: 1em;
  padding-right: 1em;
  padding-top: calc(0.5em + 0.25rem);
  text-align: center;
  white-space: nowrap;
}

.button.is-rounded {
  border-radius: 9999px;
  padding-left: calc(0.5em + 0.25em);
  padding-right: calc(0.5em + 0.25em);
}

.button.prev,
.button.next {
  padding: 0.8rem;
}

.navbar .button + .button {
  margin-left: 0.25rem;
}

.button.is-rounded {
  border-radius: 9999px;
  padding-left: calc(0.5em + 0.25em);
  padding-right: calc(0.5em + 0.25em);
}

.arrow_img {
  width: 15px;
}
</style>

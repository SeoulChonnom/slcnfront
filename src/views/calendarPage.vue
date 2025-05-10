<template>
  <div id="content">
    <div id="infoDiv">서울촌놈 나들이 일정 🗓️</div>
    <hr id="calendar_hr" />
    <nav class="navbar">
      <span class="navbar_range">{{ year }}.{{ month }}</span>
      <div>
        <button class="button is-rounded today" @click="moveMonth(0)">
          Today
        </button>
        <button class="button is-rounded prev" @click="moveMonth(-1)">
          <img
            class="arrow_img"
            alt="prev"
            src="../assets/img/calendar/left-arrow.png"
          />
        </button>
        <button class="button is-rounded next" @click="moveMonth(1)">
          <img
            class="arrow_img"
            alt="next"
            src="../assets/img/calendar/right-arrow.png"
          />
        </button>
      </div>
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
  getSchedulesForYearAndMonth,
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

const moveMonth = (opt) => {
  if (opt === 1) {
    calendar.next();
  } else if (opt === -1) {
    calendar.prev();
  } else {
    calendar.today();
  }

  changeToday(calendar.getDate().toDate());

  getSchedulesForYearAndMonth(year.value, month.value);
};

const changeToday = (date) => {
  year.value = date.getFullYear();
  month.value = pad(date.getMonth() + 1);
};

onMounted(() => {
  changeToday(new Date());
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
@import '@/assets/css/calendarPage.css';
</style>

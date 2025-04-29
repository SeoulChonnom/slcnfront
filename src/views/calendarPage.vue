<template>
  <div id="content">
    <div id="infoDiv">서울촌놈 나들이 일정 🗓️</div>
    <hr id="calendar_hr" />
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
} from '@/service/scheduleService';
import { formattingDate } from '@/utils/dateUtils';
import { isNullToBlank } from '@/utils/stringUtils';

import 'tui-date-picker/dist/tui-date-picker.css';
import 'tui-time-picker/dist/tui-time-picker.css';
import swal from 'sweetalert2';

const calendarRef = ref(null);
let calendar = null;

// TODO: 이벤트 UD 추가, 달 변경시 해당 달 이벤트 조회 추가

onMounted(() => {
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

  calendar.on('beforeUpdateEvent', (data) => {
    if (data.changes.isAllday) {
      data.changes.category = data.changes.isAllday ? 'allday' : 'time';
    }

    calendar.updateEvent(data.event.id, data.event.calendarId, data.changes);
  });

  calendar.on('beforeDeleteEvent', (data) => {
    console.log(data);
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
</style>

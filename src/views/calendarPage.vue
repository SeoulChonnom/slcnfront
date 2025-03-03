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
import 'tui-date-picker/dist/tui-date-picker.css';
import 'tui-time-picker/dist/tui-time-picker.css';

const calendarRef = ref(null);
let calendar = null;

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

  calendar.on('beforeCreateEvent', (data) => {
    data.id = crypto.randomUUID();
    if (data.isAllday == true) {
      data.category = 'allday';
    }
    calendar.createEvents([data]);
    calendar.clearGridSelections();
  });

  calendar.on('beforeUpdateEvent', (data) => {
    if (data.changes.isAllday == true) {
      data.changes.category = 'allday';
    }
    calendar.updateEvent(data.event.id, data.event.calendarId, data.changes);
  });

  calendar.on('beforeDeleteEvent', (data) => {
    console.log(data);
    calendar.deleteEvent(data.id, data.calendarId);
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

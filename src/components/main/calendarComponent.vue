<template>
  <NavigationCard 
    card-id="calendarDiv" 
    label="calendar" 
    route-path="/calendar"
  />
</template>

<script setup>
import NavigationCard from '@/components/ui/NavigationCard.vue';
</script>

<style scoped>
/* SweetAlert2 styling moved to variables.css */
#calendarDiv {
  background-color: var(--primary-bg-color);
  width: 35%;
  padding: 2%;
  margin-left: 3%;
  margin-right: 8%;
  border-radius: var(--border-radius-lg);
  aspect-ratio: 1;
  /* height: 175px; */
}
</style>

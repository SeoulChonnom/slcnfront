<template>
  <NavigationCard 
    card-id="mainPageMapDiv" 
    label="map" 
    route-path="/map"
  />
</template>

<script setup>
import NavigationCard from '@/components/ui/NavigationCard.vue';
</script>

<style scoped>
#mainPageMapDiv {
  background-color: var(--primary-bg-color);
  width: 84%;
  margin-left: 8%;
  margin-right: 8%;
  border-radius: var(--border-radius-lg);
  aspect-ratio: 2.4;
  /* height: 175px; */
}
</style>

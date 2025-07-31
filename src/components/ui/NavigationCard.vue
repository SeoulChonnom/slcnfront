<template>
  <div 
    :id="cardId" 
    class="navigation-card" 
    @click="handleClick"
  >
    <slot>{{ label }}</slot>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  cardId: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    default: '',
  },
  routePath: {
    type: String,
    required: true,
  },
});

const router = useRouter();

const handleClick = () => {
  router.push(props.routePath);
};
</script>

<style scoped>
.navigation-card {
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: var(--font-family);
}

.navigation-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
<template>
  <div class="shoesDiv" v-bind:id="shoe.divId" @click="shoesClick">
    <div class="shoesImgDiv">
      <img class="shoesImg" :src="shoe.img" />
    </div>
    <div class="shoes">{{ shoe.name }}</div>
    <div class="price">{{ shoe.price }}</div>
  </div>
</template>
    
<script>
export default {
  name: 'shoesList',
  props: { shoe: Object },
  methods: {
    shoesClick() {
      this.$emit('shoesDivClick', this.shoe);
    },
  },
  data() {
    return {};
  },
};
</script>
    
<style>
@import '@/assets/css/shoesRecom.css';
</style>
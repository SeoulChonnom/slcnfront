<template>
  <div class="brandListDiv" v-bind:id="brand.divId">
    <img class="brandListImg" :src="this.brand.img" />
    <div class="brandListInfo">
      <div class="brandListName">{{ brand.name }}</div>
      <div class="brandListDesc">{{ brand.desc }}</div>
    </div>
  </div>
  <div class="shoesListDiv">
    <shoesList
      v-for="shoe in brand.shoes"
      :key="shoe.id"
      v-bind:shoe="shoe"
      @shoesDivClick="onClickShoesList"
    ></shoesList>
  </div>
</template>
  
<script>
import shoesList from "./shoesList.vue";

export default {
  name: "brandList",
  props: { brand: Object },
  methods: {
    onClickShoesList(shoe) {
      this.$router.push("/" + this.brand.brandId + "/" + shoe.shoesId);
    },
  },
  data() {
    return {};
  },
  components: {
    shoesList,
  },
};
</script>
  
<style>
@import "@/assets/css/shoesRecom.css";
</style>
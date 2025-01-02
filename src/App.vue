<template>
  <div id="mainDiv">
    <div id="header">
      <img id="SLCN" src="./assets/img/SLCN.png" @click="onClickSLCN()" />
    </div>
    <router-view></router-view>
    <div id="footer">© Seoul CHONNOM</div>
  </div>
</template>

<script>
export default {
  name: "App",
  components: {},
  methods: {
    onClickSLCN() {
      this.$router.push("/");
    },
  },
};
</script>

<style>
@import "./assets/css/common.css";
#app {
  background-color: rgb(241, 214, 208);
}
</style>

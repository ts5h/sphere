<template>
  <Sphere />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Sphere from "./components/Sphere";

export default defineComponent({
  name: "App",
  components: {
    Sphere,
  },
});
</script>

<style lang="scss">
* {
  box-sizing: border-box;
}

html,
body {
  height: 100%;
}

body {
  margin: 0;
  padding: 0;
}

#app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
</style>

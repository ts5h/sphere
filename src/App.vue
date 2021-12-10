<template>
  <ReturnToHome theme="light" />
  <GitHub theme="light" url="https://github.com/ts5h/sphere" />
  <Sphere />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import ReturnToHome from "@/components/ReturnToHome.vue";
import GitHub from "@/components/GitHub.vue";

// https://stackoverflow.com/questions/64213461/vuejs-typescript-cannot-find-module-components-navigation-or-its-correspon
import Sphere from "@/components/Sphere.vue";

export default defineComponent({
  name: "App",
  components: {
    GitHub,
    ReturnToHome,
    Sphere,
  },
});
</script>

<style lang="scss">
@use "scss/config/variables";

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
  position: relative;
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
</style>

<template>
  <div class="return-to-top">
    <a href="/">Back</a>
  </div>
</template>

<script lang="ts">
import isMobile from "ismobilejs";

export default {
  name: "ReturnToTop",
  setup(): void {
    //
  },
};
</script>

<style lang="scss" scoped>
@use "../scss/config/variables";

/* Return to the HOME on static pages */
.return-to-top {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1000;

  box-sizing: border-box;
  background: url(/img/arrow-back-to-home.svg) no-repeat 8px center / 12px auto;
  margin: 0;
  padding: 0;

  opacity: 0;
  transition: opacity 0.3s ease-out;

  &.on {
    opacity: 1;
  }

  a {
    display: block;
    color: white;
    font-family: Inter, sans-serif;
    font-size: 11px;
    padding: 8px 10px 8px 24px;
    text-decoration: none;
  }
}

// Light
.return-to-top {
  &.light {
    background-image: url(/img/arrow-back-to-home-dark.svg);

    a {
      color: #444;
    }
  }
}

@media screen and (max-width: variables.$break-point) {
  .return-to-top {
    text-indent: -9999px;
    background-position: center center;
    width: 24px;
    height: 24px;

    opacity: 0.5;
    transition: none;

    a {
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
      padding: 0;
      width: 100%;
      height: 100%;
    }
  }
}
</style>

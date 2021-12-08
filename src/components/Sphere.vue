<template>
  <div class="canvas-wrapper">
    <canvas id="sphere"></canvas>
  </div>
</template>

<!-- Script-->
<script lang="ts">
import isMobile from "ismobilejs";
import * as Three from "three";
import Canvas from "../class/Canvas";

export default {
  name: "Sphere",
  created(): void {
    // Audio
    this.eventName =
      typeof document.ontouchend !== "undefined" ? "touchend" : "mouseup";
    document.addEventListener(this.eventName, this.initAudioContext);

    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    } catch (e) {
      console.log(e);
    }

    this.audioChannels = 2;
    this.audioFrameCount = this.audioCtx.sampleRate * 10.0;
    this.audioArrBuf = null;
  },
  mounted(): void {
    this.cs = new Canvas("sphere");
    window.addEventListener("resize", this.handleResize);

    // Canvas
    this.ww = this.cs.getWindowWidth();
    this.wh = this.cs.getWindowHeight();

    this.renderer = new Three.WebGLRenderer({
      canvas: document.querySelector("#sphere"),
      antialias: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.ww, this.wh);
    this.renderer.setClearColor(new Three.Color(0xffffff));

    // Scene
    this.scene = new Three.Scene();

    // Camera
    this.cameraPosition = 0;

    if (isMobile().any) {
      this.cameraPosition = Math.max(this.ww, this.wh) * 1.2;
    } else {
      this.cameraPosition = Math.min(this.ww, this.wh) * 1.25;
    }

    this.camera = new Three.PerspectiveCamera(
      45,
      this.ww / this.wh,
      0.1,
      10000
    );
    this.camera.position.set(0, 0, this.cameraPosition);
    this.scene.add(this.camera);

    // Light
    this.directionalLight = new Three.DirectionalLight(0xffffff);
    this.directionalLight.position.set(0, 0, 1000);
    this.scene.add(this.directionalLight);

    // Lines
    // https://jsfiddle.net/xvnctbL0/2/
    this.MAX_POINTS = 300000;
    this.lineLength = 10;

    this.lineGeometry = new Three.BufferGeometry();
    this.positions = new Float32Array(this.MAX_POINTS * 3);
    this.lineGeometry.setAttribute(
      "position",
      new Three.BufferAttribute(this.positions, 3)
    );
    this.drawCount = 2;
    this.lineGeometry.setDrawRange(0, this.drawCount);
    this.lineMaterial = new Three.LineBasicMaterial({
      color: 0x000000,
      opacity: 0.1,
      transparent: true,
    });

    this.line = new Three.Line(this.lineGeometry, this.lineMaterial);
    this.scene.add(this.line);

    // Debug
    // Axes
    // this.axes = new Three.AxesHelper(1000);
    // this.scene.add(this.axes);

    // Other Settings
    this.radius = Math.min(this.ww, this.wh) / 2;
    this.animationID = null;

    this.updatePositions();
    this.loop();
  },
  beforeUnmount(): void {
    window.removeEventListener("resize", this.handleResize);
    window.cancelAnimationFrame(this.animationID);
  },
  methods: {
    updatePositions(): void {
      const positions = this.line.geometry.attributes.position.array;
      let x, y, z, index;
      x = y = z = index = 0;
      y = Math.random() * 200 - 100;

      for (let i = 0, l = this.MAX_POINTS; i < l; i++) {
        positions[index++] = x;
        positions[index++] = y;
        positions[index++] = z;

        x += (Math.random() - 0.5) * this.lineLength;
        y += (Math.random() - 0.5) * this.lineLength;
        z += (Math.random() - 0.5) * this.lineLength;

        // https://qiita.com/kitasenjudesign/items/e785e00736161ec238ae
        const tmpRad = Math.sqrt(x * x + y * y + z * z);
        if (tmpRad > this.radius) {
          const theta = Math.acos(z / tmpRad);
          const phi = Math.atan2(y, x);
          x = this.radius * Math.sin(theta) * Math.cos(phi);
          y = this.radius * Math.sin(theta) * Math.sin(phi);
          z = this.radius * Math.cos(theta);
        }
      }
    },

    loop(): void {
      //const radian = this.getRadian(this.degrees);
      //this.camera.position.x = 1000 * Math.sin(radian);

      // The direction of the Camera
      this.camera.lookAt(new Three.Vector3(0, 0, 0));

      // Lines
      this.drawCount = (this.drawCount + 6) % this.MAX_POINTS;
      this.line.geometry.setDrawRange(0, this.drawCount);

      if (this.drawCount === 0) {
        this.updatePositions();
        this.line.geometry.attributes.position.needsUpdate = true;
      }

      // Play Tone
      this.playTone();

      // Rotation
      this.renderer.render(this.scene, this.camera);
      this.line.rotation.y -= 0.001;

      this.animationID = requestAnimationFrame(this.loop);
    },

    // Resize
    handleResize(): void {
      cancelAnimationFrame(this.animationID);

      this.cs.resizeCanvas();
      this.ww = this.cs.getWindowWidth();
      this.wh = this.cs.getWindowHeight();

      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(this.ww, this.wh);

      this.camera.aspect = this.ww / this.wh;
      this.camera.updateProjectionMatrix();

      this.loop();
    },

    // Audio
    initAudioContext(): void {
      document.removeEventListener(this.eventName, this.initAudioContext);
      this.audioCtx.resume();
    },

    // Play Tone
    mapToVal(
      val: number,
      start1: number,
      stop1: number,
      start2: number,
      stop2: number
    ): number {
      return start2 + (stop2 - start2) * ((val - start1) / (stop1 - start1));
    },
    playTone(): void {
      // Use y Axis
      const positions = this.line.geometry.attributes.position.array;
      const y = positions[this.drawCount - 1];

      if (this.drawCount % 5 === 0) {
        // Tone 1
        const freq1 = this.mapToVal(y, -this.radius, this.radius, 20, 220);
        const osc1 = this.audioCtx.createOscillator();
        osc1.frequency.value = freq1;
        osc1.type = "sine";

        const gain1 = this.audioCtx.createGain();
        gain1.gain.value = 0.25;

        osc1.connect(gain1);
        gain1.connect(this.audioCtx.destination);

        osc1.start(this.audioCtx.currentTime);
        osc1.stop(this.audioCtx.currentTime + 0.1);

        // Tone 2
        const freq2 = 65;
        const osc2 = this.audioCtx.createOscillator();
        osc2.frequency.value = freq2;
        osc2.type = "sine";

        const gain2 = this.audioCtx.createGain();
        gain2.gain.value = 0.55;

        osc2.connect(gain2);
        gain2.connect(this.audioCtx.destination);

        osc2.start(this.audioCtx.currentTime);
        osc2.stop(this.audioCtx.currentTime + 0.1);
      }
    },
  },
};
</script>

<!-- Style -->
<style lang="scss" scoped>
.canvas-wrapper {
  width: 100%;
  height: 100%;

  canvas {
    vertical-align: bottom;
  }
}
</style>

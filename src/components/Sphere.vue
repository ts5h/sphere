<template>
  <div class="canvas-wrapper">
    <canvas id="sphere"></canvas>
  </div>
</template>

<!-- Script-->
<script lang="ts">
import { onMounted, onBeforeUnmount } from "vue";
import isMobile from "ismobilejs";
import * as THREE from "three";
import Canvas from "../class/Canvas";

export default {
  name: "Sphere",
  setup(): void {
    const eventName =
      typeof document.ontouchend !== "undefined" ? "touchend" : "mouseup";

    let audioCtx: AudioContext;
    // let audioFrameCount = 0;
    // let audioArrBuf = null;
    // const audioChannels = 2;

    try {
      audioCtx = new AudioContext();
      // audioFrameCount = audioCtx.sampleRate * 10.0;
    } catch (e) {
      console.log(e);
    }

    let animationID: number | null;
    let cs: Canvas;
    let ww: number;
    let wh: number;
    let renderer: THREE.WebGLRenderer;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let line: THREE.Line;
    const MAX_POINTS = 400000;
    const lineLength = 10;
    let radius: number;
    let drawCount = 0;

    // Play Tone
    const mapToVal = (
      val: number,
      start1: number,
      stop1: number,
      start2: number,
      stop2: number
    ) => {
      return start2 + (stop2 - start2) * ((val - start1) / (stop1 - start1));
    };
    const playTone = () => {
      // Use y axis
      const positions = line.geometry.attributes.position.array;
      const y = positions[drawCount - 1];

      if (drawCount % 5 === 0) {
        // Tone 1 / C2~A3
        const freq1 = mapToVal(y, -radius, radius, 65.4, 220.0);
        const osc1 = audioCtx.createOscillator();
        osc1.frequency.value = freq1;
        osc1.type = "sine";

        const gain1 = audioCtx.createGain();
        gain1.gain.value = 0.25;

        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);

        osc1.start(audioCtx.currentTime);
        osc1.stop(audioCtx.currentTime + 0.1);

        // Tone 2
        const freq2 = 100;
        const osc2 = audioCtx.createOscillator();
        osc2.frequency.value = freq2;
        osc2.type = "sine";

        const gain2 = audioCtx.createGain();
        gain2.gain.value = 0.55;

        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);

        osc2.start(audioCtx.currentTime);
        osc2.stop(audioCtx.currentTime + 0.1);
      }
    };


    // Draw lines
    const updatePositions = () => {
      let x = 0;
      let y = Math.random() * 200 - 100;
      let z = 0;

      for (let index = 0; index < MAX_POINTS; index++) {
        // https://threejs.org/docs/#manual/en/introduction/How-to-update-things
        // https://threejs.org/docs/#api/en/core/BufferAttribute.setXYZ
        line.geometry.attributes.position.setXYZ(index, x, y, z);

        x += (Math.random() - 0.5) * lineLength;
        y += (Math.random() - 0.5) * lineLength;
        z += (Math.random() - 0.5) * lineLength;

        // https://qiita.com/kitasenjudesign/items/e785e00736161ec238ae
        const tmpRad = Math.sqrt(x * x + y * y + z * z);
        if (tmpRad > radius) {
          const theta = Math.acos(z / tmpRad);
          const phi = Math.atan2(y, x);
          x = radius * Math.sin(theta) * Math.cos(phi);
          y = radius * Math.sin(theta) * Math.sin(phi);
          z = radius * Math.cos(theta);
        }
      }
    };

    const loop = () => {
      // The direction of the Camera
      camera.lookAt(new THREE.Vector3(0, 0, 0));

      // Lines
      drawCount = (drawCount + 6) % MAX_POINTS;
      line.geometry.setDrawRange(0, drawCount);

      if (drawCount === 0) {
        updatePositions();
        line.geometry.attributes.position.needsUpdate = true;
      }

      // Play Tone
      playTone();

      // Rotation
      renderer.render(scene, camera);
      line.rotation.y -= 0.001;

      animationID = requestAnimationFrame(loop);
    };

    // Resize
    const handleResize = () => {
      if (animationID !== null) {
        window.cancelAnimationFrame(animationID);
      }

      cs.resizeCanvas();
      ww = cs.getWindowWidth();
      wh = cs.getWindowHeight();

      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(ww, wh);

      camera.aspect = ww / wh;
      camera.updateProjectionMatrix();

      loop();
    };

    // Audio
    const initAudioContext = () => {
      document.removeEventListener(eventName, initAudioContext);
    };

    document.addEventListener(eventName, initAudioContext);

    /* Hooks */
    onMounted(() => {
      cs = new Canvas("sphere");
      window.addEventListener("resize", handleResize);

      // Canvas
      ww = cs.getWindowWidth();
      wh = cs.getWindowHeight();

      renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector("#sphere") as HTMLCanvasElement,
        antialias: true,
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(ww, wh);
      renderer.setClearColor(new THREE.Color(0xffffff));

      // Scene
      scene = new THREE.Scene();

      // Camera
      const cameraPosition = isMobile().any
        ? Math.max(ww, wh) * 1.2
        : Math.min(ww, wh) * 1.25;
      camera = new THREE.PerspectiveCamera(45, ww / wh, 0.1, 10000);
      camera.position.set(0, 0, cameraPosition);
      scene.add(camera);

      // Lines
      // https://jsfiddle.net/xvnctbL0/2/
      const lineGeometry = new THREE.BufferGeometry();
      const positions = new Float32Array(MAX_POINTS * 3);
      const drawCount = 2;
      lineGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
      lineGeometry.setDrawRange(0, drawCount);

      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x000000,
        opacity: 0.1,
        transparent: true,
      });

      line = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(line);

      // Other settings
      radius = Math.min(ww, wh) / 2;
      animationID = null;

      updatePositions();
      loop();
    });

    onBeforeUnmount(() => {
      window.removeEventListener("resize", handleResize);
      if (animationID !== null) {
        window.cancelAnimationFrame(animationID);
      }
    });
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

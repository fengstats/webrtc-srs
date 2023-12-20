<template>
  <button @click="playLiveMedia">flv.js 拉流播放</button>
  <p>
    <video ref="remoteVideoRef" muted autoplay controls class="w-150 h-120 border-2 border-solid border-green"></video>
  </p>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import flvjs from 'flv.js'
import { NO_SUPPORT_TEXT, APP_STREAM_NAME } from '@/constant'

const remoteVideoRef = ref<HTMLVideoElement>()

// 播放
const playLiveMedia = () => {
  if (!flvjs.isSupported()) {
    alert(NO_SUPPORT_TEXT)
    return
  }
  const flvPlayer = flvjs.createPlayer({
    type: 'flv',
    url: `http://localhost:8080/${APP_STREAM_NAME}.flv`,
  })
  flvPlayer.attachMediaElement(remoteVideoRef.value!)
  flvPlayer.load()
  flvPlayer.play()
}
</script>

<style></style>

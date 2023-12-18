<template>
  <h1>浏览器通过 WebRTC 推流到 SRS 服务</h1>

  <div class="control">
    <button @click="getUserMedia">获取媒体流</button>
  </div>
  <div v-if="!isSupportRTC" p="y-4" color="red">该浏览器不支持 RTCPeerConnection，请尝试切换 Chrome</div>

  <div m="t-4">
    <video ref="localVideoRef" muted autoplay class="w-160 h-auto border-1 border-solid border-blue"></video>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isSupportRTC = ref<boolean>(true)

// 1. 创建一个 RTCPeerConnection 对象
const rtcPC = ref<RTCPeerConnection>()
rtcPC.value = new RTCPeerConnection()
if (!rtcPC.value) isSupportRTC.value = false

console.log(rtcPC.value)

const localVideoRef = ref<HTMLVideoElement>()
const localStream = ref<MediaStream>()

const getUserMedia = async () => {
  // 2. 获取媒体流返回 MediaStream 赋值给本地流
  const stream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true })
  localStream.value = stream
  localVideoRef.value!.srcObject = stream

  // 3. 获取本地流遍历轨道，插入到 rtcPC 里面
  stream.getTracks().forEach((streamTrack) => {
    rtcPC.value?.addTrack(streamTrack)
  })

  console.log(stream)
}
</script>

<style></style>

<template>
  <h1 class="font-normal text-xl">浏览器通过 WebRTC 推流到 SRS 服务</h1>

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
import axios from 'axios'

const isSupportRTC = ref<boolean>(true)

// 1. 创建一个 RTCPeerConnection 对象
const rtcPC = ref<RTCPeerConnection>()
rtcPC.value = new RTCPeerConnection()
if (!rtcPC.value) isSupportRTC.value = false

// console.log(rtcPC.value)

const localVideoRef = ref<HTMLVideoElement>()
const localStream = ref<MediaStream>()

const getUserMedia = async () => {
  // 2. 获取媒体流返回 MediaStream 赋值给本地流
  const stream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true })
  localStream.value = stream
  localVideoRef.value!.srcObject = stream

  // 3. 获取本地流遍历轨道，插入到 rtcPC 里面
  stream.getTracks().forEach((track) => {
    // NOTE: 注意这里的本地流 stream 也要一起添加进去
    rtcPC.value?.addTrack(track, stream)
  })

  // console.log(stream)

  handleNegotiation()
}

// 协商：交换会话描述信息 offer 和 answer
const handleNegotiation = async () => {
  // 1. 创建一个 offer session description
  const offerSDP = await rtcPC.value?.createOffer()

  console.warn('offer sdp')
  console.log(offerSDP) // { type: 'offer', sdp: 'xxx……' }

  // 2. 将 offer 设置为 rtcPC 的本地描述
  await rtcPC.value?.setLocalDescription(offerSDP)

  // 3. 调用 API 交换 sdp
  // 将 offer 发送给 SRS 服务
  // NOTE: 被官网的这个地址误导了 http://192.168.1.170:1985/api/v1
  // 以为 /rtc/v1/publish/ 要加上这个前缀地址才行，结果不用
  const { data } = await axios.post('http://localhost:1985/rtc/v1/publish/', {
    api: '/rtc/v1/publish/', // 不写也没事
    streamurl: 'webrtc://localhost/feng/testShare',
    sdp: offerSDP?.sdp,
  })
  if (data.code !== 0) {
    console.error('SRS 服务返回错误，请查看请求参数是否正确！')
    console.log(data)
    return
  }

  // 把 SRS 回的 answer 设置成远程描述，至此，交换完成
  // 创建一个 answer 对象
  const answerSDP = new RTCSessionDescription({ type: 'answer', sdp: data.sdp })
  console.warn('answer sdp')
  console.log(answerSDP)

  rtcPC.value?.setRemoteDescription(answerSDP)
}
</script>

<style></style>

<template>
  <h1 class="font-normal text-xl">浏览器通过 WebRTC 推流到 SRS 服务</h1>

  <div class="control">
    <button class="m-r-2" @click="getUserMedia">获取本地媒体流并推送到 SRS 服务</button>
    <button @click="playLiveMedia">通过 flv.js 播放 SRS 服务媒体流</button>
  </div>

  <div m="t-4">
    <video ref="localVideoRef" muted autoplay class="w-150 h-120 border-2 border-solid border-blue"></video>
    <video ref="remoteVideoRef" muted autoplay controls class="w-150 h-120 border-2 border-solid border-green"></video>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import flvjs from 'flv.js'

const appStreamUrl = ref('feng/testLive')
const noSupportText = ref('暂不支持该浏览器，请尝试切换其他浏览器使用（如新版 Chrome）')
const localVideoRef = ref<HTMLVideoElement>()
const remoteVideoRef = ref<HTMLVideoElement>()
const localStream = ref<MediaStream>()
const rtcPC = ref<RTCPeerConnection>()

// 获取
const getUserMedia = async () => {
  // 1. 创建一个 RTCPeerConnection 对象
  rtcPC.value = new RTCPeerConnection()
  console.warn('RTCPeerConnection')
  console.log(rtcPC.value)
  if (!rtcPC.value) {
    alert(noSupportText.value)
    return
  }

  // 2. 获取媒体流返回 MediaStream 赋值给本地流
  const stream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true })
  localStream.value = stream
  localVideoRef.value!.srcObject = stream

  // 3. 获取本地媒体流视频 + 音频轨道列表，插入到 RTC 里面
  stream.getTracks().forEach((track) => {
    // 这里的本地媒体流 stream 在第二个参数也要一起添加进去
    // TODO: 貌似不需要也能正常走完流程，回头再看
    rtcPC.value?.addTrack(track)
  })

  // 4. 与 SRS 交换信息
  handleNegotiation()
}

// 播放
const playLiveMedia = () => {
  if (!flvjs.isSupported()) {
    alert(noSupportText.value)
    return
  }
  const flvPlayer = flvjs.createPlayer({
    type: 'flv',
    url: `http://localhost:8080/${appStreamUrl.value}.flv`,
  })
  flvPlayer.attachMediaElement(remoteVideoRef.value!)
  flvPlayer.load()
  flvPlayer.play()
}

// 协商：交换会话描述信息 offer 和 answer
const handleNegotiation = async () => {
  // 1. 创建 offer sdp (session description)
  const offer = await rtcPC.value?.createOffer()
  console.warn('offer sdp')
  // { type: 'offer', sdp: 'xxx……' }
  console.log(offer)

  // 2. 将 offer 设置为 RTC 的本地描述
  await rtcPC.value?.setLocalDescription(offer)

  // 3. 将 offer 发送给 SRS 服务
  const { data } = await axios.post('http://localhost:1985/rtc/v1/publish/', {
    api: '/rtc/v1/publish/', // 不写也行
    streamurl: `webrtc://localhost:8080/${appStreamUrl.value}`,
    sdp: offer?.sdp,
  })
  if (data.code !== 0) {
    console.error('SRS 服务返回错误，检查请求参数是否正确！')
    console.log(data)
    return
  }

  // 4. 通过 SRS 返回的 sdp 信息创建 answer sdp 对象
  const answer = new RTCSessionDescription({ type: 'answer', sdp: data.sdp })
  console.warn('answer sdp')
  console.log(answer)

  // 5. 将 answer 设置成远程描述
  // 至此，ICE 交换流程完成！
  rtcPC.value?.setRemoteDescription(answer)
}
</script>

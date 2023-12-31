<template>
  <router-link to="/">返回 </router-link>
  <h2 class="font-normal text-xl">浏览器通过 WebRTC 推流到 SRS 服务</h2>
  <div class="preview">
    <button @click="getUserMedia">分享内容并推流</button>
    <p>
      <video ref="localVideoRef" muted autoplay class="w-140 h-100 border-2 border-solid border-blue"></video>
    </p>
    <play-flv />
  </div>
</template>

<script setup lang="ts">
import axios from 'axios'
import { NO_SUPPORT_TEXT, APP_STREAM_NAME } from '@/constant'
import playFlv from './play-flv.vue'

const localVideoRef = ref<HTMLVideoElement>()
const localStream = ref<MediaStream>()
const rtcPC = ref<RTCPeerConnection>()

// 获取
const getUserMedia = async () => {
  // 1. 创建一个 RTCPeerConnection 对象
  rtcPC.value = new RTCPeerConnection()
  console.warn('RTCPeerConnection')
  console.log(rtcPC.value)
  if (!rtcPC.value) {
    alert(NO_SUPPORT_TEXT)
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
    // api 为空也行，最好也写上吧
    api: '/rtc/v1/publish/',
    // NOTE: 发现这个 streamurl 怎么写都行，主要拉流的时候参考 http://localhost:1985/api/v1/streams/
    // 里面的 url 参数，用 http://localhost:8080 + url 即可，不过最好还是按照约定的格式来写
    // streamurl: `/a/b`, // url 为 a/b
    // streamurl: `a://b/c`, // url 为 __defaultApp__/c
    // streamurl: `a://b/c/d`, // url 为 /c/d
    streamurl: `webrtc://xxx/${APP_STREAM_NAME}`, // url 为 /${APP_STREAM_NAME}
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

  // NOTE: 如果 SRS 返回为 code=0
  // 确认代码没有问题，那么去看看 CANDIDATE 的 ip 是不是变了
}
</script>

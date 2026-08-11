import { Browser } from '@capacitor/browser'
import { Capacitor } from '@capacitor/core'

export function videoPlatformLabel(url) {
  try {
    const hostname=new URL(url).hostname.toLowerCase()
    if(hostname.includes('bilibili.com')||hostname.includes('b23.tv'))return '在 B 站观看'
    if(hostname.includes('youtube.com')||hostname.includes('youtu.be'))return '在 YouTube 观看'
    if(hostname.includes('douyin.com'))return '在抖音观看'
  } catch {}
  return '打开教学视频'
}

export async function openExternalUrl(url) {
  const value=String(url||'').trim()
  if(!/^https?:\/\//i.test(value))throw new Error('请输入以 http:// 或 https:// 开头的视频链接')
  if(window.electronAPI?.openExternal) {
    await window.electronAPI.openExternal(value)
    return
  }
  if(Capacitor.isNativePlatform()) {
    await Browser.open({url:value,presentationStyle:'popover'})
    return
  }
  const opened=window.open(value,'_blank','noopener,noreferrer')
  if(!opened)window.location.href=value
}

import { App } from '@capacitor/app'
import { Camera, CameraErrorCode, EncodingType, MediaTypeSelection } from '@capacitor/camera'
import { Capacitor } from '@capacitor/core'

const pendingCameraKey='ranji-pending-camera-result'

export function isNativeApp(){return Capacitor.isNativePlatform()}

export function cameraResultToPreview(result){
  if(!result)return ''
  if(result.webPath)return result.webPath
  if(result.uri)return Capacitor.convertFileSrc(result.uri)
  if(result.thumbnail)return result.thumbnail.startsWith('data:')?result.thumbnail:'data:image/jpeg;base64,'+result.thumbnail
  return ''
}

export async function takeNativePhoto(){
  try{return await Camera.takePhoto({quality:82,targetWidth:1600,targetHeight:1600,correctOrientation:true,encodingType:EncodingType.JPEG,saveToGallery:false,editable:'no',includeMetadata:false,webUseInput:true})}
  catch(error){throw normalizeCameraError(error)}
}

export async function chooseNativePhoto(){
  try{const media=await Camera.chooseFromGallery({mediaType:MediaTypeSelection.Photo,allowMultipleSelection:false,quality:82,targetWidth:1600,targetHeight:1600,correctOrientation:true,editable:'no',includeMetadata:false,webUseInput:true});return media.results[0]||null}
  catch(error){throw normalizeCameraError(error)}
}

function normalizeCameraError(error){
  const code=error?.code||''
  const cancelled=[CameraErrorCode.TakePhotoCancelled,CameraErrorCode.ChooseMediaCancelled,CameraErrorCode.EditPhotoCancelled].includes(code)
  const permission=[CameraErrorCode.CameraPermissionDenied,CameraErrorCode.GalleryPermissionDenied].includes(code)
  const message=cancelled?'已取消选择':permission?'没有相机或相册权限，请在系统设置中允许后重试':error?.message||'无法调用相机，请检查设备相机和权限'
  return {code,message,cancelled,permission,original:error}
}

export function consumePendingCameraResult(){
  try{const value=localStorage.getItem(pendingCameraKey);if(!value)return null;localStorage.removeItem(pendingCameraKey);return JSON.parse(value)}catch{return null}
}

export async function setupNativeCameraRestore(){
  if(!isNativeApp())return
  await App.addListener('appRestoredResult',function(event){
    if(event.pluginId!=='Camera'||!event.success||!event.data)return
    localStorage.setItem(pendingCameraKey,JSON.stringify(event.data))
    window.dispatchEvent(new CustomEvent('ranji-camera-restored',{detail:event.data}))
  })
}

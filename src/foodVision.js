import { Capacitor, CapacitorHttp } from '@capacitor/core'

const systemPrompt=`你是健身饮食记录应用的食物营养识别助手。请根据照片识别所有可见食物，并估算可食用重量与营养。
要求：
1. 不要把餐具、包装或背景当作食物。
2. 无法确定份量时给出保守的中位估算，并降低 confidence。
3. calories、protein、carbs、fat 都是整张照片中食物的总量，单位分别为 kcal、g、g、g。
4. title 使用简短中文餐名；detail 列出主要食物及估算克数，用“ · ”分隔。
5. 如果图片不是食物、过于模糊或无法可靠判断，needsReview=true，并在 warning 中说明原因。
6. 只输出 JSON，不要输出 Markdown。
JSON 格式：{"title":"","detail":"","calories":0,"protein":0,"carbs":0,"fat":0,"confidence":0,"needsReview":false,"warning":""}`

function trimSlash(value){return String(value||'').trim().replace(/\/+$/,'')}

function apiUrl(config,path){
  const base=trimSlash(config.baseUrl)
  if(!base)throw new Error('请先在设置中填写模型接口地址')
  return base+path
}

function requestHeaders(config){
  const headers={'Content-Type':'application/json'}
  if(config.apiKey)headers.Authorization='Bearer '+String(config.apiKey).trim()
  return headers
}

function validateConfig(config){
  if(!config||config.provider==='demo')throw new Error('演示识别已停用，请在设置中选择真实模型服务')
  if(!String(config.model||'').trim())throw new Error('请先在设置中填写视觉模型名称')
  if(config.provider==='openai'&&!String(config.apiKey||'').trim())throw new Error('请先在设置中填写 API Key')
}

function number(value,max){
  const parsed=Number(value)
  if(!Number.isFinite(parsed))return 0
  return Math.round(Math.min(max,Math.max(0,parsed)))
}

function confidence(value){
  const parsed=Number(value)
  if(!Number.isFinite(parsed))return 0.5
  return Math.min(1,Math.max(0,parsed))
}

function extractText(data){
  const content=data?.choices?.[0]?.message?.content
  if(typeof content==='string')return content
  if(Array.isArray(content))return content.map(function(item){return item?.text||''}).join('')
  if(typeof data?.output_text==='string')return data.output_text
  throw new Error('模型没有返回可读取的识别结果')
}

export function parseFoodVisionResult(value){
  const text=typeof value==='string'?value:extractText(value)
  const cleaned=text.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'')
  let parsed
  try{parsed=JSON.parse(cleaned)}catch{throw new Error('模型返回的不是有效 JSON，请更换模型或重试')}
  const result={
    title:String(parsed.title||'识别到的餐食').trim().slice(0,40),
    detail:String(parsed.detail||'').trim().slice(0,300),
    calories:number(parsed.calories,10000),
    protein:number(parsed.protein,1000),
    carbs:number(parsed.carbs,2000),
    fat:number(parsed.fat,1000),
    confidence:confidence(parsed.confidence),
    needsReview:Boolean(parsed.needsReview),
    warning:String(parsed.warning||'').trim().slice(0,180)
  }
  if(!result.detail)throw new Error('模型没有识别出食物明细，请换一张更清晰的照片')
  if(result.confidence<0.6)result.needsReview=true
  return result
}

function browserRequestUrl(value){
  try{
    const target=new URL(value)
    const hostname=globalThis.location?.hostname
    if((hostname==='localhost'||hostname==='127.0.0.1')&&target.hostname==='api.openai.com')return '/__ranji-openai'+target.pathname+target.search
  }catch{}
  return value
}

async function webRequest(url,headers,body){
  const response=await fetch(browserRequestUrl(url),{method:'POST',headers,body:JSON.stringify(body)})
  const text=await response.text()
  let data
  try{data=text?JSON.parse(text):{}}catch{data={error:{message:text||'接口返回了无法解析的内容'}}}
  return {status:response.status,data}
}

async function modelRequest(url,headers,body){
  if(globalThis.electronAPI?.requestModel)return globalThis.electronAPI.requestModel({url,headers,body})
  if(Capacitor.isNativePlatform()){
    const response=await CapacitorHttp.post({url,headers,data:body,connectTimeout:20000,readTimeout:90000})
    return {status:response.status,data:response.data}
  }
  return webRequest(url,headers,body)
}

async function blobToDataUrl(blob){
  return new Promise(function(resolve,reject){const reader=new FileReader();reader.onload=function(){resolve(String(reader.result||''))};reader.onerror=function(){reject(new Error('无法读取所选图片'))};reader.readAsDataURL(blob)})
}

export async function imageSourceToDataUrl(source){
  if(!source)throw new Error('请先拍照或选择一张食物图片')
  if(String(source).startsWith('data:image/'))return String(source)
  const response=await fetch(source)
  if(!response.ok)throw new Error('无法读取相机照片，请重新拍摄')
  return blobToDataUrl(await response.blob())
}

function buildFoodRequest(config,imageDataUrl,useJsonMode=true){
  const body={
    model:String(config.model).trim(),
    messages:[
      {role:'system',content:systemPrompt},
      {role:'user',content:[
        {type:'text',text:'识别这张食物照片，估算整份餐食的重量和营养。注意检查隐藏油脂、酱汁和饮料。'},
        {type:'image_url',image_url:{url:imageDataUrl,detail:'high'}}
      ]}
    ],
    temperature:0.1,
    max_tokens:700
  }
  if(useJsonMode)body.response_format={type:'json_object'}
  return body
}

function requestError(response){
  const message=response?.data?.error?.message||response?.data?.message||('模型请求失败（HTTP '+response.status+'）')
  const error=new Error(String(message))
  error.status=response.status
  return error
}

export async function analyzeFoodImage(source,config){
  validateConfig(config)
  const imageDataUrl=await imageSourceToDataUrl(source)
  const url=apiUrl(config,'/chat/completions')
  const headers=requestHeaders(config)
  let response=await modelRequest(url,headers,buildFoodRequest(config,imageDataUrl,true))
  if(response.status>=400&&/response_format|json_object/i.test(String(response?.data?.error?.message||''))){
    response=await modelRequest(url,headers,buildFoodRequest(config,imageDataUrl,false))
  }
  if(response.status<200||response.status>=300)throw requestError(response)
  return parseFoodVisionResult(response.data)
}

export async function testVisionModel(config){
  validateConfig(config)
  const body={model:String(config.model).trim(),messages:[{role:'user',content:'只回复 OK'}],temperature:0,max_tokens:8}
  const response=await modelRequest(apiUrl(config,'/chat/completions'),requestHeaders(config),body)
  if(response.status<200||response.status>=300)throw requestError(response)
  return true
}

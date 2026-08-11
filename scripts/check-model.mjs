import { readFile } from 'node:fs/promises'
import { extname, resolve } from 'node:path'

const imagePath=process.argv[2]
const baseUrl=String(process.env.MODEL_BASE_URL||'https://api.openai.com/v1').replace(/\/+$/,'')
const model=process.env.MODEL_NAME||'gpt-4.1-mini'
const apiKey=process.env.MODEL_API_KEY||''

if(!imagePath)throw new Error('请传入图片路径，例如：npm run test:model -- E:\\food.jpg')
if(!apiKey&&baseUrl.includes('api.openai.com'))throw new Error('请先设置 $env:MODEL_API_KEY，不要把密钥写进脚本')

const mimeTypes={'.png':'image/png','.webp':'image/webp','.gif':'image/gif'}
const absolutePath=resolve(imagePath)
const mimeType=mimeTypes[extname(absolutePath).toLowerCase()]||'image/jpeg'
const image=await readFile(absolutePath)
const imageUrl=`data:${mimeType};base64,${image.toString('base64')}`

const response=await fetch(baseUrl+'/chat/completions',{
  method:'POST',
  headers:{...(apiKey?{Authorization:'Bearer '+apiKey}:{}),'Content-Type':'application/json'},
  body:JSON.stringify({
    model,
    messages:[{
      role:'user',
      content:[
        {type:'text',text:'识别图片中的食物，只输出 JSON，字段为 title、detail、calories、protein、carbs、fat、confidence。'},
        {type:'image_url',image_url:{url:imageUrl,detail:'high'}}
      ]
    }],
    response_format:{type:'json_object'},
    temperature:0.1,
    max_tokens:700
  })
})

const text=await response.text()
let data
try{data=JSON.parse(text)}catch{data=text}

console.log('HTTP:',response.status)
console.log('顶层字段:',data&&typeof data==='object'?Object.keys(data):'非 JSON')
console.log('完整响应:')
console.dir(data,{depth:10,colors:true})

if(!response.ok)process.exitCode=1
else if(!data?.choices?.[0]?.message?.content){
  console.error('\n未找到 choices[0].message.content。请把上面的“顶层字段”和响应结构发给开发者，注意不要发送 API Key。')
  process.exitCode=2
}else{
  console.log('\n应用要读取的内容:')
  console.log(data.choices[0].message.content)
}
import test from 'node:test'
import assert from 'node:assert/strict'
import { analyzeFoodImage, parseFoodVisionResult } from '../src/foodVision.js'

test('解析视觉模型 JSON 结果',function(){
  const result=parseFoodVisionResult('{"title":"牛肉饭","detail":"牛肉 120g · 米饭 180g","calories":560,"protein":35,"carbs":68,"fat":17,"confidence":0.86,"needsReview":false,"warning":""}')
  assert.equal(result.title,'牛肉饭')
  assert.equal(result.calories,560)
  assert.equal(result.protein,35)
  assert.equal(result.needsReview,false)
})

test('兼容 Markdown JSON 代码块',function(){
  const result=parseFoodVisionResult('\x60\x60\x60json\n{"title":"沙拉","detail":"生菜 150g","calories":-20,"protein":"3","carbs":8,"fat":1,"confidence":0.4}\n\x60\x60\x60')
  assert.equal(result.calories,0)
  assert.equal(result.protein,3)
  assert.equal(result.needsReview,true)
})
test('拒绝缺少食物明细的结果',function(){
  assert.throws(function(){parseFoodVisionResult('{"title":"未知","detail":""}')},/没有识别出食物明细/)
})


test('使用当前照片调用视觉模型',async function(){
  const originalFetch=globalThis.fetch
  let request
  globalThis.fetch=async function(url,options){request={url,options:JSON.parse(options.body)};return new Response(JSON.stringify({choices:[{message:{content:'{"title":"测试餐","detail":"米饭 100g","calories":120,"protein":3,"carbs":26,"fat":0,"confidence":0.9}'}}]}),{status:200,headers:{'content-type':'application/json'}})}
  try{
    const result=await analyzeFoodImage('data:image/jpeg;base64,TEST',{provider:'custom',baseUrl:'https://example.test/v1',model:'vision-test',apiKey:'test-key'})
    assert.equal(result.title,'测试餐')
    assert.equal(request.url,'https://example.test/v1/chat/completions')
    assert.equal(request.options.messages[1].content[1].image_url.url,'data:image/jpeg;base64,TEST')
    assert.equal(request.options.messages[1].content[0].type,'text')
  }finally{globalThis.fetch=originalFetch}
})

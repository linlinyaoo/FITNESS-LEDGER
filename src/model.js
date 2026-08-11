import { useEffect, useState } from 'react'

export function todayDate() {
  return new Date().toLocaleDateString('sv-SE')
}

const mediaAttribution='© Gym visual — https://gymvisual.com/'
const bilibili=function(keyword){return 'https://search.bilibili.com/all?keyword='+encodeURIComponent(keyword)}
const uniformSets=function(count,reps){return Array.from({length:count},function(){return {weight:0,reps}})}

export const initialTimeline = []
export const initialWeightHistory = []
export const initialExercises = []

export const initialWorkoutTemplates = [
  {
    id:'template-split-chest',
    name:'胸 + 三角肌中束 + 三头肌',
    target:'胸部 / 三角肌中束 / 三头肌',
    warmup:'先做肩袖激活与空杠卧推。杠铃平板卧推第 1 组为 15 次热身组，训练组按 12、10、8 次递进。',
    rest:90,
    videoUrl:bilibili('胸 三角肌中束 三头肌 训练'),
    source:'训练计划/凯圣王谭成义三分化训练计划（优化动图版）',
    exercises:[
      {id:'split-chest-bench',name:'杠铃平板卧推',target:'胸部',sets:[{weight:0,reps:15,label:'热身'},{weight:0,reps:12},{weight:0,reps:10},{weight:0,reps:8}],rest:120,warmup:true,rpe:'RPE 8',scheme:'热身 15 次；训练组 12 / 10 / 8 次',note:'下放时控制速度，肩胛保持后缩下沉。',gifUrl:'/exercise-gifs/0025-EIeI8Vf.gif',videoUrl:bilibili('杠铃平板卧推 教程'),attribution:mediaAttribution},
      {id:'split-chest-incline',name:'哑铃上斜卧推',target:'上胸',sets:uniformSets(4,12),rest:90,warmup:false,rpe:'RPE 8',scheme:'4 组 × 12 次',note:'上斜角度不要过高，避免压力过度转移到肩部。',gifUrl:'/exercise-gifs/0314-ns0SIbU.gif',videoUrl:bilibili('哑铃上斜卧推 教程'),attribution:mediaAttribution},
      {id:'split-chest-dip',name:'双杠臂屈伸（含退阶）',target:'胸部 / 三头肌',sets:uniformSets(4,12),rest:90,warmup:false,rpe:'可做到力竭',scheme:'4 组 × 12 次',note:'力量不足时使用辅助器械或弹力带退阶。',gifUrl:'/exercise-gifs/0251-9WTm7dq.gif',videoUrl:bilibili('双杠臂屈伸 退阶 教程'),attribution:mediaAttribution},
      {id:'split-chest-triceps',name:'仰卧臂屈伸',target:'三头肌',sets:uniformSets(4,15),rest:75,warmup:false,rpe:'RPE 8',scheme:'4 组 × 15 次',note:'固定上臂，主要让肘关节完成屈伸。',gifUrl:'/exercise-gifs/0351-mpKZGWz.gif',videoUrl:bilibili('哑铃仰卧臂屈伸 教程'),attribution:mediaAttribution},
      {id:'split-chest-lateral',name:'哑铃侧平举',target:'三角肌中束',sets:uniformSets(3,20),rest:75,warmup:false,rpe:'不强制 RPE',scheme:'3 组：10 次 + 休息 5 秒 + 10 次',note:'每组前 10 次后短休 5 秒，再完成 10 次。',gifUrl:'/exercise-gifs/0334-DsgkuIt.gif',videoUrl:bilibili('哑铃侧平举 教程'),attribution:mediaAttribution}
    ]
  },
  {
    id:'template-split-back',
    name:'背 + 三角肌后束 + 二头肌',
    target:'背部 / 三角肌后束 / 二头肌',
    warmup:'划船机或轻重量下拉 5 分钟，随后进行肩胛下沉、后缩激活。',
    rest:90,
    videoUrl:bilibili('背部 三角肌后束 二头肌 训练'),
    source:'训练计划/凯圣王谭成义三分化训练计划（优化动图版）',
    exercises:[
      {id:'split-back-one-pulldown',name:'单手钢线下拉',target:'背阔肌',sets:uniformSets(4,12),rest:90,warmup:false,rpe:'前两组 RPE 8，后两组力竭',scheme:'前 2 组 12 次；后 2 组 10 次 + 休息 5 秒 + 5 次',note:'保持躯干稳定，用肘部向下带动。',gifUrl:'/exercise-gifs/3563-U5INZY6.gif',videoUrl:bilibili('单手钢线下拉 教程'),attribution:mediaAttribution},
      {id:'split-back-neutral',name:'对握下拉',target:'背阔肌',sets:uniformSets(4,10),rest:90,warmup:false,rpe:'RPE 8',scheme:'4 组 × 8–12 次',note:'使用平行握把，先下沉肩胛再屈肘下拉。',gifUrl:'/exercise-gifs/0818-rkg41Fb.gif',videoUrl:bilibili('对握高位下拉 教程'),attribution:mediaAttribution},
      {id:'split-back-row',name:'单手器械划船',target:'中背 / 背阔肌',sets:uniformSets(4,12),rest:90,warmup:false,rpe:'前两组 RPE 8，后两组力竭',scheme:'前 2 组 12 次；后 2 组 10 次 + 休息 5 秒 + 5 次',note:'胸部保持稳定，顶端充分收紧背部。',gifUrl:'/exercise-gifs/1313-oROuvrX.gif',videoUrl:bilibili('单手器械划船 教程'),attribution:mediaAttribution},
      {id:'split-back-tbar',name:'T 杠划船',target:'中背',sets:uniformSets(4,12),rest:105,warmup:false,rpe:'RPE 8',scheme:'4 组 × 12–15 次',note:'保持脊柱中立，避免用腰部甩动借力。',gifUrl:'/exercise-gifs/0606-aaXr7ld.gif',videoUrl:bilibili('T杠划船 教程'),attribution:mediaAttribution},
      {id:'split-back-curl',name:'钢线弯举',target:'二头肌',sets:uniformSets(3,12),rest:75,warmup:false,rpe:'RPE 8',scheme:'3 组 × 12 次',note:'肘部固定在身体两侧，避免身体摆动。',gifUrl:'/exercise-gifs/0868-G08RZcQ.gif',videoUrl:bilibili('绳索弯举 教程'),attribution:mediaAttribution}
    ]
  },
  {
    id:'template-split-legs',
    name:'臀腿 + 股四头 + 腘绳肌',
    target:'臀腿 / 股四头肌 / 腘绳肌',
    warmup:'单车 5 分钟，进行髋、膝、踝动态活动，再用徒手深蹲与轻重量髋铰链热身。',
    rest:105,
    videoUrl:bilibili('臀腿 股四头 腘绳肌 训练'),
    source:'训练计划/凯圣王谭成义三分化训练计划（优化动图版）',
    exercises:[
      {id:'split-legs-single-deadlift',name:'单腿硬拉',target:'臀肌 / 腘绳肌',sets:uniformSets(4,12),rest:90,warmup:false,rpe:'RPE 8',scheme:'4 组 × 12 次',note:'髋部向后推，骨盆保持水平。',gifUrl:'/exercise-gifs/1757-gKozT8X.gif',videoUrl:bilibili('单腿硬拉 教程'),attribution:mediaAttribution},
      {id:'split-legs-bulgarian',name:'保加利亚分腿蹲',target:'股四头肌 / 臀肌',sets:uniformSets(4,10),rest:105,warmup:false,rpe:'RPE 8',scheme:'4 组 × 10 次',note:'后脚置于凳面，前脚踩稳并保持膝盖方向与脚尖一致。',gifUrl:'/exercise-gifs/0410-qx4fgX7.gif',videoUrl:bilibili('保加利亚分腿蹲 教程'),attribution:mediaAttribution},
      {id:'split-legs-goblet',name:'高脚杯深蹲',target:'股四头肌 / 臀肌',sets:uniformSets(3,15),rest:90,warmup:false,rpe:'RPE 8',scheme:'3 组 × 15 次',note:'哑铃贴近胸前，下蹲时膝盖与脚尖方向一致。',gifUrl:'/exercise-gifs/1760-yn8yg1r.gif',videoUrl:bilibili('高脚杯深蹲 教程'),attribution:mediaAttribution},
      {id:'split-legs-rdl',name:'罗马尼亚硬拉',target:'腘绳肌 / 臀肌',sets:uniformSets(3,12),rest:105,warmup:false,rpe:'RPE 8',scheme:'3 组 × 12 次',note:'微屈膝，髋部向后移动并保持背部中立。',gifUrl:'/exercise-gifs/1459-rR0LJzx.gif',videoUrl:bilibili('罗马尼亚硬拉 教程'),attribution:mediaAttribution},
      {id:'split-legs-hyperextension',name:'山羊挺身',target:'竖脊肌 / 臀肌',sets:uniformSets(3,8),rest:75,warmup:false,rpe:'RPE 8',scheme:'3 组 × 8 次',note:'以髋关节为轴，顶端不要过度反弓腰椎。',gifUrl:'/exercise-gifs/0488-zkgRrbK.gif',videoUrl:bilibili('山羊挺身 教程'),attribution:mediaAttribution}
    ]
  }
]

export const initialPlans = [
  {id:1,day:'一',label:'周一练胸',active:true,done:false,time:'19:30',reminder:true,templateId:'template-split-chest'},
  {id:2,day:'二',label:'恢复与拉伸',active:false,done:false,time:'21:00',reminder:false,templateId:''},
  {id:3,day:'三',label:'周三练背',active:true,done:false,time:'19:30',reminder:true,templateId:'template-split-back'},
  {id:4,day:'四',label:'恢复与拉伸',active:false,done:false,time:'21:00',reminder:false,templateId:''},
  {id:5,day:'五',label:'周五练臀腿',active:true,done:false,time:'19:30',reminder:true,templateId:'template-split-legs'},
  {id:6,day:'六',label:'低强度活动',active:false,done:false,time:'09:00',reminder:false,templateId:''},
  {id:7,day:'日',label:'完全休息',active:false,done:false,time:'',reminder:false,templateId:''}
]

export const initialPreferences = {calorieTarget:2000,proteinTarget:130,waterTarget:2200,reminders:true,activityOffset:false,profileName:'',goal:'保持健康',reminderLead:10,secondReminder:true}
export const initialModelConfig = {provider:'openai',baseUrl:'https://api.openai.com/v1',model:'gpt-4.1-mini',apiKey:'',autoAnalyze:true,savePhoto:false}

export function templateToExercises(template) {
  return (template?.exercises||[]).map(function (exercise,index) {
    const existingSets=Array.isArray(exercise.sets)?exercise.sets:null
    const setCount=Math.max(1,Number(exercise.sets)||1)
    return {
      id:exercise.id||Date.now()+index,
      name:exercise.name||'未命名动作',
      target:exercise.target||template.target||'全身',
      rest:Math.max(0,Number(exercise.rest??template.rest)||60),
      warmup:Boolean(exercise.warmup),
      videoUrl:exercise.videoUrl||'',
      gifUrl:exercise.gifUrl||'',
      note:exercise.note||'',
      instruction:exercise.instruction||'',
      scheme:exercise.scheme||'',
      rpe:exercise.rpe||'',
      attribution:exercise.attribution||'',
      sets:existingSets?existingSets.map(function(set){return {...set,weight:Math.max(0,Number(set.weight)||0),reps:Math.max(1,Number(set.reps)||10)}}):Array.from({length:setCount},function(){return {weight:Math.max(0,Number(exercise.weight)||0),reps:Math.max(1,Number(exercise.reps)||10)}})
    }
  })
}

export function usePersistentState(key, initialValue) {
  const [value,setValue] = useState(function () {
    try { const cached=localStorage.getItem(key); if(!cached)return initialValue; const parsed=JSON.parse(cached); return !Array.isArray(initialValue)&&initialValue&&typeof initialValue==='object'?{...initialValue,...parsed}:parsed } catch { return initialValue }
  })
  useEffect(function () { localStorage.setItem(key,JSON.stringify(value)) },[key,value])
  return [value,setValue]
}

export function clock(total) { return String(Math.floor(total/60)).padStart(2,'0')+':'+String(total%60).padStart(2,'0') }
export function nowTime() { return new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false}) }

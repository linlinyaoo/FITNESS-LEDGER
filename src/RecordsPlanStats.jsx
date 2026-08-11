import React from 'react'
import { Bell, Check, Dumbbell, ExternalLink, Flame, ListChecks, Play, Plus, TimerReset, Weight } from 'lucide-react'
import { Heading, Stat, Timeline } from './ui.jsx'
import { openExternalUrl, videoPlatformLabel } from './externalBrowser.js'

export function RecordsPage({timeline,intake,burned,filter,setFilter,onModal,onEdit,onDelete}){
  const filters=[['all','全部'],['meal','饮食'],['activity','运动'],['body','身体'],['journal','日记']]
  const visible=filter==='all'?timeline:timeline.filter(function(item){return item.type===filter})
  return <><section className="card ledger"><div><p className="eyebrow">今日健康账单</p><h2>{intake-burned} <small>kcal 净摄入</small></h2></div><div><span>摄入<b>+{intake}</b></span><span>活动<b>-{burned}</b></span><span>记录<b>{timeline.length}</b></span></div></section><section className="section"><Heading eyebrow="2026 年 8 月 10 日" title="全部记录"><button className="round-add" onClick={function(){onModal('food')}}><Plus/></button></Heading><div className="filter-row">{filters.map(function(item){return <button className={filter===item[0]?'active':''} key={item[0]} onClick={function(){setFilter(item[0])}}>{item[1]}</button>})}</div><div className="card records-card">{visible.length?<Timeline entries={visible} onEdit={onEdit} onDelete={onDelete}/>:<div className="empty-state">这个分类暂时没有记录。</div>}</div></section></>
}

export function PlanPage({plans,setPlans,templates,reminders,setReminders,onAdd,onEdit,onStart,onManageTemplates,onToast}){
  const days=['一','二','三','四','五','六','日']
  const weekday=new Date().getDay()
  const [selectedDay,setSelectedDay]=React.useState(days[weekday===0?6:weekday-1])
  const done=plans.filter(function(item){return item.done&&item.active}).length,total=plans.filter(function(item){return item.active}).length
  const selectedPlan=plans.find(function(item){return item.day===selectedDay})
  const selectedTemplate=templates.find(function(item){return String(item.id)===String(selectedPlan?.templateId)})
  const now=new Date(),monday=new Date(now),sunday=new Date(now)
  monday.setDate(now.getDate()-((now.getDay()+6)%7));sunday.setDate(monday.getDate()+6)
  const rangeLabel=new Intl.DateTimeFormat('zh-CN',{month:'long',day:'numeric'}).format(monday)+'—'+new Intl.DateTimeFormat('zh-CN',{month:'long',day:'numeric'}).format(sunday)
  const toggleDone=function(id){setPlans(function(items){return items.map(function(item){return item.id===id?{...item,done:!item.done}:item})})}
  const openVideo=async function(url){try{await openExternalUrl(url)}catch(error){onToast(error.message||'视频链接无法打开')}}
  return <><section className="card plan-summary"><div><p className="eyebrow">本周 · {rangeLabel}</p><h2>凯圣王谭成义三分化计划</h2><p>计划来自项目“训练计划”文件夹。本周安排 {total} 次力量训练，已完成 {done} 次。</p></div><span><b>{done}/{total}</b><small>本周</small></span></section>
    <section className="section plan-calendar-section"><Heading eyebrow="周计划导航" title="选择训练日期"><button className="text-button" onClick={onAdd}><Plus size={17}/>添加计划</button></Heading><div className="week-selector">{days.map(function(day){const plan=plans.find(function(item){return item.day===day});const template=templates.find(function(item){return String(item.id)===String(plan?.templateId)});return <button className={selectedDay===day?'active':''} key={day} onClick={function(){setSelectedDay(day)}}><span>周{day}</span><strong>{plan?.active?(template?.target||plan.label):'休息'}</strong><i className={plan?.done?'done':''}/></button>})}</div></section>
    <section className="plan-detail-layout"><div className="card selected-plan-detail">{selectedPlan?<><div className="selected-plan-head"><div><p className="eyebrow">周{selectedPlan.day} · {selectedPlan.time||'全天'}</p><h2>{selectedPlan.label}</h2><p>{selectedPlan.active?'训练日安排':'恢复日安排'}</p></div><div className="selected-plan-actions"><button className="secondary compact" onClick={function(){onEdit(selectedPlan)}}>编辑计划</button><button className={selectedPlan.done?'secondary compact':'primary compact'} onClick={function(){toggleDone(selectedPlan.id)}}>{selectedPlan.done?<Check size={17}/>:<ListChecks size={17}/>} {selectedPlan.done?'取消完成':'标记完成'}</button></div></div>{selectedPlan.active&&selectedTemplate?<><div className="plan-metrics"><span><Dumbbell size={18}/><b>{selectedTemplate.target}</b><small>训练部位</small></span><span><ListChecks size={18}/><b>{selectedTemplate.exercises?.length||0} 个</b><small>训练动作</small></span><span><TimerReset size={18}/><b>{selectedTemplate.rest||60} 秒</b><small>默认组间隔</small></span></div><div className="warmup-box"><strong>热身提示</strong><p>{selectedTemplate.warmup||'建议先进行 5 分钟低强度热身和目标关节活动。'}</p></div>{selectedTemplate.videoUrl&&<button className="video-link-button full" onClick={function(){openVideo(selectedTemplate.videoUrl)}}><ExternalLink size={17}/>{videoPlatformLabel(selectedTemplate.videoUrl)}整套训练</button>}<div className="plan-exercise-detail"><div className="plan-exercise-title"><p className="eyebrow">动作顺序与离线演示</p><strong>GIF 已打包内置，无网络也可查看</strong></div>{selectedTemplate.exercises.map(function(exercise,index){const setCount=Array.isArray(exercise.sets)?exercise.sets.length:Number(exercise.sets)||1;return <article className="plan-exercise-with-gif" key={exercise.id||index}>{exercise.gifUrl?<img src={exercise.gifUrl} alt={exercise.name+'动作演示'} loading="lazy"/>:<span>{String(index+1).padStart(2,'0')}</span>}<div><strong>{exercise.name}{exercise.warmup&&<em>含热身</em>}</strong><small>{exercise.scheme||((exercise.target||selectedTemplate.target)+' · '+setCount+' 组 × '+(exercise.reps||exercise.sets?.[0]?.reps||10)+' 次')} · 间隔 {exercise.rest||selectedTemplate.rest||60} 秒</small>{exercise.rpe&&<small className="exercise-rpe">{exercise.rpe}</small>}{exercise.note&&<p>{exercise.note}</p>}</div>{exercise.videoUrl&&<button className="video-link-button" onClick={function(){openVideo(exercise.videoUrl)}}><ExternalLink size={15}/>视频</button>}</article>})}<p className="media-attribution">动作媒体：© Gym visual — gymvisual.com</p></div><div className="plan-start-row"><div><strong>准备开始周{selectedDay}训练</strong><small>开始后会载入动作、GIF、组间隔和 RPE 提示，完成记录会写入健康时间线。</small></div><button className="primary large" onClick={function(){onStart(selectedPlan,selectedTemplate)}}><Play size={19} fill="currentColor"/>开始训练</button></div></>:selectedPlan.active?<div className="empty-template"><Dumbbell size={30}/><h3>这个计划还没有关联训练模板</h3><p>前往设置导入或新建模板，再编辑周{selectedDay}计划进行关联。</p><button className="primary" onClick={onManageTemplates}>去设置训练计划库</button></div>:<div className="recovery-detail"><h3>今天安排恢复与放松</h3><p>可以进行低强度步行、拉伸或泡沫轴放松，不必强行完成力量训练。</p></div>}</>:<div className="empty-template"><h3>周{selectedDay}还没有安排</h3><p>添加计划后，可以关联已有训练模板。</p><button className="primary" onClick={onAdd}><Plus size={17}/>添加周{selectedDay}计划</button></div>}</div>
    <aside className="card plan-guide-card"><p className="eyebrow">使用提示</p><h3>怎样查看“周一练胸”？</h3><ol><li>在上方选择“周一”</li><li>查看热身、组数、次数和 RPE</li><li>直接播放内置 GIF 学习动作</li><li>需要长视频时点击 B 站按钮</li><li>点击“开始训练”进入组间计时</li></ol><button className="secondary" onClick={onManageTemplates}>管理训练模板</button></aside></section>
    <section className="section"><Heading eyebrow="循环计划" title="本周安排"/><div className="plan-list">{plans.map(function(item){const template=templates.find(function(templateItem){return String(templateItem.id)===String(item.templateId)});return <article className={'card plan-item '+(item.done?'done':'')+(selectedDay===item.day?' selected':'')} key={item.id}><button className={'day-button '+(item.active?'training':'')} onClick={function(){setSelectedDay(item.day)}}>{item.done?<Check size={18}/>:('周'+item.day)}</button><button className="plan-copy" onClick={function(){setSelectedDay(item.day)}}><strong>{item.label}</strong><small>{item.active?((template?.target||'未关联模板')+' · '+item.time+' · '+(item.reminder?'已提醒':'未提醒')):'恢复与放松'}</small></button><button className="plan-edit" onClick={function(){onEdit(item)}}>编辑</button></article>})}</div></section><section className="card reminder"><span><Bell/></span><div><h3>全局训练提醒</h3><p>{reminders?'训练前按设置时间提醒，未开始时可再次提示。':'提醒已暂停，但计划仍会保留。'}</p></div><label className="switch"><input type="checkbox" checked={reminders} onChange={function(event){setReminders(event.target.checked)}}/><span/></label></section></>
}

function dateAtNoon(value) {
  const date=new Date(value+'T12:00:00')
  return Number.isNaN(date.getTime())?null:date
}

function shortDate(value) {
  const date=dateAtNoon(value)
  return date?new Intl.DateTimeFormat('zh-CN',{month:'numeric',day:'numeric'}).format(date):value
}

function signedWeight(value) {
  if(!Number.isFinite(value))return '暂无变化'
  return (value>0?'+':'')+value.toFixed(1)+' kg'
}

function entryDateObject(entry) {
  const explicit=entry?.date?dateAtNoon(entry.date):null
  if(explicit)return explicit
  const timestamp=Number(entry?.id)
  if(!Number.isFinite(timestamp)||timestamp<1000000000000)return null
  const date=new Date(timestamp)
  if(Number.isNaN(date.getTime()))return null
  date.setHours(12,0,0,0)
  return date
}

function dateLabel(date) {
  return new Intl.DateTimeFormat('zh-CN',{month:'numeric',day:'numeric'}).format(date)
}

export function StatsPage({weightHistory=[],timeline=[],onAddWeight}){
  const [range,setRange]=React.useState('7d')
  const rangeDays={ '7d':7, '30d':30, '90d':90 }[range]
  const normalized=React.useMemo(function(){return weightHistory.map(function(item){return {...item,weight:Number(item.weight),dateObject:dateAtNoon(item.date)}}).filter(function(item){return item.dateObject&&Number.isFinite(item.weight)&&item.weight>0}).sort(function(left,right){return left.dateObject-right.dateObject})},[weightHistory])
  const activities=React.useMemo(function(){return timeline.filter(function(item){return item.type==='activity'}).map(function(item){return {...item,dateObject:entryDateObject(item)}}).filter(function(item){return item.dateObject}).sort(function(left,right){return left.dateObject-right.dateObject})},[timeline])
  const today=new Date()
  today.setHours(12,0,0,0)
  const rangeStart=new Date(today)
  rangeStart.setDate(rangeStart.getDate()-(rangeDays-1))
  const rangeEnd=new Date(today)
  rangeEnd.setDate(rangeEnd.getDate()+1)
  const historical=normalized.filter(function(item){return item.dateObject<=today})
  const visible=historical.filter(function(item){return item.dateObject>=rangeStart})
  const visibleActivities=activities.filter(function(item){return item.dateObject>=rangeStart&&item.dateObject<rangeEnd})
  const latest=historical[historical.length-1]
  const change=visible.length>1?visible[visible.length-1].weight-visible[0].weight:null
  const weights=visible.map(function(item){return item.weight})
  const highest=weights.length?Math.max(...weights):null
  const lowest=weights.length?Math.min(...weights):null
  const burnedCalories=Math.round(visibleActivities.reduce(function(sum,item){return sum+Math.abs(Number(item.calories)||0)},0))

  const bucketCount=7
  const dayMilliseconds=24*60*60*1000
  const bucketMilliseconds=(rangeDays*dayMilliseconds)/bucketCount
  const activityBuckets=Array.from({length:bucketCount},function(){return 0})
  visibleActivities.forEach(function(item){const index=Math.min(bucketCount-1,Math.max(0,Math.floor((item.dateObject-rangeStart)/bucketMilliseconds)));activityBuckets[index]+=1})
  const bucketMaximum=Math.max(0,...activityBuckets)
  const bars=activityBuckets.map(function(value){return bucketMaximum&&value?Math.max(12,Math.round(value/bucketMaximum*100)):0})
  const labels=activityBuckets.map(function(_,index){return dateLabel(new Date(rangeStart.getTime()+index*bucketMilliseconds))})

  const volumeEntries=visibleActivities.filter(function(item){return Number(item.workoutVolume)>0})
  const volumeMaximum=Math.max(0,...volumeEntries.map(function(item){return Number(item.workoutVolume)}))
  const volumePoints=volumeEntries.map(function(item){const x=10+((item.dateObject-rangeStart)/(rangeDays*dayMilliseconds))*580;const y=155-(Number(item.workoutVolume)/Math.max(1,volumeMaximum))*120;return {item,x,y}})
  const volumeLine=volumePoints.map(function(point){return point.x.toFixed(1)+','+point.y.toFixed(1)}).join(' ')
  const latestVolume=volumeEntries[volumeEntries.length-1]

  const width=720,height=220,left=54,right=18,top=18,bottom=40
  const plotWidth=width-left-right,plotHeight=height-top-bottom
  const minWeight=lowest??0,maxWeight=highest??0
  const weightPadding=Math.max(.4,(maxWeight-minWeight)*.2)
  const yMin=Math.floor((minWeight-weightPadding)*10)/10
  const yMax=Math.ceil((maxWeight+weightPadding)*10)/10
  const ySpan=Math.max(1,yMax-yMin)
  const timeSpan=Math.max(1,today-rangeStart)
  const points=visible.map(function(item){return {item,x:left+((item.dateObject-rangeStart)/timeSpan)*plotWidth,y:top+((yMax-item.weight)/ySpan)*plotHeight}})
  const linePoints=points.map(function(point){return point.x.toFixed(1)+','+point.y.toFixed(1)}).join(' ')
  const areaPoints=points.length?(left+','+(top+plotHeight)+' '+linePoints+' '+points[points.length-1].x.toFixed(1)+','+(top+plotHeight)):''
  const yTicks=Array.from({length:4},function(_,index){const ratio=index/3;return {value:yMax-(ySpan*ratio),y:top+(plotHeight*ratio)}})
  const xTicks=Array.from({length:4},function(_,index){const ratio=index/3;const date=new Date(rangeStart.getTime()+timeSpan*ratio);return {x:left+plotWidth*ratio,label:dateLabel(date)}})

  return <div className="stats-page"><div className="range-tabs">{[['7d','7 天'],['30d','30 天'],['90d','90 天']].map(function(item){return <button key={item[0]} className={range===item[0]?'active':''} onClick={function(){setRange(item[0])}}>{item[1]}</button>})}</div><section className="stats-grid"><Stat icon={Dumbbell} tone="lime" label="运动次数" value={visibleActivities.length} unit="次" note="当前区间真实运动记录"/><Stat icon={Flame} tone="orange" label="累计消耗" value={burnedCalories.toLocaleString('zh-CN')} unit="kcal" note="根据运动记录累计"/><Stat icon={Weight} tone="blue" label="当前体重" value={latest?latest.weight.toFixed(1):'--'} unit="kg" note={change===null?'本区间记录不足':('本区间 '+signedWeight(change))}/></section><div className="stats-chart-grid">
    <section className="card chart weight-chart-card"><Heading eyebrow={'最近 '+rangeDays+' 天'} title="体重变化曲线"><button className="text-button weight-add-button" onClick={onAddWeight}><Plus size={16}/>记录体重</button></Heading>{visible.length<2?<div className="weight-empty"><Weight size={34}/><h3>至少记录两次体重后显示曲线</h3><p>填写日期和体重，之后可按 7、30、90 天查看变化。</p><button className="primary" onClick={onAddWeight}><Plus size={17}/>记录体重</button></div>:<><div className="weight-chart-wrap"><svg className="weight-chart-svg" viewBox={'0 0 '+width+' '+height} role="img" aria-label={'最近 '+rangeDays+' 天体重变化曲线'}><defs><linearGradient id="weightArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="currentColor" stopOpacity=".28"/><stop offset="100%" stopColor="currentColor" stopOpacity="0"/></linearGradient></defs>{yTicks.map(function(tick,index){return <g key={'y-'+index}><line className="weight-grid-line" x1={left} x2={width-right} y1={tick.y} y2={tick.y}/><text className="weight-chart-label y" x={left-10} y={tick.y+4}>{tick.value.toFixed(1)}</text></g>})}{xTicks.map(function(tick,index){return <text className="weight-chart-label x" key={'x-'+index} x={tick.x} y={height-14}>{tick.label}</text>})}<polygon className="weight-area" points={areaPoints}/><polyline className="weight-line" points={linePoints}/>{points.map(function(point,index){return <g className="weight-point-group" key={point.item.id||point.item.date+'-'+index}><circle className="weight-point-halo" cx={point.x} cy={point.y} r="9"/><circle className="weight-point" cx={point.x} cy={point.y} r="4.5"/><title>{point.item.date+' · '+point.item.weight.toFixed(1)+' kg'}</title></g>})}<g className="weight-latest-label"><rect x={Math.min(width-88,Math.max(left,points[points.length-1].x-34))} y={Math.max(4,points[points.length-1].y-38)} width="68" height="25" rx="8"/><text x={Math.min(width-54,Math.max(left+34,points[points.length-1].x))} y={Math.max(21,points[points.length-1].y-21)}>{points[points.length-1].item.weight.toFixed(1)+' kg'}</text></g></svg></div><div className="weight-summary"><div><span>区间变化</span><strong className={change>0?'up':change<0?'down':''}>{signedWeight(change)}</strong></div><div><span>最高体重</span><strong>{highest.toFixed(1)} kg</strong></div><div><span>最低体重</span><strong>{lowest.toFixed(1)} kg</strong></div><div><span>记录次数</span><strong>{visible.length} 次</strong></div></div><div className="weight-period-note"><span>{shortDate(visible[0].date)} · {visible[0].weight.toFixed(1)} kg</span><i/><span>{shortDate(visible[visible.length-1].date)} · {visible[visible.length-1].weight.toFixed(1)} kg</span></div></>}</section>
    <section className="card chart"><Heading eyebrow={'最近 '+rangeDays+' 天'} title="运动记录分布" action={visibleActivities.length+' 次'}/>{visibleActivities.length?<div className="bars">{bars.map(function(barHeight,index){return <div key={index}><span style={{height:barHeight+'%'}}/><small>{labels[index]}</small></div>})}</div>:<div className="weight-empty"><Dumbbell size={34}/><h3>还没有运动记录</h3><p>完成训练或手动添加运动后，这里才会生成真实统计。</p></div>}</section><section className="card chart"><Heading eyebrow="力量趋势" title="训练容量" action={latestVolume?Math.round(latestVolume.workoutVolume).toLocaleString('zh-CN')+' kg':'暂无'}/>{volumePoints.length>1?<svg viewBox="0 0 600 180" preserveAspectRatio="none"><polyline points={volumeLine} fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>{volumePoints.map(function(point,index){return <circle key={index} cx={point.x} cy={point.y} r="5" fill="currentColor"><title>{dateLabel(point.item.dateObject)+' · '+Math.round(point.item.workoutVolume)+' kg'}</title></circle>})}</svg>:<div className="weight-empty"><Dumbbell size={34}/><h3>至少完成两次训练后显示趋势</h3><p>训练容量根据已完成组的重量 × 次数累计，不再显示演示曲线。</p></div>}</section></div></div>
}

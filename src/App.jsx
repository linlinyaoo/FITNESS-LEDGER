import { useEffect, useMemo, useState } from 'react'
import { Bell, Check } from 'lucide-react'
import { initialExercises, initialModelConfig, initialPlans, initialPreferences, initialTimeline, initialWeightHistory, initialWorkoutTemplates, nowTime, templateToExercises, todayDate, usePersistentState } from './model.js'
import { Brand, Nav, navigation } from './ui.jsx'
import { TodayPage } from './TodayPage.jsx'
import { WorkoutPage, WorkoutSession } from './WorkoutPage.jsx'
import { PlanPage, RecordsPage, StatsPage } from './RecordsPlanStats.jsx'
import { SettingsPage } from './SettingsPage.jsx'
import { CalorieModal, EntryModal, ImportWorkoutPlanModal, NotificationsModal, PlanModal, PomodoroModal, ProfileModal, WorkoutEditorModal, WorkoutTemplateModal } from './Modals.jsx'

const pageTitles={today:'今日概览',workout:'训练中心',records:'健康记录',plan:'训练计划',stats:'数据统计',settings:'设置'}
const defaultWorkoutMeta={title:'选择训练计划',target:'未选择动作',planId:null}

function entryWeight(entry) {
  const value=Number(entry?.weight??String(entry?.value||'').replace(/[^\d.-]/g,''))
  return Number.isFinite(value)&&value>0?value:null
}

function normalizeTemplate(input,index=0) {
  if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('计划模板必须是 JSON 对象')
  if(!String(input.name||'').trim())throw new Error('每个计划都必须填写训练名称 name')
  const defaultRest=Math.max(0,Number(input.rest)||60)
  const exercises=(Array.isArray(input.exercises)?input.exercises:[]).filter(function(item){return item&&typeof item==='object'}).map(function(item,exerciseIndex){
    const existingSets=Array.isArray(item.sets)?item.sets:[]
    return {
      id:item.id||('exercise-'+Date.now()+'-'+index+'-'+exerciseIndex),
      name:String(item.name||('动作 '+(exerciseIndex+1))).trim(),
      target:String(item.target||input.target||'全身').trim(),
      sets:existingSets.length?existingSets.map(function(set){return {...set,weight:Math.max(0,Number(set.weight)||0),reps:Math.max(1,Number(set.reps)||10)}}):Math.max(1,Number(item.sets)||3),
      reps:Math.max(1,Number(item.reps??existingSets[0]?.reps)||10),
      weight:Math.max(0,Number(item.weight??existingSets[0]?.weight)||0),
      rest:Math.max(0,Number(item.rest??defaultRest)||defaultRest),
      warmup:Boolean(item.warmup),
      videoUrl:String(item.videoUrl||'').trim(),
      gifUrl:String(item.gifUrl||'').trim(),
      note:String(item.note||'').trim(),
      instruction:String(item.instruction||'').trim(),
      scheme:String(item.scheme||'').trim(),
      rpe:String(item.rpe||'').trim(),
      attribution:String(item.attribution||'').trim()
    }
  })
  if(!exercises.length)throw new Error('训练模板至少需要一个 exercises 动作')
  return {
    id:input.id||('template-'+Date.now()+'-'+index),
    name:String(input.name).trim(),
    target:String(input.target||'全身').trim(),
    warmup:String(input.warmup||'').trim(),
    rest:defaultRest,
    videoUrl:String(input.videoUrl||'').trim(),
    exercises
  }
}

export default function App({currentUser,onLogout}){
  const storagePrefix='ranji-user-'+currentUser.id+'-'
  const [tab,setTab]=useState('today')
  const [timeline,setTimeline]=usePersistentState(storagePrefix+'timeline',initialTimeline)
  const [weightHistory,setWeightHistory]=usePersistentState(storagePrefix+'weight-history',initialWeightHistory)
  const [exercises,setExercises]=usePersistentState(storagePrefix+'exercises',initialExercises)
  const [plans,setPlans]=usePersistentState(storagePrefix+'plans',initialPlans)
  const [workoutTemplates,setWorkoutTemplates]=usePersistentState(storagePrefix+'workout-templates',initialWorkoutTemplates)
  const [preferences,setPreferences]=usePersistentState(storagePrefix+'preferences',initialPreferences)
  const [modelConfig,setModelConfig]=usePersistentState(storagePrefix+'model-config',initialModelConfig)
  const [recordFilter,setRecordFilter]=useState('all')
  const [modal,setModal]=useState(null)
  const [toast,setToast]=useState('')
  const [session,setSession]=useState(false)
  const [finished,setFinished]=useState(false)
  const [paused,setPaused]=useState(false)
  const [exerciseIndex,setExerciseIndex]=useState(0)
  const [setIndex,setSetIndex]=useState(0)
  const [doneSets,setDoneSets]=useState([])
  const [seconds,setSeconds]=useState(0)
  const [rest,setRest]=useState(0)
  const [restPaused,setRestPaused]=useState(false)
  const [workoutMeta,setWorkoutMeta]=useState(defaultWorkoutMeta)

  useEffect(function(){if(!session||finished||paused)return;const timer=setInterval(function(){setSeconds(function(value){return value+1})},1000);return function(){clearInterval(timer)}},[session,finished,paused])
  useEffect(function(){if(!rest||restPaused||paused)return;const timer=setTimeout(function(){setRest(function(value){return Math.max(0,value-1)})},1000);return function(){clearTimeout(timer)}},[rest,restPaused,paused])
  useEffect(function(){if(!toast)return;const timer=setTimeout(function(){setToast('')},2400);return function(){clearTimeout(timer)}},[toast])
  useEffect(function(){if(modelConfig.provider==='demo')setModelConfig(function(current){return {...current,provider:'openai'}})},[])
  useEffect(function(){
    const bodyEntries=timeline.filter(function(item){return item.type==='body'&&entryWeight(item)!==null})
    if(!bodyEntries.length)return
    setWeightHistory(function(items){let changed=false;const next=items.slice();bodyEntries.forEach(function(entry){if(next.some(function(item){return String(item.sourceId)===String(entry.id)}))return;changed=true;next.push({id:'weight-'+entry.id,sourceId:entry.id,date:entry.date||todayDate(),weight:entryWeight(entry)})});return changed?next.sort(function(left,right){return left.date.localeCompare(right.date)}):items})
  },[])

  const intake=useMemo(function(){return timeline.filter(function(item){return item.type==='meal'}).reduce(function(sum,item){return sum+(Number(item.calories)||0)},0)},[timeline])
  const burned=useMemo(function(){return Math.abs(timeline.filter(function(item){return item.type==='activity'}).reduce(function(sum,item){return sum+(Number(item.calories)||0)},0))},[timeline])

  const openModal=function(type,data){setModal({type,data})}
  const closeModal=function(){setModal(null)}
  const notify=function(message){setToast(message)}

  const addOrUpdateEntry=function(entry){const savedEntry=entry.id?{...entry}:{...entry,id:Date.now()};if(savedEntry.type==='body'){const weight=entryWeight(savedEntry);if(weight===null){notify('请输入有效体重');return}savedEntry.weight=weight;savedEntry.value=weight.toFixed(1)+' kg';savedEntry.date=savedEntry.date||todayDate();setWeightHistory(function(items){const record={id:'weight-'+savedEntry.id,sourceId:savedEntry.id,date:savedEntry.date,weight};const exists=items.some(function(item){return String(item.sourceId)===String(savedEntry.id)});const next=exists?items.map(function(item){return String(item.sourceId)===String(savedEntry.id)?{...item,...record,id:item.id||record.id}:item}):items.concat([record]);return next.sort(function(left,right){return left.date.localeCompare(right.date)})})}setTimeline(function(items){const exists=items.some(function(item){return item.id===savedEntry.id});const next=exists?items.map(function(item){return item.id===savedEntry.id?savedEntry:item}):items.concat([savedEntry]);return next.sort(function(left,right){return left.time.localeCompare(right.time)})});closeModal();notify(entry.id?'记录已更新':'记录已经保存')}
  const deleteEntry=function(entry){if(!window.confirm('确定删除“'+entry.title+'”吗？'))return;setTimeline(function(items){return items.filter(function(item){return item.id!==entry.id})});if(entry.type==='body')setWeightHistory(function(items){return items.filter(function(item){return String(item.sourceId)!==String(entry.id)})});notify('记录已删除')}
  const savePlan=function(plan){setPlans(function(items){const exists=items.some(function(item){return item.id===plan.id});return exists?items.map(function(item){return item.id===plan.id?plan:item}):items.concat([plan])});closeModal();notify('训练计划已保存')}
  const savePreferences=function(next){setPreferences(next);closeModal();notify('设置已保存')}

  const saveWorkoutTemplate=function(value){
    try {
      const normalized=normalizeTemplate(value)
      setWorkoutTemplates(function(items){const exists=items.some(function(item){return String(item.id)===String(normalized.id)});return exists?items.map(function(item){return String(item.id)===String(normalized.id)?normalized:item}):items.concat([normalized])})
      closeModal();notify(value.id?'训练模板已更新':'训练模板已创建')
    } catch(error){notify(error.message||'训练模板保存失败')}
  }
  const importWorkoutTemplates=function(payload){
    const source=Array.isArray(payload)?payload:Array.isArray(payload?.templates)?payload.templates:[payload]
    if(!source.length)throw new Error('没有找到可导入的训练模板')
    const timestamp=Date.now()
    const normalized=source.map(function(item,index){const next=normalizeTemplate(item,index);return {...next,id:'template-'+timestamp+'-'+index}})
    setWorkoutTemplates(function(items){return items.concat(normalized)})
    closeModal();notify('已导入 '+normalized.length+' 个训练模板')
  }
  const deleteWorkoutTemplate=function(template){
    if(!window.confirm('确定删除“'+template.name+'”吗？关联此模板的周计划会保留，但需要重新选择模板。'))return
    setWorkoutTemplates(function(items){return items.filter(function(item){return String(item.id)!==String(template.id)})})
    setPlans(function(items){return items.map(function(item){return String(item.templateId)===String(template.id)?{...item,templateId:''}:item})})
    notify('训练模板已删除')
  }

  const startSession=function(plan,template){
    if(!template&&!exercises.length){notify('请先到训练计划选择一套训练内容');setTab('plan');return}
    if(template){
      const nextExercises=templateToExercises(template)
      if(!nextExercises.length){notify('这个训练模板没有可执行动作');return}
      setExercises(nextExercises)
      setWorkoutMeta({title:plan?.label||template.name,target:template.target||'训练',planId:plan?.id||null})
    } else setWorkoutMeta(defaultWorkoutMeta)
    setSession(true);setFinished(false);setPaused(false);setExerciseIndex(0);setSetIndex(0);setDoneSets([]);setSeconds(0);setRest(0);setTab('workout')
  }
  const adjustSet=function(field,delta){setExercises(function(items){return items.map(function(exercise,index){if(index!==exerciseIndex)return exercise;return {...exercise,sets:exercise.sets.map(function(set,index){return index===setIndex?{...set,[field]:Math.max(field==='reps'?1:0,Number((set[field]+delta).toFixed(1)))}:set})}})})}
  const completeSet=function(){if(paused)return;const exercise=exercises[exerciseIndex];const key=exercise.id+'-'+setIndex;setDoneSets(function(items){return items.includes(key)?items:items.concat([key])});const isLastSet=setIndex===exercise.sets.length-1;const isLastExercise=exerciseIndex===exercises.length-1;if(isLastSet&&isLastExercise){setFinished(true);setRest(0);return}setRest(exercise.rest);setRestPaused(false);if(isLastSet){setExerciseIndex(function(value){return value+1});setSetIndex(0)}else setSetIndex(function(value){return value+1})}
  const skipExercise=function(){if(exerciseIndex===exercises.length-1){setFinished(true);setRest(0)}else{setExerciseIndex(function(value){return value+1});setSetIndex(0);setRest(0)}}
  const saveWorkout=function(){const minutes=Math.max(1,Math.round(seconds/60));const calories=Math.max(180,Math.round(minutes*7.2));const workoutVolume=Math.round(exercises.reduce(function(total,exercise){return total+exercise.sets.reduce(function(sum,set,index){return doneSets.includes(exercise.id+'-'+index)?sum+(Number(set.weight)||0)*(Number(set.reps)||0):sum},0)},0));setTimeline(function(items){return items.concat([{id:Date.now(),date:todayDate(),time:nowTime(),type:'activity',workout:true,workoutVolume,durationMinutes:minutes,completedSets:doneSets.length,title:workoutMeta.title,detail:doneSets.length+' 组 · '+minutes+' 分钟 · '+workoutMeta.target,calories:-calories}]).sort(function(left,right){return left.time.localeCompare(right.time)})});if(workoutMeta.planId)setPlans(function(items){return items.map(function(item){return item.id===workoutMeta.planId?{...item,done:true}:item})});setSession(false);setFinished(false);setTab('records');notify('训练已保存到健康时间线')}

  const exportData=function(){const content=JSON.stringify({exportedAt:new Date().toISOString(),account:{username:currentUser.username},timeline,weightHistory,exercises,plans,workoutTemplates,preferences,modelConfig},null,2);const url=URL.createObjectURL(new Blob([content],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='ranji-data.json';link.click();URL.revokeObjectURL(url);notify('数据导出已开始')}
  const resetData=function(){if(!window.confirm('确定重置当前账号吗？健康记录、体重和训练完成状态会清空，内置三分化计划会恢复。'))return;setTimeline(initialTimeline);setWeightHistory(initialWeightHistory);setExercises(initialExercises);setPlans(initialPlans);setWorkoutTemplates(initialWorkoutTemplates);setPreferences(initialPreferences);setModelConfig(initialModelConfig);setWorkoutMeta(defaultWorkoutMeta);notify('当前账号数据已重置')}

  let content=null
  if(tab==='today')content=<TodayPage timeline={timeline} intake={intake} burned={burned} preferences={preferences} plans={plans} templates={workoutTemplates} onStart={startSession} onOpenPlans={function(){setTab('plan')}} onModal={openModal} onRecords={function(){setTab('records')}}/>
  if(tab==='workout')content=<WorkoutPage exercises={exercises} workoutMeta={workoutMeta} onStart={startSession} onOpenPlans={function(){setTab('plan')}} onEdit={function(){openModal('workout-editor')}} onPomodoro={function(){openModal('pomodoro')}}/>
  if(tab==='records')content=<RecordsPage timeline={timeline} intake={intake} burned={burned} filter={recordFilter} setFilter={setRecordFilter} onModal={openModal} onEdit={function(entry){openModal(entry.type==='meal'?'food':entry.type,entry)}} onDelete={deleteEntry}/>
  if(tab==='plan')content=<PlanPage plans={plans} setPlans={setPlans} templates={workoutTemplates} reminders={preferences.reminders} setReminders={function(value){setPreferences(function(current){return {...current,reminders:value}})}} onAdd={function(){openModal('plan')}} onEdit={function(plan){openModal('plan',plan)}} onStart={startSession} onManageTemplates={function(){setTab('settings')}} onToast={notify}/>
  if(tab==='stats')content=<StatsPage weightHistory={weightHistory} timeline={timeline} onAddWeight={function(){openModal('body')}}/>
  if(tab==='settings')content=<SettingsPage currentUser={currentUser} onLogout={onLogout} preferences={preferences} setPreferences={setPreferences} modelConfig={modelConfig} setModelConfig={setModelConfig} workoutTemplates={workoutTemplates} onProfile={function(){openModal('profile')}} onNotifications={function(){openModal('notifications')}} onExport={exportData} onReset={resetData} onToast={notify} onImportTemplates={function(){openModal('import-workout-template')}} onCreateTemplate={function(){openModal('workout-template')}} onEditTemplate={function(template){openModal('workout-template',template)}} onDeleteTemplate={deleteWorkoutTemplate} onOpenPlans={function(){setTab('plan')}}/>

  if(session)return <WorkoutSession exercises={exercises} workoutMeta={workoutMeta} exerciseIndex={exerciseIndex} setIndex={setIndex} doneSets={doneSets} seconds={seconds} rest={rest} restPaused={restPaused} paused={paused} finished={finished} onBack={function(){setSession(false)}} onComplete={completeSet} onPauseRest={function(){setRestPaused(function(value){return !value})}} onPauseSession={function(){setPaused(function(value){return !value})}} onAddRest={function(){setRest(function(value){return value+30})}} onSkip={function(){setRest(0)}} onSave={saveWorkout} onAdjust={adjustSet} onSkipExercise={skipExercise}/>

  return <div className="app-shell"><aside className="sidebar"><Brand/><nav>{navigation.map(function(item){return <Nav key={item[0]} item={item} active={tab===item[0]} onClick={function(){setTab(item[0])}}/>})}</nav><div className="goal-box"><p className="eyebrow">本周目标</p><strong>{plans.filter(function(item){return item.done&&item.active}).length}/{plans.filter(function(item){return item.active}).length} 次</strong><div className="progress"><span style={{width:(plans.filter(function(item){return item.done&&item.active}).length/Math.max(1,plans.filter(function(item){return item.active}).length)*100)+'%'}}/></div><small>{preferences.goal} · 保持稳定节奏</small></div></aside><main className="main"><header className="topbar"><div><p className="eyebrow">{new Intl.DateTimeFormat('zh-CN',{month:'long',day:'numeric',weekday:'long'}).format(new Date())}</p><h1>{pageTitles[tab]}</h1></div><div className="top-actions"><button className="icon notification-button" onClick={function(){openModal('notifications')}}><Bell size={19}/><i/></button><button className="avatar" title={preferences.profileName||currentUser.username} onClick={function(){openModal('profile')}}>{(preferences.profileName||currentUser.username||'燃').slice(0,1)}</button></div></header><div className="page">{content}</div></main><nav className="mobile-nav">{navigation.map(function(item){return <Nav key={item[0]} item={item} active={tab===item[0]} onClick={function(){setTab(item[0])}}/>})}</nav>
    {modal?.type==='food'&&<EntryModal kind="food" entry={modal.data} modelConfig={modelConfig} onClose={closeModal} onSave={addOrUpdateEntry}/>}
    {modal?.type==='activity'&&<EntryModal kind="activity" entry={modal.data} modelConfig={modelConfig} onClose={closeModal} onSave={addOrUpdateEntry}/>}
    {modal?.type==='body'&&<EntryModal kind="body" entry={modal.data} modelConfig={modelConfig} onClose={closeModal} onSave={addOrUpdateEntry}/>}
    {modal?.type==='journal'&&<EntryModal kind="journal" entry={modal.data} modelConfig={modelConfig} onClose={closeModal} onSave={addOrUpdateEntry}/>}
    {modal?.type==='plan'&&<PlanModal plan={modal.data} templates={workoutTemplates} onClose={closeModal} onSave={savePlan}/>}
    {modal?.type==='workout-template'&&<WorkoutTemplateModal template={modal.data} onClose={closeModal} onSave={saveWorkoutTemplate}/>}
    {modal?.type==='import-workout-template'&&<ImportWorkoutPlanModal onClose={closeModal} onImport={importWorkoutTemplates}/>}
    {modal?.type==='workout-editor'&&<WorkoutEditorModal exercises={exercises} onClose={closeModal} onSave={function(value){setExercises(value);closeModal();notify('今日训练已更新')}}/>}
    {modal?.type==='pomodoro'&&<PomodoroModal onClose={closeModal} onComplete={function(cycles,minutes){notify('完成 '+cycles+' 轮番茄训练，共 '+cycles*minutes+' 分钟')}}/>}
    {modal?.type==='calorie'&&<CalorieModal preferences={preferences} intake={intake} burned={burned} onClose={closeModal} onSave={savePreferences}/>}
    {modal?.type==='notifications'&&<NotificationsModal plans={plans} preferences={preferences} onClose={closeModal}/>}
    {modal?.type==='profile'&&<ProfileModal preferences={preferences} onClose={closeModal} onSave={savePreferences}/>}
    {toast&&<div className="toast"><Check size={17}/>{toast}</div>}
  </div>
}

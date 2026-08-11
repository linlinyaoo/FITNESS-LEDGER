import { Activity, Camera, Dumbbell, Flame, NotebookPen, Play, Utensils, Weight } from 'lucide-react'
import { Heading, Metric, Quick, Timeline } from './ui.jsx'

export function TodayPage({timeline,intake,burned,preferences,plans,templates,onStart,onOpenPlans,onModal,onRecords}){
  const target=preferences.calorieTarget+(preferences.activityOffset?burned:0),remaining=Math.max(target-intake,0),progress=Math.min(intake/Math.max(target,1),1)
  const protein=timeline.filter(function(item){return item.type==='meal'}).reduce(function(sum,item){return sum+(item.protein||0)},0)
  const days=['日','一','二','三','四','五','六']
  const todayPlan=plans.find(function(item){return item.day===days[new Date().getDay()]})
  const todayTemplate=templates.find(function(item){return String(item.id)===String(todayPlan?.templateId)})
  const totalSets=(todayTemplate?.exercises||[]).reduce(function(sum,item){return sum+(Array.isArray(item.sets)?item.sets.length:Number(item.sets)||0)},0)
  const hasWorkout=Boolean(todayPlan?.active&&todayTemplate)
  return <>
    <section className="hero-grid">
      <article className="card calorie-card"><Heading eyebrow="今日热量" title="保持在计划内" action="查看详情" onAction={function(){onModal('calorie')}}/><div className="calorie-content"><button className="calorie-ring" onClick={function(){onModal('calorie')}} style={{'--progress':(progress*360)+'deg'}}><div><strong>{remaining}</strong><span>剩余 kcal</span></div></button><div className="metrics"><Metric icon={Utensils} label="已摄入" value={intake}/><Metric icon={Flame} label="活动消耗" value={burned}/><Metric icon={Activity} label="蛋白质" value={protein} unit={'/ '+preferences.proteinTarget+' g'}/></div></div></article>
      <article className="card next-workout"><div className="workout-label"><span>{hasWorkout?'今日训练':'今日安排'}</span><b>{todayPlan?.time||'全天'}</b></div><div className="workout-art"><Dumbbell size={48}/></div><h2>{todayPlan?.label||'今天还没有计划'}</h2><p>{hasWorkout?(todayTemplate.exercises.length+' 个动作 · '+totalSets+' 组 · '+todayTemplate.target):(todayPlan?.active?'尚未关联训练模板':'恢复、拉伸或低强度活动')}</p><button className={hasWorkout?'primary':'secondary'} onClick={hasWorkout?function(){onStart(todayPlan,todayTemplate)}:onOpenPlans}>{hasWorkout?<Play size={18} fill="currentColor"/>:<Dumbbell size={18}/>} {hasWorkout?'开始训练':'查看周计划'}</button></article>
    </section>
    <section className="section"><Heading eyebrow="快捷操作" title="现在记录"/><div className="quick-grid"><Quick icon={Camera} label="拍照饮食" note="AI 估算" tone="lime" onClick={function(){onModal('food')}}/><Quick icon={Dumbbell} label="添加运动" note="手动消耗" tone="orange" onClick={function(){onModal('activity')}}/><Quick icon={Weight} label="记录体重" note="身体数据" tone="blue" onClick={function(){onModal('body')}}/><Quick icon={NotebookPen} label="写点感受" note="每日复盘" tone="violet" onClick={function(){onModal('journal')}}/></div></section>
    <section className="card timeline-card"><Heading eyebrow="今天" title="健康时间线" action="全部记录" onAction={onRecords}/>{timeline.length?<Timeline entries={timeline.slice(-4)}/>:<div className="empty-state timeline-empty">还没有健康记录。可以从上方拍照饮食、添加运动、记录体重或写日记。</div>}</section>
  </>
}

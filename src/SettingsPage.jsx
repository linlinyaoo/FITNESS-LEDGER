import { useState } from 'react'
import { ArrowRight, Bot, CalendarDays, Database, Download, FileJson, KeyRound, LogOut, Pencil, Plus, RefreshCw, Save, ShieldCheck, SlidersHorizontal, Trash2, UserRound } from 'lucide-react'
import { Heading } from './ui.jsx'
import { testVisionModel } from './foodVision.js'

function SettingRow({title,note,children}){
  return <div className="setting-row"><div><strong>{title}</strong><small>{note}</small></div>{children}</div>
}

export function SettingsPage({currentUser,onLogout,preferences,setPreferences,modelConfig,setModelConfig,workoutTemplates,onProfile,onNotifications,onExport,onReset,onToast,onImportTemplates,onCreateTemplate,onEditTemplate,onDeleteTemplate,onOpenPlans}){
  const [testingModel,setTestingModel]=useState(false)
  const updatePreference=function(key,value){setPreferences(function(current){return {...current,[key]:value}})}
  const updateModel=function(key,value){setModelConfig(function(current){return {...current,[key]:value}})}
  const testConnection=async function(){setTestingModel(true);try{await testVisionModel({...modelConfig,provider:modelConfig.provider==='demo'?'openai':modelConfig.provider});onToast('真实模型连接成功')}catch(error){onToast(error.message||'模型连接失败')}finally{setTestingModel(false)}}
  return <div className="settings-page">
    <section className="card settings-hero"><div><p className="eyebrow">个人中心</p><h2>{preferences.profileName||currentUser.username}</h2><p>@{currentUser.username} · {preferences.goal} · 当前账号独立保存</p></div><button className="secondary" onClick={onProfile}><UserRound size={18}/>编辑资料</button></section>

    <section className="card settings-card account-settings"><Heading eyebrow="本地账号" title="登录与数据隔离"><ShieldCheck/></Heading><div className="account-summary"><div><span>{currentUser.username.slice(0,1)}</span><div><strong>{currentUser.username}</strong><small>注册于 {new Date(currentUser.createdAt).toLocaleDateString('zh-CN')} · 数据仅保存在本机</small></div></div><button className="secondary danger-button" onClick={onLogout}><LogOut size={18}/>退出登录</button></div><p className="settings-tip"><Database size={15}/>不同账号使用不同的本地存储空间。退出不会删除数据，下次登录可继续使用。</p></section>

    <section className="card settings-card"><Heading eyebrow="目标与计算" title="健康目标"/><div className="settings-list">
      <SettingRow title="每日热量目标" note="用于计算今日剩余热量"><div className="inline-input"><input type="number" min="800" max="6000" value={preferences.calorieTarget} onChange={function(event){updatePreference('calorieTarget',Number(event.target.value))}}/><span>kcal</span></div></SettingRow>
      <SettingRow title="蛋白质目标" note="饮食记录会累计蛋白质"><div className="inline-input"><input type="number" min="20" max="400" value={preferences.proteinTarget} onChange={function(event){updatePreference('proteinTarget',Number(event.target.value))}}/><span>g</span></div></SettingRow>
      <SettingRow title="饮水目标" note="为后续饮水记录预留"><div className="inline-input"><input type="number" min="500" step="100" value={preferences.waterTarget} onChange={function(event){updatePreference('waterTarget',Number(event.target.value))}}/><span>ml</span></div></SettingRow>
      <SettingRow title="运动热量抵扣" note="开启后，运动消耗会增加可摄入额度"><label className="switch"><input type="checkbox" checked={preferences.activityOffset} onChange={function(event){updatePreference('activityOffset',event.target.checked)}}/><span/></label></SettingRow>
    </div></section>

    <section className="card settings-card"><Heading eyebrow="通知与计划" title="提醒设置"><button className="text-button" onClick={onNotifications}>查看提醒</button></Heading><div className="settings-list">
      <SettingRow title="训练提醒" note="按照计划时间发送提醒"><label className="switch"><input type="checkbox" checked={preferences.reminders} onChange={function(event){updatePreference('reminders',event.target.checked)}}/><span/></label></SettingRow>
      <SettingRow title="提前提醒" note="训练开始前的提醒时间"><select value={preferences.reminderLead} onChange={function(event){updatePreference('reminderLead',Number(event.target.value))}}><option value="5">提前 5 分钟</option><option value="10">提前 10 分钟</option><option value="20">提前 20 分钟</option><option value="30">提前 30 分钟</option></select></SettingRow>
      <SettingRow title="未开始再次提醒" note="首次提醒后 30 分钟再次提示"><label className="switch"><input type="checkbox" checked={preferences.secondReminder} onChange={function(event){updatePreference('secondReminder',event.target.checked)}}/><span/></label></SettingRow>
    </div></section>

    <section className="card settings-card workout-library"><Heading eyebrow="训练内容管理" title="训练计划库"><CalendarDays/></Heading><div className="library-intro"><div><strong>导入或新建训练模板</strong><p>保存训练部位、训练名称、热身、组数、组间隔和 B 站等教学视频 URL。</p></div><div className="library-actions"><button className="secondary" onClick={onImportTemplates}><FileJson size={18}/>导入计划</button><button className="primary" onClick={onCreateTemplate}><Plus size={18}/>新建模板</button></div></div><div className="template-library-list">{workoutTemplates.length?workoutTemplates.map(function(item){const totalSets=(item.exercises||[]).reduce(function(sum,exercise){return sum+(Array.isArray(exercise.sets)?exercise.sets.length:Number(exercise.sets)||0)},0);return <article className="template-library-item" key={item.id}><span>{item.target||'全身'}</span><div><strong>{item.name}</strong><small>{item.exercises?.length||0} 个动作 · {totalSets} 组 · 默认间隔 {item.rest||60} 秒</small></div><div><button className="icon" title="编辑模板" onClick={function(){onEditTemplate(item)}}><Pencil size={16}/></button><button className="icon danger-button" title="删除模板" onClick={function(){onDeleteTemplate(item)}}><Trash2 size={16}/></button></div></article>}):<div className="empty-state">还没有训练模板，可以导入 JSON 或手动新建。</div>}</div><button className="plan-guide-link" onClick={onOpenPlans}><div><strong>下一步：安排到周计划</strong><small>回到训练计划，选择周一、周二等日期，即可查看“周一练胸”有哪些动作并开始训练。</small></div><ArrowRight size={20}/></button></section>

    <section className="card settings-card"><Heading eyebrow="本地数据" title="数据管理"/><div className="action-grid"><button className="secondary" onClick={onExport}><Download size={18}/>导出 JSON</button><button className="secondary danger-button" onClick={onReset}><RefreshCw size={18}/>重置当前账号</button></div><p className="settings-tip"><Database size={15}/>当前账号使用独立 LocalStorage，导出包含训练模板和健康记录；账号本身暂不支持云同步。</p></section>

    <section className="card settings-card model-settings"><Heading eyebrow="高级设置 · 放在最后" title="AI 食物识别模型"><Bot/></Heading><div className="model-notice"><KeyRound size={18}/><div><strong>密钥安全提示</strong><p>原型仅在浏览器本地保存配置。正式产品应由服务端代理模型请求，不要把生产密钥直接打包到前端。</p></div></div><div className="form settings-form">
      <label><span>模型服务</span><select value={modelConfig.provider==='demo'?'openai':modelConfig.provider} onChange={function(event){updateModel('provider',event.target.value)}}><option value="openai">OpenAI API</option><option value="custom">OpenAI 兼容视觉接口</option></select></label>
      <label><span>模型名称</span><input value={modelConfig.model} onChange={function(event){updateModel('model',event.target.value)}} placeholder="gpt-4.1-mini"/></label>
      <label className="wide"><span>接口地址</span><input value={modelConfig.baseUrl} onChange={function(event){updateModel('baseUrl',event.target.value)}} placeholder="https://api.openai.com/v1"/></label>
      <label className="wide"><span>API Key</span><input type="password" value={modelConfig.apiKey} onChange={function(event){updateModel('apiKey',event.target.value)}} placeholder="仅用于本地原型调试"/></label>
    </div><div className="settings-list compact-list">
      <SettingRow title="拍照后自动分析" note="选中照片后立即进入识别流程"><label className="switch"><input type="checkbox" checked={modelConfig.autoAnalyze} onChange={function(event){updateModel('autoAnalyze',event.target.checked)}}/><span/></label></SettingRow>
      <SettingRow title="保存原始照片" note="默认关闭，减少隐私和存储风险"><label className="switch"><input type="checkbox" checked={modelConfig.savePhoto} onChange={function(event){updateModel('savePhoto',event.target.checked)}}/><span/></label></SettingRow>
    </div><footer className="settings-footer"><button className="secondary" disabled={testingModel} onClick={testConnection}><SlidersHorizontal size={17}/>{testingModel?'正在请求模型…':'测试真实模型'}</button><button className="primary" onClick={function(){onToast('模型配置已保存')}}><Save size={17}/>保存设置</button></footer></section>
  </div>
}

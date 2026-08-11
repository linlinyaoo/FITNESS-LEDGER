import { useState } from 'react'
import { Dumbbell, Flame, LockKeyhole, LogIn, UserPlus, UserRound } from 'lucide-react'
import { loginAccount, registerAccount } from './auth.js'

export function AuthPage({onAuthenticated}){
  const [mode,setMode]=useState('login')
  const [form,setForm]=useState({username:'',password:'',confirmPassword:''})
  const [error,setError]=useState('')
  const [submitting,setSubmitting]=useState(false)
  const update=function(key,value){setForm(function(current){return {...current,[key]:value}});setError('')}
  const switchMode=function(next){setMode(next);setError('');setForm({username:'',password:'',confirmPassword:''})}
  const submit=async function(event){
    event.preventDefault()
    if(mode==='register'&&form.password!==form.confirmPassword){setError('两次输入的密码不一致');return}
    setSubmitting(true)
    try{
      const user=mode==='register'?await registerAccount(form.username,form.password):await loginAccount(form.username,form.password)
      onAuthenticated(user)
    }catch(error){setError(error.message||'操作失败，请重试')}finally{setSubmitting(false)}
  }
  return <main className="auth-page"><section className="auth-showcase"><div className="auth-brand"><span><Flame size={26} fill="currentColor"/></span><div><strong>燃记</strong><small>FITNESS LEDGER</small></div></div><div className="auth-copy"><p className="eyebrow">训练 · 饮食 · 体重 · 专注</p><h1>把每一次改变，<br/>记录成看得见的进步。</h1><p>内置三分化训练计划与离线动作演示。每个本地账号的数据互相隔离，不再自动填充演示记录。</p><div className="auth-features"><span><Dumbbell size={18}/>训练计划与组间计时</span><span><UserRound size={18}/>本地账号独立数据</span><span><LockKeyhole size={18}/>密码摘要保存在本机</span></div></div></section><section className="auth-panel"><div className="auth-card"><div className="auth-tabs"><button className={mode==='login'?'active':''} onClick={function(){switchMode('login')}}>登录</button><button className={mode==='register'?'active':''} onClick={function(){switchMode('register')}}>注册新用户</button></div><div className="auth-card-title"><p className="eyebrow">{mode==='login'?'欢迎回来':'建立你的训练档案'}</p><h2>{mode==='login'?'登录燃记':'创建本地账号'}</h2><p>{mode==='login'?'继续查看你的训练与健康记录。':'新账号没有默认流水、体重或完成记录，只预置训练计划。'}</p></div><form onSubmit={submit}><label><span>用户名</span><div className="auth-input"><UserRound size={18}/><input autoComplete="username" value={form.username} onChange={function(event){update('username',event.target.value)}} placeholder="输入用户名" required/></div></label><label><span>密码</span><div className="auth-input"><LockKeyhole size={18}/><input type="password" autoComplete={mode==='login'?'current-password':'new-password'} value={form.password} onChange={function(event){update('password',event.target.value)}} placeholder="至少 6 位" required/></div></label>{mode==='register'&&<label><span>确认密码</span><div className="auth-input"><LockKeyhole size={18}/><input type="password" autoComplete="new-password" value={form.confirmPassword} onChange={function(event){update('confirmPassword',event.target.value)}} placeholder="再次输入密码" required/></div></label>}{error&&<p className="auth-error">{error}</p>}<button className="primary auth-submit" disabled={submitting}>{mode==='login'?<LogIn size={19}/>:<UserPlus size={19}/>} {submitting?'正在处理…':mode==='login'?'登录':'注册并进入'}</button></form><p className="auth-security">本地账号仅用于当前设备的原型数据隔离，不等同于服务端安全认证或云同步。</p></div></section></main>
}

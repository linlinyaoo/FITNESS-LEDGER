const USERS_KEY='ranji-users'
const SESSION_KEY='ranji-session'

function readJson(key,fallback){
  try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}
}

function readUsers(){
  const users=readJson(USERS_KEY,[])
  return Array.isArray(users)?users:[]
}

async function hashPassword(password){
  const bytes=new TextEncoder().encode(password)
  if(globalThis.crypto?.subtle){
    const digest=await globalThis.crypto.subtle.digest('SHA-256',bytes)
    return Array.from(new Uint8Array(digest),function(value){return value.toString(16).padStart(2,'0')}).join('')
  }
  return btoa(unescape(encodeURIComponent(password)))
}

function publicUser(user){
  return {id:user.id,username:user.username,createdAt:user.createdAt}
}

export function currentAccount(){
  const userId=localStorage.getItem(SESSION_KEY)
  if(!userId)return null
  const user=readUsers().find(function(item){return item.id===userId})
  if(!user){localStorage.removeItem(SESSION_KEY);return null}
  return publicUser(user)
}

export async function registerAccount(username,password){
  const cleanName=String(username||'').trim()
  if(cleanName.length<2)throw new Error('用户名至少需要 2 个字符')
  if(String(password||'').length<6)throw new Error('密码至少需要 6 位')
  const users=readUsers()
  if(users.some(function(item){return item.username.toLocaleLowerCase()===cleanName.toLocaleLowerCase()}))throw new Error('这个用户名已经存在')
  const user={
    id:globalThis.crypto?.randomUUID?.()||('user-'+Date.now()+'-'+Math.random().toString(36).slice(2)),
    username:cleanName,
    passwordHash:await hashPassword(password),
    createdAt:new Date().toISOString()
  }
  localStorage.setItem(USERS_KEY,JSON.stringify(users.concat([user])))
  localStorage.setItem(SESSION_KEY,user.id)
  return publicUser(user)
}

export async function loginAccount(username,password){
  const cleanName=String(username||'').trim().toLocaleLowerCase()
  const user=readUsers().find(function(item){return item.username.toLocaleLowerCase()===cleanName})
  if(!user||user.passwordHash!==await hashPassword(String(password||'')))throw new Error('用户名或密码不正确')
  localStorage.setItem(SESSION_KEY,user.id)
  return publicUser(user)
}

export function logoutAccount(){
  localStorage.removeItem(SESSION_KEY)
}

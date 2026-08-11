import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthPage } from './AuthPage.jsx'
import { currentAccount, logoutAccount } from './auth.js'
import './styles.css'
import { setupNativeCameraRestore } from './nativeCamera.js'

function Root(){
  const [account,setAccount]=useState(function(){return currentAccount()})
  if(!account)return <AuthPage onAuthenticated={setAccount}/>
  return <App key={account.id} currentUser={account} onLogout={function(){logoutAccount();setAccount(null)}}/>
}

async function bootstrap(){
  await setupNativeCameraRestore()
  ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><Root/></React.StrictMode>)
}

bootstrap()

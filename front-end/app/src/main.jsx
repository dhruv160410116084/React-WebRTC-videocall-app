import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import {createBrowserRouter,Router,RouterProvider} from 'react-router-dom'
import Lobby from './Lobby/Lobby.jsx'
import Signup from './Signup/Signup.jsx'
import Login from './Login/Login.jsx'

const router = createBrowserRouter([
  { path:'/',element:<App></App>},
  {path:'/lobby',element: <Lobby/>},
  {path:'/signup',element: <Signup/>},
  {path:'/login',element:<App/>}
])

ReactDOM.createRoot(document.getElementById('root')).render(
  
    <RouterProvider router={router}></RouterProvider>
  
)

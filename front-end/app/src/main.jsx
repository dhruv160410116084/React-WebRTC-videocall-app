import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import {createBrowserRouter,Router,RouterProvider} from 'react-router-dom'
import Lobby from './Lobby/Lobby.jsx'

const router = createBrowserRouter([
  { path:'/',element:<App></App>},
  {path:'/lobby',element: <Lobby/>}
])

ReactDOM.createRoot(document.getElementById('root')).render(
  
    <RouterProvider router={router}></RouterProvider>
  
)

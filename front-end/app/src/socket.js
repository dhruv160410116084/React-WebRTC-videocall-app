import { io } from 'socket.io-client';
// console.log(import.meta)
export const SERVER_URL = import.meta.env.VITE_SERVER_URL
export const socket = io("ws://"+window.location.host+":3000");

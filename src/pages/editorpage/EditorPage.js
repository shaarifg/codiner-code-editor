import React, { useState, useRef, useEffect } from 'react'
import ACTIONS from '../../Action'
import Client from '../../components/client/Client'
import Editor from '../../components/editor/Editor'
import { initSocket } from '../../socket'
import './editorPage.css'
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Button } from '@mui/material'

import logo from '../../assets/logo.png'


const EditorPage = () => {
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location  = useLocation();
  const reactNavigator = useNavigate();
  const {roomId} = useParams();
  const [clients, setClients] = useState([]);
  useEffect(() => {
      const init = async () => {
          socketRef.current = await initSocket();
          socketRef.current.on('connect_error', (err)=>handleErrors(err))
          socketRef.current.on('connect_failed', (err)=>handleErrors(err))

          function handleErrors (e){
            console.log('socket error', e);
            toast.error('Socket connection failed, try again later.');
            reactNavigator('/');
          }
            
          socketRef.current.emit(ACTIONS.JOIN, {
            roomId,
            username: location.state?.username,
          });
          //Listening for joined event
          socketRef.current.on(ACTIONS.JOINED, ({clients, username, socketId}) => {
            if(username !== location.state?.username){
              toast.success( `${username} joined the room.`)
              console.log(`${username} joined`);
            }
            setClients(clients);
            socketRef.current.emit(ACTIONS.SYNC_CODE, {
              code: codeRef.current,
              socketId
            });
          })


          socketRef.current.on(ACTIONS.DISCONNECTED, ({socketId, username})=>{
              toast.success(`${username} left the room.`)
              setClients((prev) =>{
                return prev.filter(client => client.socketId !== socketId)
              })
          })
        }
        init();
        return () =>{
          socketRef.current.disconnect();
          socketRef.current.off(ACTIONS.JOINED)
          socketRef.current.off(ACTIONS.DISCONNECTED);
        }
  },[])

async function copyRoomId(){
  try{
    await navigator.clipboard.writeText(roomId);
    toast.success('Room ID has been copied to the clipboard');
  }catch(err){
    toast.error('Could not copy the Room ID');
    console.error(err);
  }
}

function leaveRoom(){
  reactNavigator('/');
}
   

if(!location.state){
  return <Navigate to='/'/>;
}
  return (
    <main className='mainWrap'>
      <section className='top'>
        <aside>
          <section className='logo'>
          <img src={logo} alt="Main Logo" />
          <span className='logoText'>Codiner</span>
        </section> 
            <div className="buttons">
            <Button variant="contained" onClick={copyRoomId}>Copy RoomId</Button>
            <Button variant="outlined" color="error" onClick={leaveRoom} >Leave</Button>
            </div>
        </aside>
          <div className="clientsList">
            <h4>Connected Geeks</h4>
              <div className="list">  
              {
                  clients.map(client =>
                  (<Client 
                  key={client.socketId} 
                  username ={client.username}/>))
              }
              </div>
          </div>  
      </section>
      
      <div className="editorWrap">
            <Editor socketRef = {socketRef} roomId ={roomId} onCodeChange={(code)=>{codeRef.current = code}}/>
      </div>
    </main>
  )
}

export default EditorPage
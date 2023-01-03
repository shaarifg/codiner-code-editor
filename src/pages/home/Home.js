import React, { useState } from 'react'
import './home.css'
import {v4 as uuidV4} from "uuid"
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import Footer from '../../components/footer/Footer'
import logo from '../../assets/logo.png'
import { Button } from '@mui/material'



const Home = () => {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [username, setUserName] = useState('');
    const createNewRoom=(e)=>{
        e.preventDefault();
        const id = uuidV4();
        setRoomId(id);
        toast.success('New room is created');
        // console.log(id);
    }

    const joinRoom = () =>{
        if(!roomId || !username){
            toast.error('Room ID & username both are required')
            return
        }

        navigate(`/editor/${roomId}`, {
            state:{
                username,
            }
        })

    }

    const handleInputEnter = (e) =>{
        // console.log("event", e.code)
        if(e.code ==='Enter'){
            joinRoom()
        }
    };

  return (
    <div className="homePageWrapper">
        <div className="formWrapper">
            <section className='logo'>
                <img src={logo} alt="Main Logo" />
                <span className='logoText'>Codiner</span>
            </section> 
            <h4 className='mainLabel'>Paste Invitation ROOM ID</h4>
            <div className="inputGroup">
                <input 
                type="text" 
                placeholder='ROOM ID' 
                className='inputBox' 
                value={roomId} 
                onChange={(e) =>setRoomId(e.target.value)}
                onKeyUp={handleInputEnter}
                />

                <input useRef
                type="text" 
                placeholder='USERNAME' className='inputBox' 
                value={username} 
                onChange={(e) =>setUserName(e.target.value)}
                onKeyUp={handleInputEnter}
                />
                <Button variant="contained" onClick={joinRoom} sx={{fontFamily:'Rubik',  width:'100px', float:'left',
            backgroundColor:'#010311'}}>Join</Button>
                <span className='createInfo'>If you don't have an invite then create &nbsp;
                    <a onClick={createNewRoom} href="#" className='createnewBtm'>new room</a>
                </span>
            </div>
        </div>
        <Footer/>
    </div>
  )
}

export default Home
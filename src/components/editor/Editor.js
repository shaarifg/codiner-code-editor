import React, { useEffect, useRef } from 'react'
import Codemirror from 'codemirror';
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/css/css'
import 'codemirror/mode/jsx/jsx'
import 'codemirror/mode/php/php'
import 'codemirror/mode/htmlmixed/htmlmixed'
import 'codemirror/mode/python/python'
import 'codemirror/theme/dracula.css'
import 'codemirror/theme/cobalt.css'
import 'codemirror/theme/material.css'
import 'codemirror/theme/midnight.css'
import 'codemirror/addon/edit/closetag'
import 'codemirror/addon/edit/closebrackets'
import 'codemirror/lib/codemirror.css'
import "./editor.css";
import ACTIONS from '../../Action';


const Editor = ({socketRef, roomId, onCodeChange}) => {

const editorRef = useRef(null);
  useEffect(()=>{
    async function init(){
      editorRef.current = Codemirror.fromTextArea(document.getElementById('realTimeCodeEditor'), {
        mode:{name:'javascript', json:true},
        theme: 'dracula',
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers:true,
        lineWrapping: true,
        syntaxHighlighting:true,
  });
      editorRef.current.on('change', (instance, changes) =>{
        // console.log('changes', changes);
        const {origin} = changes; 
        const code = instance.getValue();
        onCodeChange(code);
        if( origin !== 'setValue'){
          // console.log('working', code);
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          });
        }
        // console.log(code);
      }) 

    }
    init();
  },[])

  useEffect(() =>{
    if(socketRef.current){
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        // console.log('rec', code)
        if(code !== null) {
          editorRef.current.setValue(code)
        }
      })
    }
    return()=>{
        socketRef.current.off(ACTIONS.CODE_CHANGE);
    }
    // var m = socketRef.current;
  }, [socketRef.current])

  function selectTheme(e) {
    editorRef.current.setOption("theme", e.target.value);
  }
  function selectLangs(e) {
    editorRef.current.setOption("mode", {name:e.target.value, json:true});
  }
  return (
    <main>
    <div className="custom-select">
    <select className='select-selected' onChange={selectTheme}>
        <option value="0">Change Theme</option>
        <option value="dracula">Dracula</option>
        <option value="light">Light</option>
        <option value="midnight">Midnight</option>
        <option value="cobalt">Cobalt</option>
        <option value="material">Material</option>
        
    </select>
    <select className='select-selected' onChange={selectLangs}>
        <option value="0">Change Language</option>
        <option value="javascript">JavaScript</option>
        <option value="python">Python</option>
        <option value="css">CSS</option>
        <option value="php">PHP</option>
        <option value="jsx">Jsx</option>
        <option value="htmlmixed">HTML</option>
        
    </select>
    </div>
    <textarea id='realTimeCodeEditor' className='codeArea'/>
    </main>
  )
}

export default Editor
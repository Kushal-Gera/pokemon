import React, {createContext, useState} from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { io } from 'socket.io-client';
import { PlayBox } from "./components/PlayBox.js"
import { Lobby } from './components/Lobby.js';


const MainContext = createContext(null);


function App() {

    const socket = io.connect("http://localhost:8080")
    const [messages, setMessages] = useState(['Pokemon ShowDown'])
    

    return (
        <MainContext.Provider value={{socket, messages, setMessages}}> 
            <BrowserRouter>
                <Routes>
                    <Route key={'/'} path="/" element={<Lobby />} />
                    <Route key={'/play-box'} exact path="/play-box/:room" element={<PlayBox />} />
                </Routes>
            </BrowserRouter>
        </MainContext.Provider>
    )

}


export {App, MainContext};

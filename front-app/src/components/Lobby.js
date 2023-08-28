import React, {useEffect, useContext, useState, useRef} from "react"
import { MainContext } from "../App"
import { useNavigate } from "react-router-dom";

import { config } from "../config";
import LoadingScreen from 'react-loading-screen';


const Lobby = () => {
    const [isLoading, setIsLoading] = useState(false)

    const {socket, messages, setMessages} = useContext(MainContext);
    const navigate = useNavigate()


    const handleStartGameBtn = (event)=>{

        var name = event?.target[0]?.value
        if(!name) return

        var number_of_players = parseInt(event?.target[1]?.value) || 2
        var number_of_cards = parseInt(event?.target[2]?.value) || 5

        socket.emit(
            config.CREATE_NEW_GAME, 
            {number_of_cards: number_of_cards, number_of_players: number_of_players, name: name}
        )
        setIsLoading(true)
        event.preventDefault()
    }

    const handleJoinRoomBtn = (event) => {
        var name2 = event.target[0].value
        var roomID = event.target[1].value
        if(!name2 || !roomID) return

        socket.emit(config.JOIN_ROOM, {room: roomID, name: name2,} )
        event.preventDefault()
    }

    
    useEffect(() => {

        socket.on(config.REDIRECT_TO_PLAY_GAME, data => {
            setIsLoading(false)
            console.log('Play game begins -', data.roomId)
            navigate('/play-box/' + data.roomId)
        })

    }, [socket])


    return (
        <>
            {isLoading && <LoadingScreen
                loading={true}
                bgColor='#6C757D'
                spinnerColor='#027BFF'
                textColor='#fff'
                text='Creating a private room! Please Wait...'/> 
            }
            {!isLoading && 
                <div class="container py-4">
                    <div class="p-5 mb-4 bg-body-tertiary rounded-3">
                        <div class="container-fluid py-5">
                            <h1 class="display-5 fw-bold text-primary">Pokemon Showdown</h1>
                            <h6 class="col-md-10 display-8">Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis quos dolor quibusdam earum sunt labore recusandae sapiente. Ratione, ullam magnam, facere adipisci soluta odio ?</h6>
                        </div>
                    </div>

                    <div class="row align-items-md-stretch overflow-auto">
                        
                        <div class="col-md-6">
                            <div class="h-100 p-5 text-bg-dark rounded-3">
                                <h2>Start New Game</h2>
                                <br />

                                <form className="text-black" onSubmit={handleStartGameBtn}>
                                    <div className="form-floating mt-1">
                                        <input id="floatingUsername" required type="text" className="form-control" placeholder="Lucifer" />
                                        <label htmlFor="floatingUsername">Choose Username*</label>
                                    </div>
                                    
                                    <div className="form-floating mt-1">
                                        <input type="number" className="form-control" placeholder="2" />
                                        <label> Number of Players</label>
                                    </div>
                                    
                                    <div className="form-floating mt-1">
                                        <input type="number" className="form-control" placeholder="5" />
                                        <label> Number of Cards</label>
                                    </div>

                                    <button className="btn btn-primary py-2 my-4 w-50" type="submit"> Start </button>
                                </form>
                            </div>
                        </div>
                    
                        <div class="col-md-6 overflow-auto">
                            <div class="h-100 p-5 bg-body-tertiary border rounded-3">
                                <h2>Join A Room</h2>
                                <br />

                                <form onSubmit={handleJoinRoomBtn}>
                                    <div className="form-floating mt-1">
                                        <input id="floatingUsername2" required type="text" className="form-control" placeholder="Lucifer" />
                                        <label htmlFor="floatingUsername2">Choose Username*</label>
                                    </div>
                                    <div className="form-floating mt-1">
                                        <input id="floatingRoomName" required type="text" className="form-control" placeholder="Room-Qu34@o0jyh" />
                                        <label htmlFor="floatingRoomName">Enter Room ID*</label>
                                    </div>
                                    <div className="invisible form-floating mt-1">
                                        <input type="text" className="form-control" placeholder="Room-Qu34@o0jyh" />
                                        <label>Enter Room ID*</label>
                                    </div>

                                    <button className="btn btn-dark py-2 my-4 w-50" type="submit" name="join_game"> Join </button>

                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </>
    )

}


export { Lobby }
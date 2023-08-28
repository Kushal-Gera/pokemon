import React, { useContext, useEffect, useRef, useState } from "react"
import { MainContext } from "../App";

import { config } from "../config";


const PlayBox = () => {
    const {socket, messages, setMessages} = useContext(MainContext);

    const [name, setName] = useState('')
    const [cards, setCards] = useState([{'name':''}])
    const [score, setScore] = useState(0.0)
    const [numberOfPlayers, setNumberOfPlayers] = useState(0.0)
    
    const messageBoxRef = useRef(null)
    const [firstTimeShowAlert, setFirstTimeShowAlert] = useState(true)


    const mapCards = (item)=> {
        return (
            <div className="card mx-2 pb-2 " style={{width:'240px', display:"inline-grid", marginBottom:"20px", border:"4px solid black"}}>
                <img className="card-img-top" src={item?.img} style={{height:'9rem', objectFit:'cover'}}/>
                <div className="card-body">
                    <h5 className="card-title text-center text-uppercase">{item?.name}</h5>
                    <hr />

                    <div className="mt-1 p-1" style={{width:'100%', float:'center', alignItems:"center", alignContent:"center"}}>
                        <button style={{width:'48%', float:"left"}} className="btn btn-danger btn-sm my-1"> AT - {item?.stats?.attack} </button>
                        <button style={{width:'48%', float:"right"}} className="btn btn-success btn-sm my-1"> WT - {item?.weight} </button>
                        <button style={{width:'48%', float:"left"}} className="btn btn-info btn-sm my-1"> SP - {item?.stats?.speed} </button>
                        <button style={{width:'48%', float:"right"}} className="btn btn-warning btn-sm my-1"> DF - {item?.stats?.defense} </button>
                    </div>
                    
                </div>
            </div>
        )
    }

    const mapPlayers = (item)=> {
        return (
            <div className="card mx-3 mt-4" style={{width:'10rem', display:'inline-block'}}>
                <img className="card-img-top" src={item?.img} style={{height:'5rem', objectFit:'cover'}}/>
                <div className="card-body">
                    <h5 className="card-title text-center text-uppercase">{item?.name}</h5>
                    <hr />

                    <div className="mt-1 p-1" style={{width:'100%', float:'center', alignItems:"center", alignContent:"center"}}>
                        <button style={{width:'48%', float:"left"}} className="btn btn-danger btn-sm my-1"> {item?.stats?.attack} </button>
                        <button style={{width:'48%', float:"right"}} className="btn btn-success btn-sm my-1"> {item?.weight} </button>
                        <button style={{width:'48%', float:"left"}} className="btn btn-info btn-sm my-1"> {item?.stats?.speed} </button>
                        <button style={{width:'48%', float:"right"}} className="btn btn-warning btn-sm my-1"> {item?.stats?.defense} </button>
                    </div>
                    
                </div>
            </div>
        )
    }

    useEffect(()=>{
        socket.emit(config.SYNC_DATA)
    }, [])

    useEffect(() => {
        socket.on(config.RECEIVE_DATA, async (data)=>{
            try{
                const GAME_DETAIL = data?.ALL_GAME_DETAILS
                const PLAYER_DETAIL = data?.ALL_PLAYER_DETAILS[socket.id]
                
                setNumberOfPlayers(Object.keys(data?.ALL_PLAYER_DETAILS).length)
                setName(PLAYER_DETAIL?.name)
                setCards(PLAYER_DETAIL?.cards)
                setScore(PLAYER_DETAIL?.score)
                
                // if(firstTimeShowAlert){
                //     try {
                //         await navigator.clipboard.writeText(GAME_DETAIL.room);
                //         alert(`Room ID copied to clipboard!`)
                //         console.log('Content copied to clipboard');
                //     } catch (err) {
                //         alert(`Share your room ID with others - "${GAME_DETAIL.room}"`)
                //         console.error('Failed to copy: ', err);
                //     }
                //     setFirstTimeShowAlert(false)
                // }

            }catch{}
        })

        socket.on(config.NOTIFY, (data)=>{
            setMessages((prevState)=>{
                return [...prevState, data.message]
            })
        })

    }, [socket])


    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
                <p className="navbar-brand ml-auto"> <b>Username:</b> {name} </p>
                <p className="navbar-brand mx-auto"> <b>Cards Left:</b> {cards?.length} </p>
                <p className="navbar-brand mx-auto"> <b>Players Present:</b> {numberOfPlayers} </p>
                <p className="navbar-brand mx-auto"> <b>My Score:</b> {score} </p>
            </nav>

            <div style={{display: 'flex', flexDirection: 'row'}}>

                <div className="col-md-9">
                    
                    <div style={{marginBottom:"20px",overflowY:"scroll"}} >
                        <img src="/images/img_back.jpeg" style={{width:"240px", height:"320px", marginLeft:"40px", marginTop:"40px", marginBottom:"10px"}} />
                        <img src="/images/img_back.jpeg" style={{width:"240px", height:"320px", marginLeft:"-200px", marginTop:"40px", marginBottom:"10px" }} />
                        <img src="/images/img_back.jpeg" style={{width:"240px", height:"320px", marginLeft:"-200px",marginTop:"40px", marginBottom:"10px" }} />
                        
                        <span style={{marginLeft:"-150px"}} >
                            {cards.map((item, idx) => mapCards(item, idx))}
                        </span>

                    </div>

                    <div style={{alignItems:"flex-end", height:"40vh", backgroundColor:"gray"}} className="position-sticky sticky-bottom" >
                        {cards.map(item => mapPlayers(item))}
                    </div>

                </div>



                
                <div className="col-md-3">
                    <div className="position-sticky sticky-top bg-light text-black px-2 py-3 overflow-auto" style={{height:"90vh", border:"2px solid black", marginTop:"-2px"}}>
                        <h3 className="text-center mb-0"> Notifications Window </h3>
                        <hr className="mb-3"/>

                        <div ref={messageBoxRef} >
                            {messages.map(m => {
                                return <p className="message-bubble bg-secondary p-2 card mx-0" > {m} </p>
                            })}
                        </div>
                    </div>
                </div>

            </div>

        </>

    )
}


export {PlayBox}

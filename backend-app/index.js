// require("dotenv").config();
// const lodash = require("lodash")
// const bodyParser = require("body-parser")
// app.use(bodyParser.urlencoded({ extended: true }));
// app.set("view engine", "ejs");
// app.use(express.static("public"));


const PORT = process.env.PORT || 8080
const {config} = require('../config.js')

const express = require("express")
const app = express();

const axios = require("axios")
const http = require("http")
const cors = require("cors")
const {Server} = require('socket.io');

app.use(cors)

const server = http.createServer(app)
const io = new Server(server, {
    cors:{
        origin: "http://localhost:3000",
        methods: ['GET', 'POST'],
    }
})



let ALL_GAME_DETAILS = {}
let ALL_PLAYER_DETAILS = {}
let ALL_CARD_DETAILS = {}
let PLAYER_ROOM_MAP = {}


const shuffleArray = (cards) => {
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
}
function deleteKeysByValue(obj, value) {
    for (let key in obj) {
        if (obj[key] === value) {
            delete obj[key];
        }
    }
}
const get_cards = async (n) => {
    let CARDS = []
    const offset = Math.max( Math.floor(Math.random() * 1200 - n), 0)
    
    const url = `https://pokeapi.co/api/v2/pokemon/?limit=${n}&offset=${offset}`;
    const response = await axios.get(url);
    const data = response.data.results;

    for(let i=0; i<n; i++){
        const resp = await axios.get(data[i].url)
        const details = resp.data

        const card = {
            img: details?.sprites?.front_default || '',
            name: details?.name || '',

            weight: details?.weight || 0,
            height: details?.height || 0,
            moves: details?.moves?.length || 0,

            stats: {
                health: details?.stats[0]?.base_stat || 0,
                attack: details?.stats[1]?.base_stat || 0,
                defense: details?.stats[2]?.base_stat || 0,
                speed: details?.stats[5]?.base_stat || 0,
            },
        }
  
        CARDS.push(card)
    }

    shuffleArray(CARDS)
    return CARDS
}


io.on('connection', (socket)=>{
    
    socket.on(config.CREATE_NEW_GAME, async (data)=>{

        let CURRENT_GAME = {
            host: socket.id,
            room: `my-room@${Date.now()}`,
            number_of_cards: data?.number_of_cards || 5,
            number_of_players: data?.number_of_players || 2,

            is_game_running: false,
        }

        let CARDS = await get_cards(CURRENT_GAME.number_of_cards * CURRENT_GAME.number_of_players)

        let PLAYER = {
            id: socket.id,
            name: data.name,
            cards: [],
            score: 0.0
        }
        
        PLAYER.cards = CARDS.slice(0, CURRENT_GAME.number_of_cards)
        CARDS = CARDS.slice(CURRENT_GAME.number_of_cards)
        
        socket.join(CURRENT_GAME.room)

        ALL_GAME_DETAILS[CURRENT_GAME.room] = CURRENT_GAME
        ALL_CARD_DETAILS[CURRENT_GAME.room] = CARDS
        ALL_PLAYER_DETAILS[CURRENT_GAME.room] = {[socket.id]: PLAYER}
        PLAYER_ROOM_MAP[socket.id] = CURRENT_GAME.room

        console.log(ALL_GAME_DETAILS)
        console.log(ALL_PLAYER_DETAILS)
        // console.log(ALL_CARD_DETAILS)

        const room = CURRENT_GAME.room
        socket.emit(config.REDIRECT_TO_PLAY_GAME, {roomId: room, ALL_PLAYER_DETAILS: ALL_PLAYER_DETAILS[room], ALL_GAME_DETAILS: ALL_GAME_DETAILS[room]})
    })

    socket.on(config.JOIN_ROOM, (data)=>{
        const room = data.room

        if(!ALL_GAME_DETAILS[room]){
            console.log(`${room} is an invalid room address.`)
            return false
        }
        if(Object.keys(ALL_PLAYER_DETAILS[room]).length >= ALL_GAME_DETAILS[room].number_of_players){
            console.log(`${room} capacity already full!`)
            return false
        }

        const PLAYER = {
            id: socket.id,
            name: data.name,
            cards: [],
            score: 0.0
        }

        let CARDS = ALL_CARD_DETAILS[room]
        PLAYER.cards = CARDS.slice(0, ALL_GAME_DETAILS[room].number_of_cards)
        CARDS = CARDS.slice(ALL_GAME_DETAILS[room].number_of_cards)

        ALL_PLAYER_DETAILS[room][socket.id] = PLAYER
        ALL_CARD_DETAILS[room] = CARDS
        PLAYER_ROOM_MAP[socket.id] = room

        socket.join(room)
        socket.to(room).emit(config.NOTIFY, {'message': `'${data.name}' joined the game!`})
        socket.emit(config.NOTIFY, {'message': `Hello ${data.name}! Welcome to the game!`})
        console.log(`${data.name} joined the game!`)


        if(Object.keys(ALL_PLAYER_DETAILS[room]).length >= ALL_GAME_DETAILS[room].number_of_players){
            // BEGIN GAME
            ALL_GAME_DETAILS[room].is_game_running = true
            delete ALL_CARD_DETAILS[room]

            socket.to(room).emit(config.NOTIFY, {'message': 'Game started !'})
            console.log('Game started in', room)
        }

        // console.log(ALL_GAME_DETAILS)
        console.log(ALL_PLAYER_DETAILS)
        // console.log(PLAYER_ROOM_MAP)
        // console.log(ALL_CARD_DETAILS)

        socket.emit(config.REDIRECT_TO_PLAY_GAME, {roomId: room, ALL_PLAYER_DETAILS: ALL_PLAYER_DETAILS[room], ALL_GAME_DETAILS: ALL_GAME_DETAILS[room]})
    })

    socket.on('disconnect', ()=>{
        console.log('User disconnected', socket.id)
        const room = PLAYER_ROOM_MAP[socket.id]
        
        if(!room){
            console.log('random disconnect.')
            return
        }

        // player left
        socket.to(room).emit(config.NOTIFY, {'message': `${ALL_PLAYER_DETAILS[room][socket.id].name} left the game!`})
        console.log(`${ALL_PLAYER_DETAILS[room][socket.id].name} left the game!`)
        
        delete ALL_PLAYER_DETAILS[room][socket.id]
        ALL_GAME_DETAILS[room].number_of_players -= 1
        
        // update and sync data
        socket.to(room).emit(config.RECEIVE_DATA, {roomId: room, ALL_PLAYER_DETAILS: ALL_PLAYER_DETAILS[room], ALL_GAME_DETAILS: ALL_GAME_DETAILS[room]})
        
        if(ALL_GAME_DETAILS[room].number_of_players === 0){
            // host left
            socket.to(room).emit(config.NOTIFY, {'message': `Host ended ${room} game!`})
            
            delete ALL_GAME_DETAILS[room]
            delete ALL_PLAYER_DETAILS[room]
            deleteKeysByValue(PLAYER_ROOM_MAP, room)

            console.log(`All players left the game!`)
        }
    })

    socket.on(config.SYNC_DATA, ()=>{
        const room = PLAYER_ROOM_MAP[socket.id]
        socket.emit(config.RECEIVE_DATA, {roomId: room, ALL_PLAYER_DETAILS: ALL_PLAYER_DETAILS[room], ALL_GAME_DETAILS: ALL_GAME_DETAILS[room]})
        socket.to(room).emit(config.RECEIVE_DATA, {roomId: room, ALL_PLAYER_DETAILS: ALL_PLAYER_DETAILS[room], ALL_GAME_DETAILS: ALL_GAME_DETAILS[room]})
    })

})


server.listen(PORT, (err)=>{
    console.log(`server running on PORT:${PORT}`)
})






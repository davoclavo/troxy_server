import {Socket} from "phoenix"

let socket = new Socket("/socket")
socket.connect()

let channel = socket.channel("users:new", {})
channel.join().receive("ok", chan => {
    console.log("joined")
})
channel.on("new:user", user => {
    console.log("new user")
})

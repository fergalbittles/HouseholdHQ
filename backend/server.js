const app = require("./index");
const socket = require("socket.io");

const port = 3000;

// Spin up the server
const server = app.listen(port, () => {
    console.log(`listening on port ${port}`);
});

// Socket setup
const io = socket(server, {
    cors: {
        origin: "*",
    },
});

app.set("socketio", io);

// Listen on the socket for a client connection
io.on("connection", function (socket) {
    socket.join(socket.handshake.headers["household-id"]);
    console.log("made a socket connection: ", socket.id);
});

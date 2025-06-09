import express from "express";
import http from "http";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import bodyParser from "body-parser";
import { Server as SocketIOServer } from "socket.io";
import { resolvers } from "./resolvers.js";
import { typeDefs } from "./schema.js";
import { getUser } from "./module/auth.js";
import db from "./datasource/db.js";

const app = express();
const httpServer = http.createServer(app);

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

await server.start();

app.use(cors(), bodyParser.json());
app.use(
  "/graphql",
  expressMiddleware(server, {
    context: async ({ req }) => {
      const { cache } = server;
      const authorization = req.headers.authorization?.split("Bearer ")?.[1];
      const user = authorization ? getUser(authorization) : null;
      return {
        dataSources: {
          db,
        },
        user,
      };
    },
  })
);

// --- Socket.IO setup ---
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*", // à restreindre en prod
    methods: ["GET", "POST"],
  },
});

io.use((socket, next) => {
  // Récupère le token envoyé par le client (query ou header)
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.headers["authorization"]?.split("Bearer ")?.[1];
  if (!token) {
    return next(new Error("Authentication error: no token"));
  }
  try {
    const user = getUser(token); // ta fonction d'extraction/validation JWT
    if (!user) return next(new Error("Authentication error: invalid token"));
    // On attache l'utilisateur à la socket pour l'utiliser plus tard
    socket.data.user = user;
    next();
  } catch (err) {
    next(new Error("Authentication error: invalid token"));
  }
});

io.on("connection", (socket) => {
  const user = socket.data.user;
  if (user?.id) {
    socket.join(user.id); // Permet d'émettre à un user précis
  }
  console.log("Socket.IO client connected:", socket.id, "user:", user?.id);
});

export { io };

const PORT = 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀  Server ready at: http://localhost:${PORT}/graphql`);
  console.log(`🟣  Socket.IO ready at: http://localhost:${PORT}`);
});

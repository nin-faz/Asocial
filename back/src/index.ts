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

// --- API REST pour l’abonnement push ---
app.post("/api/push/subscribe", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization header missing" });
  }
  const token = authHeader.split("Bearer ")[1];
  const user = getUser(token);
  if (!user) {
    return res.status(401).json({ error: "Invalid token" });
  }
  const { endpoint, keys } = req.body;
  if (!endpoint || !keys?.auth || !keys?.p256dh) {
    return res.status(400).json({ error: "Invalid subscription object" });
  }
  try {
    // Upsert l’abonnement (endpoint unique)
    await db.pushSubscription.upsert({
      where: { endpoint },
      update: {
        auth: keys.auth,
        p256dh: keys.p256dh,
        userId: user.id,
      },
      create: {
        endpoint,
        auth: keys.auth,
        p256dh: keys.p256dh,
        userId: user.id,
      },
    });
    return res.status(201).json({ success: true });
  } catch (e) {
    console.error("Erreur enregistrement push subscription:", e);
    return res.status(500).json({ error: "Failed to save subscription" });
  }
});

// --- API REST pour la désinscription push ---
app.post("/api/push/unsubscribe", async (req, res) => {
  const { endpoint } = req.body;
  if (!endpoint) {
    return res.status(400).json({ error: "Endpoint manquant" });
  }
  try {
    await db.pushSubscription.deleteMany({ where: { endpoint } });
    return res.status(200).json({ success: true });
  } catch (e) {
    console.error("Erreur suppression push subscription:", e);
    return res.status(500).json({ error: "Failed to unsubscribe" });
  }
});

// --- API REST pour vérification du token (utilisé par le front) ---
app.get("/api/auth/verify", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization header missing" });
  }
  const token = authHeader.split("Bearer ")[1];
  const user = getUser(token);
  if (!user) {
    return res.status(401).json({ error: "Invalid token" });
  }
  return res.status(200).json({ valid: true, user });
});

const PORT = process.env.PORT ?? 4000;
httpServer.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`🚀  Server ready at: http://localhost:${PORT}/graphql`);
  console.log(`🟣  Socket.IO ready at: http://localhost:${PORT}`);
});

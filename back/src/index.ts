import express from "express";
import http from "http";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import bodyParser from "body-parser";
import { Server as SocketIOServer } from "socket.io";
import multer from "multer";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { resolvers } from "./resolvers.js";
import { typeDefs } from "./schema.js";
import { getUser } from "./module/auth.js";
import db from "./datasource/db.js";
import compression from "compression";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de tentatives, réessaie dans 15 minutes." },
});

const graphqlLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de requêtes, réessaie dans 15 minutes." },
});

const app = express();
const httpServer = http.createServer(app);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== "production",
});

await server.start();

const corsOptions = {
  origin: [
    "https://asocial-network.netlify.app",
    "http://localhost:5173",
    "http://localhost:4000",
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));
app.use(compression());
app.use(bodyParser.json());
app.use(
  "/graphql",
  graphqlLimiter,
  expressMiddleware(server, {
    context: async ({ req }) => {
      const { cache } = server;
      const authorization = req.headers.authorization?.split("Bearer ")?.[1];
      const user = authorization ? await getUser(authorization) : null;
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
    origin: corsOptions.origin,
    methods: ["GET", "POST"],
  },
});

io.use(async (socket, next) => {
  // Récupère le token envoyé par le client (query ou header)
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.headers["authorization"]?.split("Bearer ")?.[1];
  if (!token) {
    return next(new Error("Authentication error: no token"));
  }
  try {
    const user = await getUser(token);
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

// --- API REST pour l’upload d’images (proxy ImgBB) ---
app.post("/api/upload/image", authLimiter, upload.single("image"), async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization header missing" });
  }
  const user = await getUser(authHeader.split("Bearer ")[1]);
  if (!user) return res.status(401).json({ error: "Invalid token" });
  if (!req.file) return res.status(400).json({ error: "No file provided" });

  const formData = new FormData();
  const blob = new Blob([new Uint8Array(req.file.buffer)], { type: req.file.mimetype });
  formData.append("image", blob, req.file.originalname);

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
    { method: "POST", body: formData }
  );
  if (!response.ok) return res.status(502).json({ error: "ImgBB upload failed" });
  const data: any = await response.json();
  return res.status(200).json({ url: data.data.url });
});

// --- API REST pour l’abonnement push ---
app.post("/api/push/subscribe", authLimiter, async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization header missing" });
  }
  const token = authHeader.split("Bearer ")[1];
  const user = await getUser(token);
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
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization header missing" });
  }
  const user = await getUser(authHeader.split("Bearer ")[1]);
  if (!user) {
    return res.status(401).json({ error: "Invalid token" });
  }
  const { endpoint } = req.body;
  if (!endpoint) {
    return res.status(400).json({ error: "Endpoint manquant" });
  }
  try {
    await db.pushSubscription.deleteMany({ where: { endpoint, userId: user.id } });
    return res.status(200).json({ success: true });
  } catch (e) {
    console.error("Erreur suppression push subscription:", e);
    return res.status(500).json({ error: "Failed to unsubscribe" });
  }
});

// --- API REST pour vérification du token (utilisé par le front) ---
app.get("/api/auth/verify", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization header missing" });
  }
  const token = authHeader.split("Bearer ")[1];
  const user = await getUser(token);
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

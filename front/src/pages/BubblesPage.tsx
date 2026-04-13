import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { motion } from "framer-motion";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useQuery, useMutation } from "@apollo/client";
import { GET_BUBBLES, GET_BUBBLE_BY_ID } from "../queries";
import { CREATE_BUBBLE, ADD_MESSAGE_TO_BUBBLE } from "../mutations";
import { FloatingMessage, Particle, BubbleData } from "../types/bubbles";

const COLORS = [
  "#a855f7",
  "#ec4899",
  "#06b6d4",
  "#8b5cf6",
  "#d946ef",
  "#f59e0b",
];

const BubbleSession: React.FC<{ bubble: BubbleData; onExit: () => void }> = ({
  bubble,
  onExit,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const messagesRef = useRef<FloatingMessage[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);
  const [newReply, setNewReply] = useState("");

  const [addMessageMutation] = useMutation(ADD_MESSAGE_TO_BUBBLE);

  useEffect(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const messages = bubble.messages.map(
      (m) =>
        ({
          id: m.id,
          author: m.author.username,
          text: m.content,
          x: Math.random() * (vw * 0.8) + vw * 0.1,
          y: Math.random() * (vh * 0.8) + vh * 0.1,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          dislikes: m.dislikes,
          size: 60,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          createdAt: new Date(m.createdAt),
          trail: [],
          addedAt: Date.now(),
        }) as FloatingMessage,
    );

    messagesRef.current = messages;
    console.log("✅ Messages prêts:", messages.length);
    setIsReady(true);
  }, [bubble]);

  const hoveredMessageRef = useRef<string | null>(null);

  useEffect(() => {
    hoveredMessageRef.current = hoveredMessage;
  }, [hoveredMessage]);

  useEffect(() => {
    if (!isReady) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.scale(dpr, dpr);
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    const DAMPING = 0.9995;
    const MSG_RADIUS = 1;
    const MIN_VELOCITY = 0.15;

    const createCollisionParticles = (x: number, y: number) => {
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * 3,
          vy: Math.sin(angle) * 3,
          life: 1,
        });
      }
    };

    const animate = () => {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const isMobile = window.innerWidth < 768;
      const fontScale = isMobile ? 0.85 : 1;

      // Particles
      particlesRef.current = particlesRef.current.filter((p) => p.life > 0);
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;

        ctx.globalAlpha = p.life;
        ctx.fillStyle = "#a855f7";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Physics
      messagesRef.current.forEach((msg, index) => {
        msg.x += msg.vx;
        msg.y += msg.vy;

        // Ajouter à la traîlée
        msg.trail.push({ x: msg.x, y: msg.y });
        if (msg.trail.length > 15) msg.trail.shift();

        msg.vx *= DAMPING;
        msg.vy *= DAMPING;

        // Garder une vitesse minimale pour mouvement continu
        const speed = Math.sqrt(msg.vx * msg.vx + msg.vy * msg.vy);
        if (speed < MIN_VELOCITY && speed > 0) {
          const scale = MIN_VELOCITY / speed;
          msg.vx *= scale;
          msg.vy *= scale;
        }

        if (msg.x < 0) msg.x = window.innerWidth;
        if (msg.x > window.innerWidth) msg.x = 0;
        if (msg.y < 0) msg.y = window.innerHeight;
        if (msg.y > window.innerHeight) msg.y = 0;

        // Collisions
        for (let i = index + 1; i < messagesRef.current.length; i++) {
          const other = messagesRef.current[i];
          const pdx = other.x - msg.x;
          const pdy = other.y - msg.y;
          const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
          const minDist = (msg.size + other.size) * MSG_RADIUS;

          if (pdist < minDist) {
            const angle = Math.atan2(pdy, pdx);
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);

            const vx1 = msg.vx * cos + msg.vy * sin;
            const vy1 = msg.vy * cos - msg.vx * sin;
            const vx2 = other.vx * cos + other.vy * sin;
            const vy2 = other.vy * cos - other.vx * sin;

            msg.vx = vx2 * cos - vy1 * sin;
            msg.vy = vy1 * cos + vx2 * sin;
            other.vx = vx1 * cos - vy2 * sin;
            other.vy = vy2 * cos + vx1 * sin;

            const overlap = minDist - pdist;
            const dx = (pdx / pdist) * overlap * 0.5;
            msg.x -= dx;
            msg.y -= (pdy / pdist) * overlap * 0.5;
            other.x += dx;
            other.y += (pdy / pdist) * overlap * 0.5;

            createCollisionParticles(
              (msg.x + other.x) / 2,
              (msg.y + other.y) / 2,
            );
          }
        }
      });

      // Draw messages
      ctx.globalAlpha = 1;
      messagesRef.current.forEach((msg) => {
        const isHovered = hoveredMessageRef.current === msg.id;
        let radius = msg.size * MSG_RADIUS;

        // Animation de nouveaux messages
        const ageMs = Date.now() - msg.addedAt;
        if (ageMs < 300) {
          const progress = ageMs / 300;
          const scale = 1 + (1 - progress) * 0.5;
          radius *= scale;
        }

        // Glow
        const glow = ctx.createRadialGradient(
          msg.x,
          msg.y,
          0,
          msg.x,
          msg.y,
          radius * 2,
        );
        glow.addColorStop(0, `${msg.color}40`);
        glow.addColorStop(1, `${msg.color}00`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(msg.x, msg.y, radius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Trail
        if (msg.trail.length > 1) {
          for (let i = 0; i < msg.trail.length - 1; i++) {
            const alpha = (i / msg.trail.length) * 0.3;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = msg.color;
            const trailRadius = radius * (1 - i / msg.trail.length);
            ctx.beginPath();
            ctx.arc(
              msg.trail[i].x,
              msg.trail[i].y,
              trailRadius * 0.5,
              0,
              Math.PI * 2,
            );
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        }

        // Circle
        ctx.fillStyle = msg.color;
        ctx.globalAlpha = isHovered ? 1 : 0.85;
        ctx.beginPath();
        ctx.arc(msg.x, msg.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Border
        ctx.strokeStyle = isHovered ? "#fff" : msg.color;
        ctx.lineWidth = isHovered ? 3 : 2;
        ctx.stroke();

        // Text
        ctx.fillStyle = "#fff";
        ctx.font = `bold ${Math.round(12 * fontScale)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(msg.author, msg.x, msg.y - 15);

        ctx.font = `${Math.round(10 * fontScale)}px sans-serif`;
        const lines = msg.text.split(" ");
        lines.forEach((line, i) => {
          ctx.fillText(line, msg.x, msg.y + i * 12);
        });

        ctx.fillStyle = "#e0e0e0";
        ctx.font = `${Math.round(10 * fontScale)}px sans-serif`;
        const date = msg.createdAt.toLocaleDateString("fr-FR");
        const time = msg.createdAt.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        });
        ctx.fillText(`${date} ${time}`, msg.x, msg.y + 40);
      });

      requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      let found = false;
      messagesRef.current.forEach((msg) => {
        const dx = x - msg.x;
        const dy = y - msg.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < msg.size) {
          setHoveredMessage(msg.id);
          found = true;
        }
      });

      if (!found) setHoveredMessage(null);
    };

    const handleClick = (e: MouseEvent) => {
      // Vérifier si un élément overlay a été cliqué
      const clickedElement = document.elementFromPoint(e.clientX, e.clientY);
      if (clickedElement !== canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      messagesRef.current.forEach((msg) => {
        const dx = x - msg.x;
        const dy = y - msg.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < msg.size) {
          msg.vx += (Math.random() - 0.5) * 2;
          msg.vy += (Math.random() - 0.5) * 2;
          createCollisionParticles(msg.x, msg.y);
        }
      });
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleClick);

    animate();

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleClick);
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, [isReady]);

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onExit}
        className="fixed top-4 left-4 sm:top-6 sm:left-6 bg-purple-600 hover:bg-purple-700 z-50 px-3 sm:px-4 py-2 rounded text-white flex items-center gap-2 text-sm cursor-pointer border-none"
      >
        <ArrowLeft size={18} />
        <span>Quitter</span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed inset-x-0 top-16 sm:top-6 z-50 flex flex-col items-center text-center px-4 pointer-events-none"
      >
        <h1 className="text-xl sm:text-3xl font-bold text-purple-400">
          {bubble.title}
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm">
          Par {bubble.author.username}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4"
      >
        <div className="w-full sm:w-96 max-w-full">
          <div className="bg-gray-900/80 backdrop-blur rounded-lg p-3 sm:p-4 border border-purple-900">
            <div className="flex gap-2 sm:gap-3">
              <input
                type="text"
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && newReply.trim()) {
                    addMessageMutation({
                      variables: { bubbleId: bubble.id, content: newReply },
                      onCompleted: (data) => {
                        const newMsg: FloatingMessage = {
                          id: data.addMessageToBubble.id,
                          author: data.addMessageToBubble.author.username,
                          text: newReply,
                          x: Math.random() * window.innerWidth,
                          y: Math.random() * window.innerHeight,
                          vx: (Math.random() - 0.5) * 2,
                          vy: (Math.random() - 0.5) * 2,
                          dislikes: 0,
                          size: 60,
                          color:
                            COLORS[Math.floor(Math.random() * COLORS.length)],
                          createdAt: new Date(
                            data.addMessageToBubble.createdAt,
                          ),
                          trail: [],
                          addedAt: Date.now(),
                        };
                        messagesRef.current.push(newMsg);
                        setNewReply("");
                      },
                    });
                  }
                }}
                placeholder="Lâche ton opinion..."
                className="flex-1 bg-gray-800 text-white rounded px-2 sm:px-3 py-2 border border-gray-700 focus:border-purple-500 focus:outline-none text-xs sm:text-sm"
              />
              <button
                onClick={() => {
                  if (newReply.trim()) {
                    addMessageMutation({
                      variables: { bubbleId: bubble.id, content: newReply },
                      onCompleted: (data) => {
                        const newMsg: FloatingMessage = {
                          id: data.addMessageToBubble.id,
                          author: data.addMessageToBubble.author.username,
                          text: newReply,
                          x: Math.random() * window.innerWidth,
                          y: Math.random() * window.innerHeight,
                          vx: (Math.random() - 0.5) * 2,
                          vy: (Math.random() - 0.5) * 2,
                          dislikes: 0,
                          size: 60,
                          color:
                            COLORS[Math.floor(Math.random() * COLORS.length)],
                          createdAt: new Date(
                            data.addMessageToBubble.createdAt,
                          ),
                          trail: [],
                          addedAt: Date.now(),
                        };
                        messagesRef.current.push(newMsg);
                        setNewReply("");
                      },
                    });
                  }
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded transition-colors flex-shrink-0"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="fixed bottom-1 right-2 sm:bottom-6 sm:right-6 text-gray-500 text-[10px] sm:text-xs z-50">
        💬 Clique pour une animation
      </div>
    </div>
  );
};

export default function BubblesPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const authContext = useContext(AuthContext);
  const [isEntering, setIsEntering] = useState(false);
  const [showSession, setShowSession] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBubbleTitle, setNewBubbleTitle] = useState("");
  const [authorMode, setAuthorMode] = useState<
    "anonymous" | "registered" | "custom"
  >(authContext?.user ? "registered" : "anonymous");
  const [customAuthor, setCustomAuthor] = useState("");

  // Fetch bubbles
  const { data: bubblesData, refetch: refetchBubbles } = useQuery(GET_BUBBLES, {
    variables: { limit: 20, offset: 0 },
  });

  // Fetch specific bubble
  const { data: bubbleData } = useQuery(GET_BUBBLE_BY_ID, {
    variables: { id: id || "" },
    skip: !id,
  });

  // Create bubble mutation
  const [createBubbleMutation] = useMutation(CREATE_BUBBLE, {
    onCompleted: (data) => {
      if (data.createBubble.success) {
        refetchBubbles();
        setNewBubbleTitle("");
        setCustomAuthor("");
        setAuthorMode(authContext?.user ? "registered" : "anonymous");
        setShowCreateModal(false);
      }
    },
  });

  const bubbles = bubblesData?.getBubbles || [];
  const selectedBubble = id ? bubbleData?.getBubbleById : null;

  useEffect(() => {
    if (location.state?.entering) {
      setIsEntering(true);
      setShowSession(false);
    } else if (selectedBubble) {
      setShowSession(true);
    }
  }, [location.state?.entering, selectedBubble]);

  const handleSelectBubble = (bubble: BubbleData) => {
    navigate(`/bubbles/${bubble.id}`, { state: { entering: true } });
  };

  const handleCreateBubble = () => {
    if (newBubbleTitle.trim()) {
      createBubbleMutation({
        variables: { title: newBubbleTitle },
      });
    }
  };

  if (selectedBubble) {
    return (
      <>
        {isEntering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 bg-black z-[100] pointer-events-none"
            onAnimationComplete={() => {
              setIsEntering(false);
              setShowSession(true);
            }}
          >
            <div className="w-full h-full relative overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    opacity: 1,
                    scale: Math.random() * 40 + 20,
                  }}
                  animate={{
                    x: window.innerWidth / 2,
                    y: window.innerHeight / 2,
                    opacity: 0,
                    scale: 0,
                  }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute rounded-full bg-purple-500/20"
                  style={{
                    width: Math.random() * 40 + 20,
                    height: Math.random() * 40 + 20,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
        {showSession && (
          <BubbleSession
            bubble={selectedBubble}
            onExit={() => navigate("/bubbles")}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 sm:mb-12 flex justify-between items-start"
        >
          <div>
            <h1 className="text-3xl sm:text-5xl font-bold text-purple-400 mb-3">
              🫧 Bubbles
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Rejoin une session de débat en temps réel
            </p>
          </div>
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0px 0px 20px rgba(128, 0, 128, 0.5)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 sm:px-6 sm:py-3 rounded-lg text-white text-sm sm:text-base font-semibold transition-colors whitespace-nowrap"
          >
            + Créer
          </motion.button>
        </motion.div>

        <div className="space-y-3 sm:space-y-4">
          {bubbles.map((bubble: BubbleData, idx: number) => (
            <motion.div
              key={bubble.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => handleSelectBubble(bubble)}
              className="bg-gradient-to-br from-purple-900/30 to-gray-900 rounded-lg p-3 sm:p-6 border border-purple-800 cursor-pointer hover:border-purple-600 transition-all"
            >
              <div className="text-2xl sm:text-4xl mb-3 sm:mb-3">🫧</div>
              <h3 className="text-sm sm:text-lg font-semibold text-purple-400 mb-2 sm:mb-2 line-clamp-2">
                {bubble.title}
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4">
                Par {bubble.author.username}
              </p>
              <div className="text-purple-400 text-xs sm:text-sm font-semibold">
                Rejoindre →
              </div>
            </motion.div>
          ))}
        </div>

        {/* Modal de création */}
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreateModal(false)}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-lg p-6 w-full max-w-md border border-purple-800"
            >
              <h2 className="text-2xl font-bold text-purple-400 mb-4">
                Créer une bulle
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">
                    Titre de la discussion
                  </label>
                  <input
                    type="text"
                    value={newBubbleTitle}
                    onChange={(e) => setNewBubbleTitle(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handleCreateBubble();
                    }}
                    placeholder="p.ex: Quel est le meilleur langage ?"
                    className="w-full bg-gray-800 text-white rounded px-3 py-2 border border-gray-700 focus:border-purple-500 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-3">
                    Créer en tant que
                  </label>
                  <div className="space-y-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setAuthorMode("anonymous")}
                      className={`w-full px-3 py-2 rounded text-sm transition-all ${
                        authorMode === "anonymous"
                          ? "bg-purple-600 text-white"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      🕵️ Anonyme
                    </motion.button>

                    {authContext?.user && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setAuthorMode("registered")}
                        className={`w-full px-3 py-2 rounded text-sm transition-all ${
                          authorMode === "registered"
                            ? "bg-purple-600 text-white"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        }`}
                      >
                        👤 {authContext.user.username}
                      </motion.button>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setAuthorMode("custom")}
                      className={`w-full px-3 py-2 rounded text-sm transition-all ${
                        authorMode === "custom"
                          ? "bg-purple-600 text-white"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      ✏️ Pseudo personnalisé
                    </motion.button>
                  </div>

                  {authorMode === "custom" && (
                    <input
                      type="text"
                      value={customAuthor}
                      onChange={(e) => setCustomAuthor(e.target.value)}
                      placeholder="Votre pseudo"
                      className="w-full mt-3 bg-gray-800 text-white rounded px-3 py-2 border border-gray-700 focus:border-purple-500 focus:outline-none text-sm"
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-purple-600 text-purple-400 rounded-lg hover:bg-purple-900/30 transition-colors text-sm font-semibold"
                >
                  Annuler
                </motion.button>
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0px 0px 20px rgba(128, 0, 128, 0.5)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateBubble}
                  disabled={
                    !newBubbleTitle.trim() ||
                    (authorMode === "custom" && !customAuthor.trim())
                  }
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors text-sm font-semibold"
                >
                  Créer
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

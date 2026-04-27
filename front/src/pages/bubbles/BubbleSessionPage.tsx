import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader, Send, Skull } from "lucide-react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { GET_BUBBLE_BY_ID } from "../../queries";
import { ADD_MESSAGE_TO_BUBBLE } from "../../mutations";
import { FloatingMessage, Particle, BubbleData } from "../../types/bubbles";
import UserIcon from "../../components/icons/UserIcon";

const COLORS = [
  "#a855f7",
  "#ec4899",
  "#06b6d4",
  "#8b5cf6",
  "#d946ef",
  "#f59e0b",
];

interface BubbleSessionProps {
  bubble: BubbleData;
  onExit: () => void;
}

const BubbleSessionContent: React.FC<BubbleSessionProps> = ({
  bubble,
  onExit,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const messagesRef = useRef<FloatingMessage[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const [isReady, setIsReady] = useState(false);
  const initializedRef = useRef(false);
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);
  const [newReply, setNewReply] = useState("");
  const [isAnonymousMsg, setIsAnonymousMsg] = useState(false);

  const [addMessageMutation, { loading: isSending }] = useMutation(ADD_MESSAGE_TO_BUBBLE);
  const isSendingRef = useRef(false);

  const handleSend = () => {
    if (isSendingRef.current || !newReply.trim()) return;
    isSendingRef.current = true;
    const content = newReply;
    addMessageMutation({
      variables: { bubbleId: bubble.id, content, isAnonymous: isAnonymousMsg },
      onCompleted: (data) => {
        const newMsg: FloatingMessage = {
          id: data.addMessageToBubble.id,
          author: data.addMessageToBubble.isAnonymous
            ? "Anonyme"
            : data.addMessageToBubble.author.username,
          text: content,
          isAnonymous: data.addMessageToBubble.isAnonymous,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          size: 60,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          createdAt: new Date(data.addMessageToBubble.createdAt),
          trail: [],
          addedAt: Date.now(),
        };
        messagesRef.current.push(newMsg);
        setNewReply("");
        isSendingRef.current = false;
      },
      onError: () => {
        isSendingRef.current = false;
      },
    });
  };

  useEffect(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const existingIds = new Set(messagesRef.current.map((m) => m.id));

    const newMessages = bubble.messages
      .filter((m) => !existingIds.has(m.id))
      .map(
        (m) =>
          ({
            id: m.id,
            author: m.isAnonymous ? "Anonyme" : m.author.username,
            text: m.content,
            isAnonymous: m.isAnonymous,
            x: Math.random() * (vw * 0.8) + vw * 0.1,
            y: Math.random() * (vh * 0.8) + vh * 0.1,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            size: 60,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            createdAt: new Date(m.createdAt),
            trail: [],
            addedAt: Date.now(),
          }) as FloatingMessage,
      );

    messagesRef.current.push(...newMessages);

    if (!initializedRef.current) {
      initializedRef.current = true;
      setIsReady(true);
    }
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

    const DAMPING = 0.9999;
    const MIN_VELOCITY = 0.05;

    const createCollisionParticles = (x: number, y: number) => {
      for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 * i) / 12;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * 5,
          vy: Math.sin(angle) * 5,
          life: 1.2,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
      }
    };

    const createTouchParticles = (x: number, y: number) => {
      for (let i = 0; i < 4; i++) {
        const angle = (Math.PI * 2 * i) / 4;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * 2,
          vy: Math.sin(angle) * 2,
          life: 0.6,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
      }
    };

    const animate = () => {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      // Draw particles
      particlesRef.current.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.life -= 0.02;

        if (p.life <= 0) {
          particlesRef.current.splice(idx, 1);
          return;
        }

        ctx.fillStyle = p.color + Math.floor(p.life * 255).toString(16);
        ctx.fillRect(p.x, p.y, 2, 2);
      });

      // Draw and animate messages
      messagesRef.current.forEach((msg, idx) => {
        msg.x += msg.vx;
        msg.y += msg.vy;
        msg.vx *= DAMPING;
        msg.vy *= DAMPING;

        if (Math.abs(msg.vx) < MIN_VELOCITY) msg.vx = 0;
        if (Math.abs(msg.vy) < MIN_VELOCITY) msg.vy = 0;

        // Add particle trail when moving
        if (Math.abs(msg.vx) > 0.1 || Math.abs(msg.vy) > 0.1) {
          if (Math.random() > 0.7) {
            particlesRef.current.push({
              x: msg.x,
              y: msg.y,
              vx: (Math.random() - 0.5) * 0.5,
              vy: (Math.random() - 0.5) * 0.5,
              life: 0.5,
              color: msg.color,
            });
          }
        }

        // Wrap around screen edges
        if (msg.x - msg.size > window.innerWidth) {
          msg.x = -msg.size;
        }
        if (msg.x + msg.size < 0) {
          msg.x = window.innerWidth + msg.size;
        }
        if (msg.y - msg.size > window.innerHeight) {
          msg.y = -msg.size;
        }
        if (msg.y + msg.size < 0) {
          msg.y = window.innerHeight + msg.size;
        }

        // Collision with other messages
        for (let i = idx + 1; i < messagesRef.current.length; i++) {
          const other = messagesRef.current[i];
          const dx = other.x - msg.x;
          const dy = other.y - msg.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = msg.size + other.size + 10;

          if (dist < minDist) {
            // Simple separation without elastic collision
            const angle = Math.atan2(dy, dx);
            const overlap = minDist - dist;
            const moveX = (Math.cos(angle) * overlap) / 2;
            const moveY = (Math.sin(angle) * overlap) / 2;

            msg.x -= moveX;
            msg.y -= moveY;
            other.x += moveX;
            other.y += moveY;

            createTouchParticles((msg.x + other.x) / 2, (msg.y + other.y) / 2);
          }
        }

        ctx.fillStyle = msg.color;
        ctx.beginPath();
        ctx.arc(msg.x, msg.y, msg.size, 0, Math.PI * 2);
        ctx.fill();

        const isHovered =
          hoveredMessageRef.current === msg.id && msg.text.length > 0;
        ctx.fillStyle = isHovered ? "#ffffff" : "#e0e0e0";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Display author name
        ctx.fillText(msg.author, msg.x, msg.y - 14);

        // Display message text
        ctx.font = "11px Arial";
        ctx.fillStyle = isHovered ? "#ffffff" : "#f5f5f5";
        if (isHovered) {
          // Show full text on hover
          const maxChars = 35;
          const words = msg.text.split(" ");
          let line = "";
          let lines = [];

          words.forEach((word) => {
            if ((line + word).length > maxChars) {
              lines.push(line.trim());
              line = word;
            } else {
              line += (line ? " " : "") + word;
            }
          });
          if (line) lines.push(line);

          lines.slice(0, 3).forEach((l, idx) => {
            ctx.fillText(l, msg.x, msg.y + 2 + idx * 12);
          });
        } else {
          // Truncated on hover out
          if (msg.text.length > 25) {
            const line1 = msg.text.substring(0, 25) + "...";
            ctx.fillText(line1, msg.x, msg.y + 2);
          } else {
            ctx.fillText(msg.text, msg.x, msg.y + 2);
          }
        }

        // Display date and time
        ctx.font = "9px Arial";
        ctx.fillStyle = "#f5f5f5";
        const date = msg.createdAt.toLocaleDateString("fr-FR");
        const time = msg.createdAt.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const dateTimeY = isHovered ? msg.y + 40 : msg.y + 20;
        ctx.fillText(`${date} ${time}`, msg.x, dateTimeY);

        if (isHovered) {
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(msg.x, msg.y, msg.size + 5, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      let foundHover = false;
      messagesRef.current.forEach((msg) => {
        const dx = x - msg.x;
        const dy = y - msg.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < msg.size + 10) {
          setHoveredMessage(msg.id);
          foundHover = true;
        }
      });

      if (!foundHover) {
        setHoveredMessage(null);
      }
    };

    const handleClick = (e: MouseEvent) => {
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

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 bg-gradient-to-b from-black via-black to-transparent px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 z-40"
      >
        <div className="max-w-6xl mx-auto flex items-start gap-2 sm:gap-3">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onExit}
            className="bg-purple-600 hover:bg-purple-700 flex-shrink-0 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded text-white flex items-center gap-1 sm:gap-2 text-xs sm:text-sm cursor-pointer border-none whitespace-nowrap"
          >
            <ArrowLeft size={16} className="sm:w-4.5 md:w-5" />
            <span>Quitter</span>
          </motion.button>

          <div className="flex-1 text-center min-w-0">
            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-purple-400 mb-1 line-clamp-2">
              {bubble.title}
            </h2>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 text-gray-300 text-[10px] sm:text-xs md:text-sm">
              {bubble.isAnonymous ? (
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <Skull className="h-4 w-4 text-purple-400" />
                  <span className="text-purple-400 font-semibold">Anonyme</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <div className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center">
                    <UserIcon iconName={bubble.author.iconName} size="small" />
                  </div>
                  <span className="text-purple-400 font-semibold">
                    {bubble.author.username}
                  </span>
                </span>
              )}
              <span className="flex items-center gap-1 whitespace-nowrap">
                📅 {new Date(bubble.createdAt).toLocaleDateString("fr-FR")}
              </span>
              <span className="flex items-center gap-1 whitespace-nowrap">
                💬 {bubble.messages.length} messages
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Input - Bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent pt-8 pb-4 px-3 sm:px-4 md:px-6 z-40"
      >
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-2 text-gray-500 text-[9px] sm:text-[10px]">
            💬 Clique sur une bulle pour l'animation et voir la suite
          </div>

          {/* Anonymous toggle */}
          <div className="flex items-center gap-2 mb-2 px-1">
            <button
              onClick={() => setIsAnonymousMsg((v) => !v)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all ${
                isAnonymousMsg
                  ? "bg-purple-900/60 border-purple-500 text-purple-300"
                  : "bg-gray-900/60 border-gray-700 text-gray-400 hover:border-gray-500"
              }`}
            >
              <Skull size={11} />
              Anonyme
            </button>
          </div>

          {/* Input row */}
          <div className="flex items-center gap-2 bg-gray-900/80 border border-gray-700 focus-within:border-purple-500 focus-within:shadow-[0_0_12px_rgba(168,85,247,0.25)] rounded-2xl px-3 py-2 transition-all">
            <input
              type="text"
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Lâche ton opinion..."
              className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 focus:outline-none"
            />
            <button
              onClick={handleSend}
              disabled={isSending || !newReply.trim()}
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                isSending || !newReply.trim()
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_8px_rgba(168,85,247,0.4)]"
              }`}
            >
              {isSending ? (
                <Loader size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function BubbleSessionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEntering, setIsEntering] = useState(true);
  const [showSession, setShowSession] = useState(false);

  const { data: bubbleData, loading } = useQuery(GET_BUBBLE_BY_ID, {
    variables: { id: id || "" },
    skip: !id,
    fetchPolicy: "cache-and-network",
    pollInterval: 3000,
  });

  const selectedBubble = bubbleData?.getBubbleById;

  useEffect(() => {
    if (selectedBubble) {
      setTimeout(() => {
        setIsEntering(false);
        setShowSession(true);
      }, 800);
    }
  }, [selectedBubble]);

  if (loading) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!selectedBubble) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center">
        <div className="text-purple-400">Bulle non trouvée</div>
      </div>
    );
  }

  return (
    <>
      {isEntering && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 bg-black z-[100] pointer-events-none"
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
        <BubbleSessionContent
          bubble={selectedBubble}
          onExit={() => navigate("/bubbles")}
        />
      )}
    </>
  );
}

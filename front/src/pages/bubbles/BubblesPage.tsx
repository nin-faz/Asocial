import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { GET_BUBBLES } from "../../queries";
import { CREATE_BUBBLE, DELETE_BUBBLE } from "../../mutations";
import { BubbleData } from "../../types/bubbles";
import { Loader, Plus, Skull, Trash2 } from "lucide-react";
import UserIcon from "../../components/icons/UserIcon";
import { AuthContext } from "../../context/AuthContext";

interface CreateBubbleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, isAnonymous: boolean) => void;
}

const CreateBubbleModal: React.FC<CreateBubbleModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  if (!isOpen) return null;

  const handleCreate = () => {
    if (title.trim()) {
      onCreate(title, isAnonymous);
      setTitle("");
      setIsAnonymous(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-lg p-6 max-w-md w-full border border-purple-900"
      >
        <h2 className="text-2xl font-bold text-purple-400 mb-4">
          Créer une Bulle 🫧
        </h2>

        {/* Avatar + Input */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && title.trim()) {
                  handleCreate();
                }
              }}
              placeholder="Quel est ton sujet de débat?"
              className="w-full bg-gray-800 text-white rounded px-4 py-2 border border-gray-700 focus:border-purple-500 focus:outline-none"
              autoFocus
            />
          </div>
        </div>

        {/* Anonymous Toggle */}
        <div className="flex items-center space-x-3 mb-6 px-4">
          <input
            type="checkbox"
            id="anonymous"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="w-4 h-4 rounded border-gray-600 cursor-pointer"
          />
          <label
            htmlFor="anonymous"
            className="text-gray-300 text-sm cursor-pointer"
          >
            Créer anonymement
          </label>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors font-semibold"
          >
            Annuler
          </button>
          <button
            onClick={handleCreate}
            disabled={!title.trim()}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Créer
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface DeleteBubbleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  bubbleTitle: string;
}

const DeleteBubbleModal: React.FC<DeleteBubbleModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  bubbleTitle,
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-lg p-6 max-w-md w-full border border-red-900"
      >
        <h2 className="text-2xl font-bold text-red-400 mb-2">
          Supprimer cette bulle?
        </h2>
        <p className="text-gray-300 mb-6">
          Êtes-vous sûr de vouloir supprimer "
          <span className="text-purple-400 font-semibold">{bubbleTitle}</span>"?
          Cette action est irréversible.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors font-semibold"
          >
            Supprimer
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function BubblesPage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext) || {};
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bubbleToDelete, setBubbleToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Fetch bubbles
  const {
    data: bubblesData,
    refetch: refetchBubbles,
    loading,
  } = useQuery(GET_BUBBLES, {
    variables: { limit: 20, offset: 0 },
  });

  // Create bubble mutation
  const [createBubbleMutation] = useMutation(CREATE_BUBBLE, {
    onCompleted: (data) => {
      if (data.createBubble.success) {
        refetchBubbles();
        setShowCreateModal(false);
      }
    },
  });

  // Delete bubble mutation
  const [deleteBubbleMutation] = useMutation(DELETE_BUBBLE, {
    onCompleted: () => {
      refetchBubbles();
    },
  });

  const bubbles = bubblesData?.getBubbles || [];

  const handleSelectBubble = (bubble: BubbleData) => {
    navigate(`/bubbles/${bubble.id}`);
  };

  const handleCreateBubble = (title: string, isAnonymous: boolean) => {
    if (title.trim()) {
      createBubbleMutation({
        variables: { title, isAnonymous },
      });
    }
  };

  const handleDeleteBubble = (
    e: React.MouseEvent,
    bubbleId: string,
    bubbleTitle: string,
  ) => {
    e.stopPropagation();
    setBubbleToDelete({ id: bubbleId, title: bubbleTitle });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!bubbleToDelete) return;

    // Fermer la modale immédiatement
    setShowDeleteModal(false);
    setBubbleToDelete(null);

    // Supprimer en arrière-plan
    deleteBubbleMutation({
      variables: { id: bubbleToDelete.id },
    });
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-purple-400 mb-3">
              🫧 Bubbles
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Rejoins ou crée ta session de débat en temps réel
            </p>
          </div>
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0px 0px 20px rgba(128, 0, 128, 0.5)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 hover:bg-purple-700 px-3 sm:px-6 py-2 sm:py-3 rounded-lg text-white font-semibold transition-colors flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start"
          >
            <Plus size={18} className="sm:w-5" />
            <span className="hidden sm:inline">Créer une Bulle</span>
            <span className="sm:hidden">Créer</span>
          </motion.button>
        </motion.div>

        {/* Bubbles Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader />
          </div>
        ) : bubbles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-gray-400"
          >
            <p className="mb-4">Aucune bulle pour le moment...</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-purple-400 hover:text-purple-300 underline"
            >
              Sois le premier à en créer une!
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bubbles.map((bubble: BubbleData, idx: number) => (
              <motion.div
                key={bubble.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                onClick={() => handleSelectBubble(bubble)}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-5 border border-purple-900 hover:border-purple-700 cursor-pointer transition-all"
              >
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-3 justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="flex self-start text-2xl">🫧</span>
                      <h3 className="text-lg font-semibold text-purple-400 line-clamp-2">
                        {bubble.title}
                      </h3>
                    </div>
                    {user?.id === bubble.author.id && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) =>
                          handleDeleteBubble(e, bubble.id, bubble.title)
                        }
                        className="flex items-center text-red-500 hover:text-red-400 transition-colors flex-shrink-0"
                        title="Supprimer cette bulle"
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    {bubble.isAnonymous ? (
                      <>
                        <div className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center">
                          <Skull className="h-6 w-6 text-purple-400" />
                        </div>
                        <span className="text-purple-300 font-semibold">
                          Anonyme
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center">
                          <UserIcon
                            iconName={bubble.author.iconName}
                            size="small"
                          />
                        </div>
                        <span className="text-purple-300 font-semibold">
                          {bubble.author.username}
                        </span>
                      </>
                    )}
                  </p>
                </div>

                <div className="flex items-center justify-between text-gray-400 text-sm">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      💬 {bubble.messages.length}
                    </span>
                    <span className="text-xs text-gray-300">
                      {new Date(bubble.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>

                <motion.div
                  whileHover={{ width: "100%" }}
                  className="mt-4 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded w-0 origin-left"
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreateBubbleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateBubble}
      />

      {/* Delete Modal */}
      <DeleteBubbleModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        bubbleTitle={bubbleToDelete?.title || ""}
      />
    </div>
  );
}

import React, { useState, useRef, useCallback } from "react";
import { X, Upload } from "lucide-react";
import { imageUpload } from "../utils/imageUpload";
import imageCompression from "browser-image-compression";

interface ImageUploaderProps {
  imageUrl: string | null;
  onImageChange: (url: string | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  imageUrl,
  onImageChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      // Vérifiez si le fichier est une image
      if (!file.type.startsWith("image/")) {
        alert("Veuillez sélectionner une image valide.");
        return;
      }

      // Vérifiez la taille du fichier (limite à 5 MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(
          "L'image est trop grande. Veuillez sélectionner une image de moins de 5 MB."
        );
        return;
      }

      setLoading(true);
      try {
        // Redimensionnement et compression côté client
        const options = {
          maxWidthOrHeight: 800, // Limite la taille à 800px (largeur ou hauteur max)
          useWebWorker: true,
          initialQuality: 0.6, // Baisse la qualité pour une compression plus forte
          fileType: "image/webp", // Force le format WebP
          maxSizeMB: 0.1, // Limite la taille à 100 Ko
        };
        const compressedFile = await imageCompression(file, options);

        const webpFile = new File(
          [compressedFile],
          compressedFile.name.replace(/\.(jpe?g|png|gif)$/i, ".webp"),
          { type: "image/webp" }
        );
        const uploadedUrl = await imageUpload(webpFile);

        if (uploadedUrl) {
          onImageChange(uploadedUrl); // Stocke l'URL hébergée
        } else {
          alert("Échec de l'envoi de l'image.");
        }
      } catch (error) {
        console.error("Erreur d'upload :", error);
      } finally {
        setLoading(false);
      }
    },
    [onImageChange]
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    processFile(file);
  };

  const handleRemoveImage = () => {
    // Assurons-nous que la valeur est explicitement null pour la base de données
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Gestion des événements de glisser-déposer
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Assurons-nous que l'état isDragging reste true pendant toute la durée du glisser
    setIsDragging(true);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        processFile(file);
      }
    },
    [processFile]
  );

  // Support pour le presse-papier (coller)
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      const items = e.clipboardData.items;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
            break;
          }
        }
      }
    },
    [processFile]
  );

  return (
    <div className="mt-4 mb-4" onPaste={handlePaste}>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        ref={fileInputRef}
        className="hidden"
      />

      {imageUrl ? (
        <div className="relative">
          <img
            src={imageUrl}
            alt="Article"
            className="max-h-80 rounded-lg mx-auto my-2"
          />
          <button
            onClick={handleRemoveImage}
            className="absolute top-4 right-4 text-gray-400 hover:text-purple-400 z-10"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      ) : (
        <div
          ref={dropAreaRef}
          onClick={handleButtonClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          tabIndex={0}
          className={`w-full border-2 border-dashed ${
            isDragging
              ? "border-purple-400 bg-gray-800 ring-2 ring-purple-500"
              : "border-purple-600"
          } rounded-lg p-6 flex flex-col items-center justify-center hover:bg-gray-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500`}
        >
          {loading ? (
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-10 w-10 rounded-full bg-purple-600 animate-spin mb-2"></div>
              <p className="text-gray-400">Chargement...</p>
            </div>
          ) : (
            <>
              <Upload
                className={`h-10 w-10 ${
                  isDragging ? "text-purple-400" : "text-purple-500"
                } mb-2`}
              />
              <p
                className={`${
                  isDragging ? "text-purple-300" : "text-purple-500"
                } mb-2 font-medium`}
              >
                {isDragging ? "Déposez l'image ici" : "Ajouter une image"}
              </p>
              {/* Le reste du contenu n'est affiché que si on n'est pas en train de glisser */}
              {!isDragging && (
                <>
                  <p className="hidden sm:block text-gray-500 text-sm">
                    Glissez-déposez une image ou cliquez pour la sélectionner
                  </p>
                  <p className="hidden sm:block text-gray-500 text-xs mt-1">
                    Vous pouvez aussi copier une image ailleurs puis appuyer sur
                    Ctrl+V ici
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    JPG, PNG, GIF jusqu'à 5MB
                  </p>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;

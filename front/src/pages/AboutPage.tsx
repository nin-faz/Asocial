import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  ThumbsDown,
  MessageSquare,
  Users,
  Shield,
  Bomb,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: ThumbsDown,
    title: "Dislikes Uniquement",
    description:
      "Fini les likes hypocrites. Exprimez votre désapprobation authentique avec nos dislikes.",
  },
  {
    icon: Shield,
    title: "Anti-Algorithme",
    description:
      "Pas de bulles de filtres. Pas de contenu suggéré. Juste le chaos pur et non filtré.",
  },
  {
    icon: Users,
    title: "Anti-Social",
    description:
      "Transformez vos followers en détracteurs et vos amis en cibles. L'authenticité dans sa forme la plus pure.",
  },
  {
    icon: Bomb,
    title: "Chaos Organisé",
    description:
      "Une plateforme où le désordre est la norme et la négativité est célébrée.",
  },
  {
    icon: MessageSquare,
    title: "Conversations Brutes",
    description:
      "Pas de censure algorithmique. Vos pensées, aussi sombres soient-elles, méritent d'être entendues.",
  },
  {
    icon: Zap,
    title: "Impact Négatif",
    description:
      "Créez des ondes de choc dans le void digital. Votre influence se mesure en perturbations.",
  },
];

const AboutPage = () => {
  useEffect(() => {
    document.title = "À propos";
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-20"
      >
        {/* <motion.div
         className="mx-auto w-24 h-24 bg-purple-900 rounded-full flex items-center justify-center mb-8"> */}
        <div className="flex justify-center mb-8">
          <motion.img
            whileHover={{ scale: 1.05 }}
            src="/logo.svg"
            alt="Logo Asocial"
            className="flex items-center cursor-pointer w-16 h-16"
          />
          {/* </motion.div> */}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-purple-400 mb-6">
          Bienvenue dans l'Anti-Social
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Asocial est né d'une rébellion contre la fausse positivité des réseaux
          sociaux traditionnels. Nous célébrons l'authenticité brute et le rejet
          des normes sociales numériques.
        </p>
      </motion.div>

      {/* Manifesto */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-900 rounded-lg p-8 mb-20 border border-purple-900 hover:shadow-lg hover:shadow-purple-500/50 transition"
      >
        <h2 className="text-3xl font-bold text-purple-400 mb-6">
          Notre Manifeste
        </h2>
        <div className="prose prose-invert max-w-none text-gray-300">
          <p className="text-lg mb-4">
            Dans un monde numérique saturé de positivité toxique et de
            connexions superficielles, Asocial émerge comme un havre de paix
            pour les âmes numériques fatiguées des conventions sociales.
          </p>
          <p className="text-lg mb-4">
            Nous rejetons les algorithmes qui façonnent vos pensées, les likes
            qui valident votre existence, et les filtres qui masquent votre
            vraie nature.
          </p>
          <p className="text-lg">
            Ici, votre valeur ne se mesure pas en followers, mais en impact. Pas
            en likes, mais en perturbations causées dans le système. Bienvenue
            dans la révolution anti-sociale.
          </p>
        </div>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {features.map((feature) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0px 0px 20px rgba(128, 0, 128, 0.5)",
              transition: { duration: 0.15 },
            }}
            whileTap={{ scale: 0.95 }}
            className="bg-gray-900 rounded-lg p-6 border border-purple-900"
          >
            <div className="w-12 h-12 bg-purple-900/50 rounded-lg flex items-center justify-center mb-4">
              <feature.icon className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-purple-400 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-400">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center mt-20"
      >
        <h2 className="text-3xl font-bold text-purple-400 mb-6">
          Prêt à Embrasser le Chaos ?
        </h2>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Rejoignez la communauté des dissidents numériques et découvrez la
          liberté d'être authentiquement négatif.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          onClick={() => (window.location.href = "/auth")}
        >
          Commencer la Destruction
        </motion.button>
      </motion.div>
    </main>
  );
};

export default AboutPage;

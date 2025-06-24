import { useQuery } from "@apollo/client";
import { GET_LEADERBOARD } from "../queries/userQuery";
import Loader from "../components/Loader";
import { BadgeTop1, BadgePreset } from "../components/BadgeTop1";
import UserIcon from "../components/icons/UserIcon";
import { useEffect } from "react";

export default function LeaderboardPage() {
  const { data, loading, error } = useQuery(GET_LEADERBOARD);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) return <Loader />;
  if (error)
    return (
      <div className="flex h-screen items-center justify-center text-red-500 py-10 text-lg font-bold">
        Erreur lors du chargement du classement.
      </div>
    );

  const users = [...(data?.findAllUsers || [])].sort(
    (a, b) => (b.scoreGlobal ?? 0) - (a.scoreGlobal ?? 0)
  );

  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <div className="flex flex-col items-center mb-10">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 tracking-tight">
            Classement Asocial
          </h1>
        </div>
        <p className="text-gray-400 text-lg text-center max-w-xl">
          Qui règne sur le chaos ? Voici le top des utilisateurs les plus
          influents (ou détestés) de la plateforme !
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl shadow-xl bg-gradient-to-br from-black via-gray-900 to-purple-950 p-2">
        <table className="w-full text-left min-w-[600px]">
          <thead>
            <tr className="border-b border-purple-800 text-purple-300">
              <th className="py-3 px-2 text-center">Rang</th>
              <th className="py-3 px-2">Utilisateur</th>
              <th className="py-3 px-2 text-center">Score</th>
              <th className="py-3 px-2 text-center">Commentaires</th>
              <th className="py-3 px-2 text-center">Dislikes</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => {
              let rowClass = "hover:bg-purple-900/30";
              if (idx === 0)
                rowClass =
                  "bg-gradient-to-r from-yellow-200/20 to-yellow-100/10 text-yellow-300 font-bold scale-[1.0] shadow-lg";
              else if (idx === 1)
                rowClass =
                  "bg-gradient-to-r from-gray-300/10 to-purple-200/10 text-purple-200 font-semibold";
              else if (idx === 2)
                rowClass =
                  "bg-gradient-to-r from-orange-200/10 to-pink-200/10 text-pink-200 font-semibold";

              const comments =
                user.TotalComments !== undefined ? user.TotalComments : "-";
              const dislikes =
                user.TotalDislikes !== undefined ? user.TotalDislikes : "-";

              return (
                <tr key={user.id} className={`transition-all ${rowClass}`}>
                  <td className="py-3 px-2 text-center text-2xl">
                    {idx === 0 || idx === 1 || idx === 2 ? (
                      idx + 1
                    ) : (
                      <span className="text-gray-400">{idx + 1}</span>
                    )}
                  </td>
                  <td className="py-3 px-2 flex items-center gap-3">
                    <span
                      className="flex w-8 h-8 bg-gray-800 rounded-full items-center justify-center border-2 border-purple-500 cursor-pointer hover:ring-2 hover:ring-purple-400 transition"
                      onClick={() =>
                        (window.location.href = `/users/${user.id}`)
                      }
                      title={`Voir le profil de ${user.username}`}
                    >
                      <UserIcon iconName={user.iconName} size="small" />
                    </span>
                    <span
                      className="font-bold text-purple-200 text-lg cursor-pointer hover:underline"
                      onClick={() =>
                        (window.location.href = `/users/${user.id}`)
                      }
                      title={`Voir le profil de ${user.username}`}
                    >
                      {user.username}
                    </span>
                    {idx === 0 && (
                      <BadgeTop1
                        message={user.top1BadgeMessage}
                        color={user.top1BadgeColor}
                        preset={user.top1BadgePreset as BadgePreset}
                        className="ml-2"
                      />
                    )}
                  </td>
                  <td className="py-3 px-2 text-center text-purple-300 font-bold text-lg">
                    {user.scoreGlobal?.toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-center">
                    {idx <= 2 ? (
                      comments
                    ) : (
                      <span className="text-gray-400">{comments}</span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-center">
                    {idx <= 2 ? (
                      dislikes
                    ) : (
                      <span className="text-gray-400">{dislikes}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}

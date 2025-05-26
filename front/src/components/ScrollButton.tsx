// import { ArrowDown, ArrowUp } from "lucide-react";
// import { useEffect, useState } from "react";

// type Props = {
//   targetRef: React.RefObject<HTMLElement>;
// };

// const ScrollButton = ({ targetRef }: Props) => {
//   const [isVisible, setIsVisible] = useState(false);
//   const [showArrowUp, setShowArrowUp] = useState(false);

//   useEffect(() => {
//     const toggleVisibility = () => {
//       const scrollTop = window.scrollY;
//       const targetTop = targetRef.current?.offsetTop ?? 0;

//       setIsVisible(scrollTop > 100);
//       setShowArrowUp(scrollTop >= targetTop - 100); // marge pour le déclenchement
//     };

//     window.addEventListener("scroll", toggleVisibility);
//     return () => window.removeEventListener("scroll", toggleVisibility);
//   }, [targetRef]);

//   const handleClick = () => {
//     if (showArrowUp) {
//       window.scrollTo({ top: 0, behavior: "smooth" });
//     } else if (targetRef.current) {
//       targetRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   };

//   if (!isVisible) return null;

//   return (
//     <button
//       onClick={handleClick}
//       className="fixed bottom-5 right-5 p-3 rounded-full bg-purple-600 text-white shadow-lg hover:bg-purple-500 transition z-50"
//     >
//       {showArrowUp ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
//     </button>
//   );
// };

// export default ScrollButton;

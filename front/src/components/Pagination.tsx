import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  disabledPrev?: boolean;
  disabledNext?: boolean;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  disabledPrev = false,
  disabledNext = false,
  className = "",
}) => (
  <div className={`flex justify-between items-center mt-6 ${className}`}>
    <button
      onClick={onPrev}
      disabled={disabledPrev}
      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
    >
      Précédent
    </button>
    <span className="text-white">
      Page {totalPages === 0 ? 0 : currentPage} sur {totalPages}
    </span>
    <button
      onClick={onNext}
      disabled={disabledNext}
      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
    >
      Suivant
    </button>
  </div>
);

export default Pagination;

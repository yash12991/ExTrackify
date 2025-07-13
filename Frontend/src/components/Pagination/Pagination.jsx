const Pagination = ({ page, totalPages, onPrevious, onNext }) => {
  return (
    <div className="pagination">
      <button 
        onClick={onPrevious} 
        className="btn border-t-neutral-500 bg-red-600"
        disabled={page === 1}
      >
        Previous
      </button>
      <span className="page-info">Page {page} of {totalPages}</span>
      <button 
        onClick={onNext}
        className="btn border-t-neutral-500 bg-red-600"
        disabled={page === totalPages}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
import { useState, useCallback } from "react";

/**
 * Custom hook for handling API calls with loading and error states
 * @param {Function} apiFunction - The API function to call
 * @returns {Object} - { data, loading, error, execute }
 */
export const useApi = (apiFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiFunction(...args);
        setData(result.data);
        return result.data;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || err.message || "An error occurred";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  return { data, loading, error, execute };
};

/**
 * Hook for managing paginated API calls
 * @param {Function} apiFunction - The API function that returns paginated data
 * @param {number} initialPage - Initial page number
 * @param {number} itemsPerPage - Items per page
 */
export const usePagination = (apiFunction, initialPage = 1, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const { data, loading, error, execute } = useApi(apiFunction);

  const fetchPage = useCallback(
    async (page = currentPage, ...args) => {
      const result = await execute({ page, limit: itemsPerPage, ...args });
      if (result?.pagination) {
        setTotalPages(result.pagination.totalPages);
        setTotalItems(result.pagination.totalItems);
        setCurrentPage(result.pagination.currentPage);
      }
      return result;
    },
    [currentPage, itemsPerPage, execute]
  );

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return {
    data,
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    fetchPage,
    nextPage,
    prevPage,
    goToPage,
  };
};

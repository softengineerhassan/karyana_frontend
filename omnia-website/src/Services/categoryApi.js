import Axios from "./axios";

export const getVenuesByCategory = (categoryId, params = {}) => {
  return Axios.get(`/categories/${categoryId}/venues`, { params });
};

// Mirror of customer app: GET /categories/{categoryId}/subcategories
export const getSubcategories = (categoryId, params = {}) => {
  return Axios.get(`/categories/${categoryId}/subcategories`, {
    params: { page: 1, page_size: 20, ...params },
  });
};

// Fetch all top-level categories (for category header info)
export const getCategories = (params = {}) => {
  return Axios.get('/categories', { params });
};

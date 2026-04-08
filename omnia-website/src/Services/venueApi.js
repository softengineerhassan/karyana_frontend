import Axios from "./axios";

export const getVenueDetail = (venueId, params = {}) => {
  return Axios.get(`/venues/${venueId}/full`, { params });
};

export const getVenues = (params = {}) => {
  return Axios.get('/venues', { params });
};

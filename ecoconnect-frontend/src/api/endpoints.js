import api from './axios';

// ===== AUTH =====
export const login = (data) => api.post('/auth/login', data);
export const signup = (data) => api.post('/auth/signup', data);

// ===== USER =====
export const updateLocation = (data) => api.put('/users/me/location', data);

// ===== LISTINGS =====
export const createListing = (data) => api.post('/listings', data);
export const getActiveListings = () => api.get('/listings');
export const getMyListings = () => api.get('/listings/mine');
export const getMatchedListings = () => api.get('/listings/matched');
export const acceptListing = (id, data) => api.post(`/listings/${id}/accept`, data);
export const reconfirmListing = (id, data) => api.put(`/listings/${id}/reconfirm`, data);

// ===== PLANT PREFERENCES =====
export const setPlantPreferences = (data) => api.post('/plant-preferences', data);
export const getPlantPreferences = () => api.get('/plant-preferences/mine');

// ===== ORDERS =====
export const getMyOrders = () => api.get('/orders/mine');

// ===== PICKUP BATCHES =====
export const createBatch = (data) => api.post('/pickup-batches', data);
export const getMyBatches = () => api.get('/pickup-batches/mine');
export const getAssignedBatches = () => api.get('/pickup-batches/assigned');
export const getAgentHistory = () => api.get('/pickup-batches/history');   // all statuses
export const assignAgent = (batchId, data) => api.put(`/pickup-batches/${batchId}/assign-agent`, data);

// ===== PICKUP STOPS =====
export const updateStopStatus = (stopId, data) => api.put(`/pickup-stops/${stopId}/status`, data);

// ===== AGENTS =====
export const getAvailableAgents = () => api.get('/agents/available');

// ===== WALLET =====
export const getWallet = () => api.get('/wallet/mine');

// ===== AI SERVICES =====
// Knowledge-based Price Recommendation System
export const getPriceRecommendation = ({ wasteType, quantityKg, distanceKm = 0, urgencyScore = 0 }) =>
  api.get('/ai/price-recommendation', { params: { wasteType, quantityKg, distanceKm, urgencyScore } });

import { BASE_URL } from "../api/apiClient";

// Get the base URL without /api suffix for WebSocket connections
const getWebSocketUrl = () => {
    return BASE_URL
    // return BASE_URL.replace(/\/api$/, '')
};

export const WS_URL = getWebSocketUrl();

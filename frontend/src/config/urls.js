// Конфигурация URL'ов для разных окружений
export const API_URLS = {
    local: 'http://localhost:3003',
    tunnel: 'https://copy-breakdown-expanding-within.trycloudflare.com',
};

export const FRONTEND_URLS = {
    local: 'http://localhost:3002',
    tunnel: 'https://54e52db21968.ngrok.app',
};

// Функция для простого обновления URL'ов
export const updateTunnelUrls = (newBackendUrl, newFrontendUrl) => {
    if (newBackendUrl) {
        API_URLS.tunnel = newBackendUrl;
    }
    if (newFrontendUrl) {
        FRONTEND_URLS.tunnel = newFrontendUrl;
    }
}; 
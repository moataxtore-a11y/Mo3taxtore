import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const apiTarget = env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:5000';

    return {
        plugins: [
            react(),
            tailwindcss(),
            VitePWA({
                disable: mode === 'development',
                registerType: 'autoUpdate',
                injectRegister: 'auto',
                includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg', 'LOGO.svg'],
                manifest: {
                    name: 'معتز ستور - منصة تعليمية',
                    short_name: 'معتز ستور',
                    description: 'منصة تعليمية لشراء الكتب والملازم الدراسية بسهولة وأمان.',
                    theme_color: '#069484',
                    background_color: '#E0F3E9',
                    display: 'standalone',
                    orientation: 'portrait',
                    scope: '/',
                    start_url: '/',
                    icons: [{
                            src: '/LOGO.svg',
                            sizes: '192x192',
                            type: 'image/svg+xml',
                            purpose: 'any'
                        },
                        {
                            src: '/LOGO.svg',
                            sizes: '512x512',
                            type: 'image/svg+xml',
                            purpose: 'maskable'
                        }
                    ]
                },
                workbox: {
                    navigateFallback: '/index.html',
                    navigateFallbackDenylist: [/^\/api/, /^\/uploads/],
                    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
                    runtimeCaching: [{
                            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'google-fonts-cache',
                                expiration: {
                                    maxEntries: 10,
                                    maxAgeSeconds: 60 * 60 * 24 * 365
                                },
                                cacheableResponse: {
                                    statuses: [0, 200]
                                }
                            }
                        },
                        {
                            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'gstatic-fonts-cache',
                                expiration: {
                                    maxEntries: 10,
                                    maxAgeSeconds: 60 * 60 * 24 * 365
                                },
                                cacheableResponse: {
                                    statuses: [0, 200]
                                }
                            }
                        },
                        {
                            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
                            handler: 'NetworkFirst',
                            options: {
                                cacheName: 'api-cache',
                                expiration: {
                                    maxEntries: 50,
                                    maxAgeSeconds: 60 * 60 * 24
                                },
                                cacheableResponse: {
                                    statuses: [0, 200]
                                }
                            }
                        },
                        {
                            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|pdf)$/,
                            handler: 'StaleWhileRevalidate',
                            options: {
                                cacheName: 'assets-cache',
                                expiration: {
                                    maxEntries: 100,
                                    maxAgeSeconds: 60 * 60 * 24 * 30
                                }
                            }
                        }
                    ]
                }
            })
        ],
        optimizeDeps: {
            include: ['react', 'react-dom', 'recharts', 'framer-motion', 'react-icons/fi']
        },
        build: {
            rollupOptions: {
                output: {
                    manualChunks: {
                        vendor: ['react', 'react-dom', 'react-router-dom'],
                        charts: ['recharts'],
                        animation: ['framer-motion']
                    }
                }
            }
        },
        server: {
            watch: {
                usePolling: true,
            },
            hmr: {
                host: '127.0.0.1',
            },
            port: 5173,
            strictPort: true,
            allowedHosts: true,
            proxy: {
                '/api': {
                    target: apiTarget,
                    changeOrigin: true,
                    timeout: 60000,
                    proxyTimeout: 60000,
                },
                '/uploads': {
                    target: apiTarget,
                    changeOrigin: true,
                },
            },
        },
    };
});
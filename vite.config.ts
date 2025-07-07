import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import PeerDepsExternalPlugin from 'rollup-plugin-peer-deps-external';
import react from '@vitejs/plugin-react-swc';
import fs from 'fs';
import { defineConfig } from 'vite';

// Fixes the jwt format in url issue
const dotPathFixPlugin = () => ({
    name: 'dot-path-fix-plugin',
    configureServer: (server) => {
        server.middlewares.use((req, _, next) => {
            const reqPath = req.url.split('?', 2)[0];
            if (
                !req.url.startsWith('/@')
                && !fs.existsSync(`.${reqPath}`)
                && !req.url.startsWith('/api')
            ) {
                req.url = '/';
            }
            next();
        });
    }
});

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    plugins: [
        PeerDepsExternalPlugin(),
        react(),
        dotPathFixPlugin(),
    ],
    resolve: {
        alias: {
            // buffer: 'rollup-plugin-node-polyfills/polyfills/buffer-es6',
            // process: 'rollup-plugin-node-polyfills/polyfills/process-es6',
            stream: "stream-browserify",
        },
        dedupe: ['react', 'react-dom']
    },
    build:{
        sourcemap: true,
		minify: false,
        terserOptions: {
            compress: false,
            mangle: false,
        },
    },
    optimizeDeps: {
        include: ['lodash', 'react-confirm-alert', 'react-redux', 'react-dom', 'react-tooltip','dayjs/plugin/relativeTime', '@toast-ui/editor/dist/toastui-editor-viewer'],
        esbuildOptions: {
            // Node.js global to browser globalThis
            define: {
                global: 'globalThis'
            },
            // Enable esbuild polyfill plugins
            plugins: [
                NodeGlobalsPolyfillPlugin({
                    buffer: true
                })
            ]
        }
    },
    server: {
        allowedHosts: ["localhost", "collaborative-ui.local"],
        proxy: {
            '/api/': {
                target: "http://localhost",
                changeOrigin: true,
                secure: false,
                configure: (proxy, _options) => {
                    proxy.on('error', (err, _req, _res) => {
                        console.log('[vite-proxy] Proxy error', err);
                    });
                    proxy.on('proxyReq', (proxyReq, req, _res) => {
                        console.log('[vite-proxy] Sending Request to the Target:', req.method, req.url);
                    });
                    proxy.on('proxyRes', (proxyRes, req, _res) => {
                        console.log('[vite-proxy] Received Response from the Target:', proxyRes.statusCode, req.url);
                    });
                },
            }
        }
    },
})
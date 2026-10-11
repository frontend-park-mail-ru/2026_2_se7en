import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { imagetools } from 'vite-imagetools';
import { compression } from 'vite-plugin-compression2';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendUrl = env.VITE_BACKEND_URL;

  return {
    plugins: [
      imagetools({
        defaultDirectives: (url) => {
          if (url.searchParams.has('convert')) {
            return new URLSearchParams({
              format: 'webp',
              quality: '80',
            });
          }
          return new URLSearchParams();
        },
      }),

      compression({
        algorithm: 'gzip',
        threshold: 1024,
        include: /\.(js|css|html|json|svg)$/i,
        deleteOriginalAssets: false,
      }),
    ],

    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@styles': resolve(__dirname, 'src/styles'),
      },
    },

    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "@styles/variables" as *;
            @use "@styles/mixins" as *;
          `,
          silenceDeprecations: ['legacy-js-api'],
        },
      },
      modules: {
        localsConvention: 'camelCaseOnly',
      },
    },

    server: {
      port: 3000,
      open: true,
      proxy: {
        '/api/v1': {
          target: backendUrl,
          changeOrigin: true,
          secure: backendUrl.startsWith('https:'),
        },
      },
    },

    build: {
      outDir: 'dist',
      emptyOutDir: true,
      minify: 'esbuild',
      sourcemap: false,
      chunkSizeWarningLimit: 500,

      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
        output: {
          entryFileNames: 'assets/js/[name]-[hash].js',
          chunkFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name || '';
            if (/\.(css)$/.test(name)) return 'assets/css/[name]-[hash][extname]';
            if (/\.(png|jpe?g|gif|svg|webp|ico|avif)$/.test(name))
              return 'assets/images/[name]-[hash][extname]';
            if (/\.(woff2?|eot|ttf|otf)$/.test(name)) return 'assets/fonts/[name]-[hash][extname]';
            if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)$/.test(name))
              return 'assets/media/[name]-[hash][extname]';
            return 'assets/[name]-[hash][extname]';
          },
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
    },

    preview: {
      port: 4173,
      open: true,
    },
  };
});

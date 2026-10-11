import { defineConfig } from 'vite';
import { resolve } from 'path';
import { imagetools } from 'vite-imagetools';
import { compression } from 'vite-plugin-compression2';

export default defineConfig({
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
      '@styles/*': ['src/styles/*'],
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
});

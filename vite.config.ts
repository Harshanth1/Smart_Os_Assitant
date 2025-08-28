import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      // Needed for Node.js APIs like child_process
      optimizeDeps: {
        exclude: ['child_process']
      },
      // Allow Node.js built-in modules
      server: {
        hmr: true
      },
      build: {
        commonjsOptions: {
          transformMixedEsModules: true,
        },
      }
    };
});

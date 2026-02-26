import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  build: {
    // Output directory
    outDir: 'dist',
    
    // Generate sourcemaps for debugging (disable in production for smaller size)
    sourcemap: false,
    
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    },
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    
    // Rollup options for code splitting
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          // Vendor chunk for React and related libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // Separate chunk for pages
          'pages': [
            './src/pages/HomePage.jsx',
            './src/pages/DashboardPage.jsx',
            './src/pages/AdminPage.jsx',
            './src/pages/CoursePage.jsx',
            './src/pages/AssessmentPage.jsx'
          ]
        },
        
        // Asset file names
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          } else if (/woff|woff2|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        
        // Chunk file names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        
        // Entry file names
        entryFileNames: 'assets/js/[name]-[hash].js'
      }
    },
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Asset inline limit (smaller assets will be inlined as base64)
    assetsInlineLimit: 4096,
    
    // Target modern browsers for smaller bundle
    target: 'es2015',
    
    // Optimize dependencies
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
});

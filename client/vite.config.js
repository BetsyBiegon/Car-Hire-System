import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});

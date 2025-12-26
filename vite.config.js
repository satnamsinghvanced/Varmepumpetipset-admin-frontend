import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 4000,
  },
  preview: {
    port: 4000,
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-quill-new")) {
              return "quill";
            }
            if (id.includes("recharts")) {
              return "recharts";
            }
            if (id.includes("sweetalert2")) {
              return "sweetalert";
            }
            if (id.includes("tinymce")) {
              return "tinymce";
            }
            // General vendor chunk for common dependencies
            return "vendor";
          }
        },
      },
    },
  },
});

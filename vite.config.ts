import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        //target: "http://95.163.182.138:8998/api/v1",
        target: "http://localhost:8998/api/v1",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
        configure: (proxy, options) => {
          // This shit is needed for crappy apple browser Safari
          proxy.on("proxyRes", (proxyRes, req, res) => {
            const cookies = proxyRes.headers["set-cookie"];
            if (cookies) {
              // Map over all cookies and remove the Secure attribute for local dev
              proxyRes.headers["set-cookie"] = cookies.map((cookie) => {
                // Replace 'Secure' with an empty string, effectively deleting it
                return cookie.replace(/; Secure/gi, "");
              });
            }
          });
        },
      },
      "/ws": {
        target: "ws://localhost:8998/api/v1/chats",
        changeOrigin: true,
        ws: true,
      },
      "/avatar": {
        // target: "http://95.163.182.138:9000",
        target: "http://localhost:9000",
        changeOrigin: true,
      },
    },
  },
});

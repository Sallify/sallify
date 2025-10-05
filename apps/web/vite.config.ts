import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { nitroV2Plugin } from "@tanstack/nitro-v2-vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

const config = defineConfig({
  plugins: [
    viteTsConfigPaths({
      projects: ["./tsconfig.json", "../../packages/ui/tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart({
      spa: {
        enabled: true,
      },
    }),
    nitroV2Plugin({
      compatibilityDate: "2025-10-04",
    }),
    viteReact(),
  ],
  envDir: resolve(__dirname, "../../"),
  envPrefix: "VITE_",
  css: {
    modules: {
      localsConvention: "camelCase",
      generateScopedName: "[local]_[hash:base64:2]",
    },
  },
});

export default config;

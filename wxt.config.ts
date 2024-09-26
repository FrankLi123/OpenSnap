import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    permissions: ["activeTab", "downloads", "pageCapture"],
    action: {},
  },
  modules: ["@wxt-dev/module-react"],
});

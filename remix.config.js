// Related: https://github.com/remix-run/remix/issues/2835#issuecomment-1144102176
// Replace the HOST env var with SHOPIFY_APP_URL so that it doesn't break the remix server. The CLI will eventually
// stop passing in HOST, so we can remove this workaround after the next major release.
if (
  process.env.HOST &&
  (!process.env.SHOPIFY_APP_URL ||
    process.env.SHOPIFY_APP_URL === process.env.HOST)
) {
  process.env.SHOPIFY_APP_URL = process.env.HOST;
  delete process.env.HOST;
}

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"], // Ignores dotfiles in routes (e.g., .ts, .js)
  appDirectory: "app", // Points to the directory where your Remix app code resides
  serverModuleFormat: "cjs", // Use CommonJS format for server-side modules
  entryClientFile: "app/entry.client.tsx", // Points to the client-side entry file
  dev: {
    port: process.env.HMR_SERVER_PORT || 8002, // Hot module replacement server port
  },
  future: {
    // Keep future configuration options empty or specify any upcoming features (if needed)
  },
};

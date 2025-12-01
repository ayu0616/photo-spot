// @ts-check

/**
 * @type {import("lint-staged").Configuration}
 */
module.exports = {
  "**/*.{js,ts,jsx,tsx,html,css,json,jsonc}":
    "bunx biome check --write --unsafe",
  "**/*.{js,ts,jsx,tsx}|package.json": () => [
    "bunx tsc --noEmit",
    "bun run test",
  ],
};

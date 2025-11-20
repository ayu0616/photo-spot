// @ts-check

/**
 * @type {import("lint-staged").Configuration}
 */
module.exports = {
  "**/*.{js,ts,jsx,tsx,html,css,json,jsonc}":
    "bunx biome check --write --unsafe",
};

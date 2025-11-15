"use client";

import { SessionProvider as SP } from "@hono/auth-js/react";

export const SessionProvider: typeof SP = (props) => {
  return <SP {...props} />;
};

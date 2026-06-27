/** Cookie names as constants to avoid magic strings across the codebase. */
export const COOKIE_NAMES = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER: "user",
  TOKEN_TIMESTAMP: "tokenTimestamp",
} as const;
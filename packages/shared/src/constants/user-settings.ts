// packages/shared/src/constants/user-settings.ts

/**
 * Typed registry of all known UserSetting keys.
 * Values are stored as plain strings in the database (key/value store).
 * Use {@link UserSettingValueMap} and {@link parseUserSetting} to get typed values.
 */
export const USER_SETTING_KEYS = {
  // --- UI / Appearance ---
  /** Color theme: 'light' | 'dark' | 'system' */
  UI_THEME: "ui.theme",
  /** UI language code override (e.g. 'it', 'en'). Overrides preferredLanguageId at render time. */
  UI_LANGUAGE: "ui.language",
  /** Table/list density: 'compact' | 'comfortable' | 'spacious' */
  UI_DENSITY: "ui.density",
  /** Whether the main sidebar starts collapsed: 'true' | 'false' */
  UI_SIDEBAR_COLLAPSED: "ui.sidebar_collapsed",

  // --- Locale ---
  /** Date display format: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD' */
  LOCALE_DATE_FORMAT: "locale.date_format",
  /** Time display format: '24h' | '12h' */
  LOCALE_TIME_FORMAT: "locale.time_format",
  /** Preferred currency code ISO 4217 (e.g. 'EUR', 'USD') */
  LOCALE_CURRENCY: "locale.currency",
  /** Number format convention: 'EU' (1.234,56) | 'US' (1,234.56) */
  LOCALE_NUMBER_FORMAT: "locale.number_format",

  // --- Notifications ---
  /** Receive email notifications: 'true' | 'false' */
  NOTIFICATIONS_EMAIL: "notifications.email",
  /** Receive browser push notifications: 'true' | 'false' */
  NOTIFICATIONS_BROWSER: "notifications.browser",
  /** Activity reminders: 'true' | 'false' */
  NOTIFICATIONS_ACTIVITY_REMINDER: "notifications.activity_reminder",
  /** Notify on new lead assigned: 'true' | 'false' */
  NOTIFICATIONS_NEW_LEAD: "notifications.new_lead",
  /** Notify on document events (upload, sign, expire): 'true' | 'false' */
  NOTIFICATIONS_DOCUMENT: "notifications.document",

  // --- Dashboard ---
  /** Dashboard widget layout: 'grid' | 'list' */
  DASHBOARD_LAYOUT: "dashboard.layout",
  /** Default period for dashboard charts: 'week' | 'month' | 'quarter' | 'year' */
  DASHBOARD_DEFAULT_PERIOD: "dashboard.default_period",
} as const;

/** Union of all valid UserSetting key strings. */
export type UserSettingKey = (typeof USER_SETTING_KEYS)[keyof typeof USER_SETTING_KEYS];

/**
 * Typed value map for each UserSetting key.
 * Used by {@link parseUserSetting} and form validators to enforce valid values.
 */
export type UserSettingValueMap = {
  "ui.theme": "light" | "dark" | "system";
  "ui.language": string;
  "ui.density": "compact" | "comfortable" | "spacious";
  "ui.sidebar_collapsed": "true" | "false";
  "locale.date_format": "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
  "locale.time_format": "24h" | "12h";
  "locale.currency": string;
  "locale.number_format": "EU" | "US";
  "notifications.email": "true" | "false";
  "notifications.browser": "true" | "false";
  "notifications.activity_reminder": "true" | "false";
  "notifications.new_lead": "true" | "false";
  "notifications.document": "true" | "false";
  "dashboard.layout": "grid" | "list";
  "dashboard.default_period": "week" | "month" | "quarter" | "year";
};

/**
 * Default values for each UserSetting key.
 * Applied when a setting has not yet been persisted for the user.
 */
export const USER_SETTING_DEFAULTS: UserSettingValueMap = {
  "ui.theme": "system",
  "ui.language": "it",
  "ui.density": "comfortable",
  "ui.sidebar_collapsed": "false",
  "locale.date_format": "DD/MM/YYYY",
  "locale.time_format": "24h",
  "locale.currency": "EUR",
  "locale.number_format": "EU",
  "notifications.email": "true",
  "notifications.browser": "true",
  "notifications.activity_reminder": "true",
  "notifications.new_lead": "true",
  "notifications.document": "true",
  "dashboard.layout": "grid",
  "dashboard.default_period": "month",
};

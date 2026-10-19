"use client";

import React from "react";
import {
  CheckCircle,
  Truck,
  AlertTriangle,
  Lock,
  FileText,
  Clock,
  LucideProps,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────

export type TradeStatus = "delivered" | "in-transit" | "disputed" | "locked" | "draft" | "pending";

export interface StatusBadgeProps {
  status: TradeStatus | string;
  size?: "sm" | "md";
  showIcon?: boolean;
}

interface StatusConfig {
  label: string;
  icon: React.ComponentType<LucideProps>;
  dot: string;
  badge: string;
}

const DEFAULT_STATUS: StatusConfig = {
  label: "Unknown",
  icon: Clock,
  dot: "bg-text-muted",
  badge: "bg-surface-2 text-text-secondary border border-border-default",
};

export const STATUS_CONTRAST_TOKENS = {
  success: {
    light: "bg-status-success/15 text-status-success border-status-success/35",
    dark: "dark:bg-status-success/20 dark:text-status-success dark:border-status-success/40",
  },
  warning: {
    light: "bg-status-warning/15 text-status-warning border-status-warning/35",
    dark: "dark:bg-status-warning/20 dark:text-status-warning dark:border-status-warning/40",
  },
  danger: {
    light: "bg-status-danger/15 text-status-danger border-status-danger/35",
    dark: "dark:bg-status-danger/20 dark:text-status-danger dark:border-status-danger/40",
  },
  info: {
    light: "bg-status-info/15 text-status-info border-status-info/35",
    dark: "dark:bg-status-info/20 dark:text-status-info dark:border-status-info/40",
  },
  locked: {
    light: "bg-status-locked/15 text-status-locked border-status-locked/35",
    dark: "dark:bg-status-locked/20 dark:text-status-locked dark:border-status-locked/40",
  },
  draft: {
    light: "bg-status-draft/15 text-status-draft border-status-draft/35",
    dark: "dark:bg-status-draft/20 dark:text-status-draft dark:border-status-draft/40",
  },
  neutral: {
    light: "bg-surface-2 text-text-secondary border border-border-default",
    dark: "dark:bg-surface-2 dark:text-text-primary dark:border-border-hover",
  },
} as const;

const STATUS_TONES = {
  success: `bg-status-success/10 text-status-success border-status-success/25 ${STATUS_CONTRAST_TOKENS.success.dark}`,
  warning: `bg-status-warning/10 text-status-warning border-status-warning/25 ${STATUS_CONTRAST_TOKENS.warning.dark}`,
  danger: `bg-status-danger/10 text-status-danger border-status-danger/25 ${STATUS_CONTRAST_TOKENS.danger.dark}`,
  info: `bg-status-info/10 text-status-info border-status-info/25 ${STATUS_CONTRAST_TOKENS.info.dark}`,
  locked: `bg-status-locked/10 text-status-locked border-status-locked/25 ${STATUS_CONTRAST_TOKENS.locked.dark}`,
  draft: `bg-status-draft/10 text-status-draft border-status-draft/25 ${STATUS_CONTRAST_TOKENS.draft.dark}`,
  neutral: `bg-surface-2 text-text-secondary border border-border-default ${STATUS_CONTRAST_TOKENS.neutral.dark}`,
} as const;

const STATUS_ALIASES: Record<string, keyof typeof STATUS_TONES> = {
  delivered: "success",
  funded: "success",
  active: "success",
  completed: "success",
  settled: "success",
  resolved: "success",
  "in-transit": "warning",
  pending: "info",
  open: "warning",
  "under review": "warning",
  "under_review": "warning",
  created: "warning",
  disputed: "danger",
  cancelled: "neutral",
  closed: "neutral",
  locked: "locked",
  draft: "draft",
  "IN TRANSIT": "warning",
  PENDING: "info",
  SETTLED: "success",
  DISPUTED: "danger",
  DRAFT: "draft",
  "UNDER REVIEW": "warning",
  OPEN: "warning",
  RESOLVED: "success",
  CLOSED: "neutral",
  CANCELLED: "neutral",
  FUNDED: "success",
  ACTIVE: "success",
  COMPLETED: "success",
  DELIVERED: "success",
  CREATED: "warning",
};

export function getStatusBadgeClasses(status: string): string {
  const normalized = String(status ?? "").trim().toLowerCase();
  const tone = STATUS_ALIASES[normalized] ?? STATUS_ALIASES[status] ?? "neutral";
  return STATUS_TONES[tone];
}

export function getStatusDotClasses(status: string): string {
  const tone = STATUS_ALIASES[String(status ?? "").trim().toLowerCase()] ?? STATUS_ALIASES[status] ?? "neutral";
  const dotMap: Record<keyof typeof STATUS_TONES, string> = {
    success: "bg-status-success",
    warning: "bg-status-warning",
    danger: "bg-status-danger",
    info: "bg-status-info",
    locked: "bg-status-locked",
    draft: "bg-status-draft",
    neutral: "bg-text-muted",
  };

  return dotMap[tone];
}

const STATUS_MAP: Record<string, StatusConfig> = {
  delivered: {
    label: "Delivered",
    icon: CheckCircle,
    dot: getStatusDotClasses("delivered"),
    badge: getStatusBadgeClasses("delivered"),
  },
  "in-transit": {
    label: "In Transit",
    icon: Truck,
    dot: getStatusDotClasses("in-transit"),
    badge: getStatusBadgeClasses("in-transit"),
  },
  disputed: {
    label: "Disputed",
    icon: AlertTriangle,
    dot: getStatusDotClasses("disputed"),
    badge: getStatusBadgeClasses("disputed"),
  },
  locked: {
    label: "Funds Locked",
    icon: Lock,
    dot: getStatusDotClasses("locked"),
    badge: getStatusBadgeClasses("locked"),
  },
  draft: {
    label: "Draft",
    icon: FileText,
    dot: getStatusDotClasses("draft"),
    badge: getStatusBadgeClasses("draft"),
  },
  pending: {
    label: "Pending",
    icon: Clock,
    dot: getStatusDotClasses("pending"),
    badge: getStatusBadgeClasses("pending"),
  },
};

// ── Size config ──────────────────────────────────────────────────

const SIZE_MAP = {
  sm: {
    badge: "px-2 py-0.5 text-xs gap-1.5",
    icon: 11,
    dot: "w-1.5 h-1.5",
  },
  md: {
    badge: "px-2.5 py-1 text-sm gap-2",
    icon: 13,
    dot: "w-2 h-2",
  },
};

// ── Component ────────────────────────────────────────────────────

export function StatusBadge({
  status,
  size = "md",
  showIcon = true,
}: StatusBadgeProps) {
  const normalizedStatus = String(status ?? "").trim().toLowerCase();
  const config = STATUS_MAP[normalizedStatus] ?? {
    ...DEFAULT_STATUS,
    dot: getStatusDotClasses(status),
    badge: getStatusBadgeClasses(status),
  };
  const sizeConfig = SIZE_MAP[size];
  const IconComponent = config.icon;

  return (
    <span
      className={`
        inline-flex items-center font-semibold rounded-full border
        ${sizeConfig.badge}
        ${config.badge}
      `}
    >
      {showIcon ? (
        <IconComponent
          size={sizeConfig.icon}
          strokeWidth={2}
          aria-hidden="true"
          className="shrink-0"
        />
      ) : (
        /* Dot when icon is hidden */
        <span
          className={`rounded-full shrink-0 ${sizeConfig.dot} ${config.dot}`}
        />
      )}
      {config.label}
    </span>
  );
}

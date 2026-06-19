import { Link } from "wouter";

const TABS = [
  {
    label: "Chats",
    href: "/",
    icon: (active: boolean) => (
      <svg width="30" height="30" viewBox="0 0 32 32" fill={active ? "#007AFF" : "#8e8e93"}>
        <path d="M16 3C9.373 3 4 7.925 4 14c0 3.17 1.438 6.02 3.75 8.05L6.5 26.5a1 1 0 0 0 1.32 1.18l5.12-1.98A13.2 13.2 0 0 0 16 26c6.627 0 12-4.925 12-11S22.627 3 16 3z" />
      </svg>
    ),
  },
  {
    label: "Calls",
    href: "/calls",
    icon: (active: boolean) => (
      <svg width="30" height="30" viewBox="0 0 24 24" fill={active ? "#007AFF" : "#8e8e93"}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l1.14-.95a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
  {
    label: "Stories",
    href: "/stories",
    icon: (active: boolean) => (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={active ? "#007AFF" : "#8e8e93"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="6" height="18" rx="1.5" />
        <rect x="9" y="6" width="6" height="15" rx="1.5" />
        <rect x="16" y="9" width="6" height="12" rx="1.5" />
      </svg>
    ),
  },
];

export default function IosTabBar({ active }: { active: "Chats" | "Calls" | "Stories" }) {
  return (
    <div style={{
      display: "flex",
      borderTop: "0.5px solid var(--sep)",
      padding: "6px 0",
      paddingBottom: "max(20px, env(safe-area-inset-bottom, 20px))",
      background: "var(--tab-bg)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      flexShrink: 0,
    }}>
      {TABS.map(tab => {
        const isActive = tab.label === active;
        return (
          <Link
            key={tab.label}
            href={tab.href}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              textDecoration: "none",
              color: isActive ? "#007AFF" : "#8e8e93",
              padding: "4px 0",
            }}
          >
            {tab.icon(isActive)}
            <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400, letterSpacing: 0.1 }}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

/**
 * Navbar Component
 * Top navigation bar with IntentOS branding and navigation links.
 */
export default function Navbar() {
  return (
    <header className="border-b border-surface-border sticky top-0 z-50 bg-surface/80 backdrop-blur-md">
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between max-w-5xl">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-glow-sm">
            <span className="text-white font-bold text-sm">Ⓘ</span>
          </div>
          <span className="font-extrabold text-lg text-gradient">IntentOS</span>
          <span className="text-xs text-gray-500 bg-surface-card px-2 py-0.5 rounded-full border border-surface-border">beta</span>
        </div>

        {/* Nav links */}
        <div className="flex items-center gap-6">
          <a href="/" className="text-gray-400 hover:text-white text-sm transition-colors duration-150">
            Workspace
          </a>
          <a href="/history" className="text-gray-400 hover:text-white text-sm transition-colors duration-150">
            History
          </a>
          <a href="/settings" className="text-gray-400 hover:text-white text-sm transition-colors duration-150">
            Settings
          </a>
          <button id="nav-login-btn" className="btn-primary text-sm py-2 px-4">
            Sign In
          </button>
        </div>
      </nav>
    </header>
  );
}

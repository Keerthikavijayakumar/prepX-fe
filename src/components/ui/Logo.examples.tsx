/**
 * LOGO USAGE EXAMPLES
 * 
 * This file demonstrates how to use the Logo component
 * in your PrepX application
 */

import { Logo, LogoSymbol, LogoLockupLight, LogoLockupDark, LogoAppIcon } from '@/components/ui/Logo';

// ============================================
// 1. HEADER / NAVIGATION USAGE
// ============================================
export function HeaderExample() {
  return (
    <header className="bg-white border-b border-slate-200">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center">
        {/* Light mode logo - use in light backgrounds */}
        <LogoLockupLight size="lg" />
        
        <nav className="ml-auto flex gap-6">
          <a href="#">Features</a>
          <a href="#">Pricing</a>
        </nav>
      </nav>
    </header>
  );
}

// ============================================
// 2. DARK MODE / FOOTER USAGE
// ============================================
export function FooterExample() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Dark mode logo - use in dark backgrounds */}
        <LogoLockupDark size="lg" className="mb-8" />
        
        <p className="text-slate-400">© 2026 PrepX. All rights reserved.</p>
      </div>
    </footer>
  );
}

// ============================================
// 3. NAVIGATION / SIDEBAR USAGE
// ============================================
export function SidebarExample() {
  return (
    <aside className="bg-white w-64 h-screen border-r border-slate-200">
      <div className="p-6">
        {/* Icon-only symbol for compact spaces */}
        <LogoSymbol size="lg" className="mb-8" />
        
        <nav className="space-y-2">
          <button className="w-full text-left px-4 py-2 rounded hover:bg-slate-100">
            Dashboard
          </button>
          <button className="w-full text-left px-4 py-2 rounded hover:bg-slate-100">
            Interviews
          </button>
        </nav>
      </div>
    </aside>
  );
}

// ============================================
// 4. BUTTON / ICON USAGE
// ============================================
export function ButtonWithLogoExample() {
  return (
    <div className="flex gap-4">
      {/* Small icon for button */}
      <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
        <LogoSymbol size="sm" />
        Start Interview
      </button>
      
      {/* Icon-only button */}
      <button className="p-2 hover:bg-slate-100 rounded-lg">
        <LogoSymbol size="md" />
      </button>
    </div>
  );
}

// ============================================
// 5. HERO / BRANDING SECTION
// ============================================
export function HeroSectionExample() {
  return (
    <section className="bg-gradient-to-br from-blue-600 to-purple-600 text-white py-20">
      <div className="max-w-4xl mx-auto text-center space-y-8 px-4">
        {/* Large symbol in hero */}
        <LogoSymbol size="xxl" className="mx-auto" />
        
        <h1 className="text-5xl font-bold">Master Technical Interviews</h1>
        <p className="text-xl text-blue-100">With AI-powered feedback and real-time guidance</p>
        
        <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50">
          Get Started Free
        </button>
      </div>
    </section>
  );
}

// ============================================
// 6. RESPONSIVE LOGO USAGE
// ============================================
export function ResponsiveLogoExample() {
  return (
    <div className="space-y-8">
      {/* Mobile: Use symbol only */}
      <div className="md:hidden flex items-center justify-center py-4">
        <LogoSymbol size="lg" />
      </div>
      
      {/* Desktop: Use full lockup */}
      <div className="hidden md:flex items-center justify-center py-4">
        <LogoLockupLight size="xl" />
      </div>
    </div>
  );
}

// ============================================
// 7. APP ICON / SOCIAL SHARING
// ============================================
export function AppIconExample() {
  return (
    <div className="space-y-8">
      {/* App store / home screen icon */}
      <div className="flex flex-col items-center gap-4">
        <LogoAppIcon />
        <p className="text-sm text-slate-600">Perfect for app stores</p>
      </div>
      
      {/* Social media profile picture */}
      <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg">
        <LogoSymbol size="md" />
        <div>
          <p className="font-semibold">PrepX</p>
          <p className="text-sm text-slate-500">@PrepX</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 8. THEME SWITCHER
// ============================================
export function ThemeSwitcherExample({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <header className={isDarkMode ? 'bg-slate-900' : 'bg-white'}>
      {/* Automatically switch between light and dark logos based on theme */}
      {isDarkMode ? (
        <LogoLockupDark size="lg" />
      ) : (
        <LogoLockupLight size="lg" />
      )}
    </header>
  );
}

// ============================================
// 9. CUSTOM SIZING
// ============================================
export function CustomSizingExample() {
  return (
    <div className="space-y-8 p-8 bg-slate-50">
      <div>
        <p className="text-sm font-semibold text-slate-600 mb-2">Extra Small (w-4 h-4)</p>
        <LogoSymbol size="xs" />
      </div>
      
      <div>
        <p className="text-sm font-semibold text-slate-600 mb-2">Small (w-6 h-6)</p>
        <LogoSymbol size="sm" />
      </div>
      
      <div>
        <p className="text-sm font-semibold text-slate-600 mb-2">Medium (w-8 h-8) - Default</p>
        <LogoSymbol size="md" />
      </div>
      
      <div>
        <p className="text-sm font-semibold text-slate-600 mb-2">Large (w-12 h-12)</p>
        <LogoSymbol size="lg" />
      </div>
      
      <div>
        <p className="text-sm font-semibold text-slate-600 mb-2">Extra Large (w-16 h-16)</p>
        <LogoSymbol size="xl" />
      </div>
      
      <div>
        <p className="text-sm font-semibold text-slate-600 mb-2">XXL (w-24 h-24)</p>
        <LogoSymbol size="xxl" />
      </div>
    </div>
  );
}

// ============================================
// 10. WITH CUSTOM STYLING
// ============================================
export function CustomStylingExample() {
  return (
    <div className="space-y-6 p-8">
      {/* With hover effect */}
      <LogoLockupLight
        size="lg"
        className="hover:opacity-75 transition-opacity cursor-pointer"
      />
      
      {/* With animation */}
      <LogoSymbol
        size="xl"
        className="animate-pulse"
      />
      
      {/* With shadow */}
      <LogoAppIcon className="shadow-2xl rounded-lg" />
    </div>
  );
}

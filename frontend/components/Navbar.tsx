'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Wallet,
  Tag,
  ArrowLeftRight,
  Target,
  LogOut,
  Menu,
  X,
  Upload,
  Bot,
  User,
  Sun,
  Moon
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/contas', label: 'Contas', icon: Wallet },
  { href: '/dashboard/categorias', label: 'Categorias', icon: Tag },
  { href: '/dashboard/lancamentos', label: 'Lançamentos', icon: ArrowLeftRight },
  { href: '/dashboard/metas', label: 'Metas', icon: Target },
  { href: '/dashboard/importar', label: 'Importar', icon: Upload },
  { href: '/dashboard/copilot', label: 'PatarIA', icon: Bot },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav style={{
      background: 'var(--nav-bg)',
      borderBottom: '1px solid var(--nav-border)',
    }} className="backdrop-blur-xl sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Unified Logo */}
            <Link href="/dashboard" className="flex items-center group">
              <div
                className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-[#f0e6d2]"
                style={{ border: '1px solid var(--nav-border)', boxShadow: '0 0 15px rgba(234,179,8,0.2)' }}
              >
                <img 
                  src="/novaLOGO.png" 
                  alt="Logo SobControle Finanças" 
                  className="w-full h-full object-cover scale-[1.05] transition-transform duration-300 group-hover:scale-[1.12]"
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:ml-10 lg:flex lg:space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                const isCopilot = item.href === '/dashboard/copilot'
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isCopilot ? 'relative' : ''}`}
                    style={{
                      background: isActive ? 'var(--nav-active-bg)' : 'transparent',
                      color: isActive ? 'var(--nav-active-text)' : 'var(--nav-text)',
                      border: isActive ? '1px solid var(--nav-active-border)' : '1px solid transparent',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = 'var(--nav-hover-bg)'
                        ;(e.currentTarget as HTMLElement).style.color = 'var(--nav-text-hover)'
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = 'transparent'
                        ;(e.currentTarget as HTMLElement).style.color = 'var(--nav-text)'
                      }
                    }}
                  >
                    <Icon className={`w-4 h-4 ${isCopilot && !isActive ? 'text-violet-400' : ''}`} />
                    <span>{item.label}</span>
                    {isCopilot && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-violet-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
              className="p-2 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
              style={{
                background: 'var(--nav-hover-bg)',
                color: isDark ? '#f59e0b' : '#1e40af',
                border: '1px solid var(--nav-border)',
              }}
              aria-label="Alternar tema"
            >
              <div className="relative w-4 h-4 overflow-hidden">
                <Sun
                  className="w-4 h-4 absolute transition-all duration-300"
                  style={{
                    opacity: isDark ? 1 : 0,
                    transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0)',
                  }}
                />
                <Moon
                  className="w-4 h-4 absolute transition-all duration-300"
                  style={{
                    opacity: isDark ? 0 : 1,
                    transform: isDark ? 'rotate(-90deg) scale(0)' : 'rotate(0deg) scale(1)',
                  }}
                />
              </div>
            </button>

            <div className="hidden md:flex items-center space-x-3">
              <div
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg"
                style={{ background: 'var(--user-badge-bg)', border: '1px solid var(--user-badge-border)' }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--user-avatar-bg)', border: '1px solid var(--user-avatar-border)' }}
                >
                  <User className="w-3.5 h-3.5" style={{ color: 'var(--nav-text)' }} />
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--nav-text)' }}>{user?.nome}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg transition-colors"
              style={{ color: 'var(--nav-text)', background: 'transparent' }}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden backdrop-blur-xl"
          style={{ borderTop: '1px solid var(--mobile-border)', background: 'var(--mobile-menu-bg)' }}
        >
          <div className="px-3 pt-3 pb-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: isActive ? 'var(--nav-active-bg)' : 'transparent',
                    color: isActive ? 'var(--nav-active-text)' : 'var(--nav-text)',
                    border: isActive ? '1px solid var(--nav-active-border)' : '1px solid transparent',
                  }}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            <div style={{ borderTop: '1px solid var(--mobile-border)' }} className="pt-3 mt-3">
              <div className="px-3 py-2 text-sm flex items-center space-x-2" style={{ color: 'var(--nav-text)' }}>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--user-avatar-bg)', border: '1px solid var(--user-avatar-border)' }}
                >
                  <User className="w-3.5 h-3.5" style={{ color: 'var(--nav-text)' }} />
                </div>
                <span className="font-medium" style={{ color: 'var(--foreground)' }}>{user?.nome}</span>
              </div>

              {/* Mobile Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{ color: isDark ? '#f59e0b' : '#1e40af' }}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span>{isDark ? 'Tema Claro' : 'Tema Escuro'}</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  logout()
                }}
                className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

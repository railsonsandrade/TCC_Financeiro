'use client'

import { useAuth } from '@/contexts/AuthContext'
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
  User
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/contas', label: 'Contas', icon: Wallet },
  { href: '/dashboard/categorias', label: 'Categorias', icon: Tag },
  { href: '/dashboard/lancamentos', label: 'Lançamentos', icon: ArrowLeftRight },
  { href: '/dashboard/metas', label: 'Metas', icon: Target },
  { href: '/dashboard/importar', label: 'Importar', icon: Upload },
  { href: '/dashboard/copilot', label: 'Copilot IA', icon: Bot },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-[#0a0f16]/95 backdrop-blur-xl border-b border-[#222834] sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Unified Logo */}
            <Link href="/dashboard" className="flex items-center space-x-3 group">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#1a202c] to-[#0a0f16] flex items-center justify-center border border-[#2a3140] shadow-[0_0_15px_rgba(234,179,8,0.2)] group-hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] group-hover:scale-105 transition-all duration-300">
                <div className="absolute inset-0 bg-yellow-500/10 rounded-xl rounded-tr-sm group-hover:bg-yellow-500/20 transition-colors pointer-events-none" />
                <Target className="w-5 h-5 text-yellow-500 group-hover:animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-gray-50 to-gray-300 bg-clip-text text-transparent leading-none">
                  Constellation
                </span>
                <span className="text-xs font-semibold text-yellow-500 tracking-wider">
                  FINANCE 
                </span>
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
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                        : 'text-gray-400 hover:bg-[#1a202c] hover:text-gray-200'
                    } ${isCopilot ? 'relative' : ''}`}
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
            <div className="hidden md:flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-[#151a22] rounded-lg border border-[#222834]">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2a3140] to-[#1a202c] flex items-center justify-center border border-[#3e485e]">
                  <User className="w-3.5 h-3.5 text-gray-300" />
                </div>
                <span className="text-sm font-medium text-gray-300">{user?.nome}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:bg-[#1a202c] transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#222834] bg-[#0a0f16]/95 backdrop-blur-xl">
          <div className="px-3 pt-3 pb-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                      : 'text-gray-400 hover:bg-[#1a202c] hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            <div className="border-t border-[#222834] pt-3 mt-3">
              <div className="px-3 py-2 text-sm text-gray-400 flex items-center space-x-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2a3140] to-[#1a202c] flex items-center justify-center border border-[#3e485e]">
                  <User className="w-3.5 h-3.5 text-gray-300" />
                </div>
                <span className="font-medium text-gray-200">{user?.nome}</span>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  logout()
                }}
                className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-400/10 transition-all"
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

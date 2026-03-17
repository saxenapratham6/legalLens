'use client'

import { Scale, LayoutDashboard, AlertTriangle, FileText, BookOpen, MessageSquare, History } from 'lucide-react'
import { cn } from '@/lib/utils'

export type NavItem = 'dashboard' | 'risks' | 'facts' | 'summary' | 'chat' | 'history'

interface SidebarProps {
  activeNav: NavItem
  onNavChange: (nav: NavItem) => void
  hasAnalysis: boolean
}

const navItems: { id: NavItem; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'risks', label: 'Risk Report', icon: AlertTriangle },
  { id: 'facts', label: 'Fact Card', icon: FileText },
  { id: 'summary', label: 'Summary', icon: BookOpen },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'history', label: 'History', icon: History },
]

export function Sidebar({ activeNav, onNavChange, hasAnalysis }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] bg-[#0f0f0f] border-r border-white/[0.08] flex flex-col z-40">
      {/* Logo */}
      <div className="p-5 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <Scale className="w-6 h-6 text-[#76B900]" />
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Legal Lens</h1>
            <p className="text-[10px] text-[#76B900] font-semibold tracking-widest uppercase">Powered by Nemotron</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeNav === item.id
            const isDisabled = !hasAnalysis && item.id !== 'dashboard'
            const Icon = item.icon
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => !isDisabled && onNavChange(item.id)}
                  disabled={isDisabled}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                    isActive && 'text-white font-semibold border-l-2 border-[#76B900] bg-transparent pl-[10px]',
                    !isActive && !isDisabled && 'text-white/50 hover:text-white/80',
                    isDisabled && 'text-white/20 cursor-not-allowed'
                  )}
                >
                  <Icon className={cn(
                    'w-4 h-4',
                    isActive ? 'text-white/80' : 'text-white/40'
                  )} />
                  {item.label}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* NVIDIA Badge */}
      <div className="p-4 border-t border-white/[0.08]">
        <div className="flex items-center gap-2 px-3">
          <div className="w-2 h-2 rounded-full bg-[#76B900]" />
          <div className="text-xs">
            <span className="text-white/60">Built with </span>
            <span className="text-white font-medium">NVIDIA Nemotron</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

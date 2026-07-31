import React from 'react'

export type TabType = 'dashboard' | 'translate' | 'history' | 'about'

interface SidebarProps {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  selectedModel?: string
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, selectedModel }) => {
  const menuItems = [
    { id: 'dashboard' as TabType, label: 'New Translation', icon: '🌿' },
    { id: 'history' as TabType, label: 'History', icon: '⏳' },
    { id: 'about' as TabType, label: 'About', icon: '💡' },
  ]

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-border h-screen sticky top-0 p-6">
        <div className="flex items-center gap-2 mb-8">
          <span className="text-2xl">🌿</span>
          <span className="font-display font-bold text-xl text-primary tracking-tight">MaganiHausa</span>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition cursor-pointer text-left ${
                  isActive
                    ? 'bg-surface-muted text-primary font-semibold'
                    : 'text-text-muted hover:bg-bg hover:text-text'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="pt-4 border-t border-border mt-auto">
          <div className="text-xs text-text-muted">
            <p className="font-semibold text-text">Offline Mode</p>
            <p className="mt-0.5">Model: {selectedModel || 'gemma2:2b'}</p>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-border flex items-center justify-around z-50">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full text-[10px] font-medium transition cursor-pointer ${
                isActive ? 'text-primary font-bold' : 'text-text-muted'
              }`}
            >
              <span className="text-xl mb-0.5">{item.icon}</span>
              <span>{item.label === 'New Translation' ? 'Translate' : item.label}</span>
            </button>
          )
        })}
      </nav>
    </>
  )
}

'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const menuItems = [
    { title: 'Dashboard', path: '/admin', icon: '📊' },
    { title: 'Subjects', path: '/admin/subjects', icon: '📚' },
    { title: 'Levels', path: '/admin/levels', icon: '🎯' },
    { title: 'Batches', path: '/admin/batches', icon: '👥' },
    { title: 'Students', path: '/admin/students', icon: '🎓' },
    { title: 'Schedule', path: '/admin/schedule', icon: '📅' },
    { title: 'History', path: '/admin/history', icon: '🔍' },
  ]

  return (
    <div className="flex h-screen bg-[#0F172A]">
      {/* Sidebar */}
      <aside 
        className={`bg-[#1E293B] min-h-screen w-72 shadow-xl transition-all duration-300 border-r border-[#334155] ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-72'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-[#334155]">
          <h2 className="text-2xl font-bold text-[#F8FAFC]">Admin Panel</h2>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="lg:hidden text-[#F8FAFC] hover:text-[#A78BFA] transition-colors duration-200"
          >
            {isSidebarOpen ? '←' : '→'}
          </button>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link 
                  href={item.path} 
                  className="flex items-center px-4 py-3 text-[#F8FAFC] rounded-lg hover:bg-[#334155] hover:text-[#A78BFA] transition-all duration-200"
                >
                  <span className="mr-4 text-xl">{item.icon}</span>
                  <span className="font-medium">{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
} 
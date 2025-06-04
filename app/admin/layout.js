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
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`bg-white w-64 min-h-screen p-4 shadow-lg transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-64'}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Admin Panel</h2>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden">
            {isSidebarOpen ? '←' : '→'}
          </button>
        </div>
        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link href={item.path} className="flex items-center p-2 text-gray-700 rounded hover:bg-gray-100">
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
} 
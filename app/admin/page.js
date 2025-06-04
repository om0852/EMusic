'use client'
import { useState, useEffect } from 'react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSubjects: 0,
    totalStudents: 0,
    activeBatches: 0,
    upcomingClasses: 0
  })

  // In a real application, you would fetch these stats from your API
  useEffect(() => {
    // Fetch dashboard stats
  }, [])

  const StatCard = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  )

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Subjects"
          value={stats.totalSubjects}
          icon="📚"
        />
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon="🎓"
        />
        <StatCard
          title="Active Batches"
          value={stats.activeBatches}
          icon="👥"
        />
        <StatCard
          title="Upcoming Classes"
          value={stats.upcomingClasses}
          icon="📅"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {/* Add recent activity items here */}
            <p className="text-gray-500">No recent activity</p>
          </div>
        </div>

        {/* Upcoming Classes */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Today's Classes</h2>
          <div className="space-y-4">
            {/* Add upcoming classes here */}
            <p className="text-gray-500">No classes scheduled for today</p>
          </div>
        </div>
      </div>
    </div>
  )
} 
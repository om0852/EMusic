'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';
export default function AdminDashboard() {
  const router =useRouter();
  const [stats, setStats] = useState({
    totalSubjects: 0,
    totalStudents: 0,
    activeBatches: 0,
    upcomingClasses: 0
  })

  // In a real application, you would fetch these stats from your API
  useEffect(() => {
    // Fetch dashboard stats
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          if(data.user.role === 'admin'){
            router.push('/admin');
          }
          else{
            router.push('/');
          }

        } 
      } catch (error) {
        console.error('Auth check failed:', error);
      }
      };
checkAuth();  
  }, [])

  const StatCard = ({ title, value, icon }) => (
    <div className="bg-[#1E293B] p-6 rounded-lg shadow-xl border border-[#334155] hover:border-[#A78BFA] transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#A78BFA] text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-[#F8FAFC]">{value}</h3>
        </div>
        <span className="text-3xl bg-[#334155] p-3 rounded-lg">{icon}</span>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#F8FAFC] mb-2">Dashboard</h1>
        <p className="text-[#A78BFA]">Welcome to your admin dashboard</p>
      </div>
      
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-[#1E293B] rounded-lg shadow-xl border border-[#334155]">
          <div className="p-6 border-b border-[#334155]">
            <h2 className="text-xl font-bold text-[#F8FAFC]">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center p-4 rounded-lg bg-[#0F172A] border border-[#334155]">
                <div className="p-2 bg-[#334155] rounded-lg mr-4">
                  <span className="text-2xl">📝</span>
                </div>
                <div>
                  <h3 className="text-[#F8FAFC] font-medium">New Subject Added</h3>
                  <p className="text-sm text-[#A78BFA]">Guitar Basics - 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center p-4 rounded-lg bg-[#0F172A] border border-[#334155]">
                <div className="p-2 bg-[#334155] rounded-lg mr-4">
                  <span className="text-2xl">👥</span>
                </div>
                <div>
                  <h3 className="text-[#F8FAFC] font-medium">New Batch Created</h3>
                  <p className="text-sm text-[#A78BFA]">Piano Advanced - 3 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Classes */}
        <div className="bg-[#1E293B] rounded-lg shadow-xl border border-[#334155]">
          <div className="p-6 border-b border-[#334155]">
            <h2 className="text-xl font-bold text-[#F8FAFC]">Today's Classes</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-[#0F172A] border border-[#334155]">
                <div className="flex items-center">
                  <div className="p-2 bg-[#334155] rounded-lg mr-4">
                    <span className="text-2xl">🎸</span>
                  </div>
                  <div>
                    <h3 className="text-[#F8FAFC] font-medium">Guitar Basics</h3>
                    <p className="text-sm text-[#A78BFA]">Batch A - Beginner Level</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#F8FAFC] font-medium">2:00 PM</p>
                  <p className="text-sm text-[#A78BFA]">1 hour</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-[#0F172A] border border-[#334155]">
                <div className="flex items-center">
                  <div className="p-2 bg-[#334155] rounded-lg mr-4">
                    <span className="text-2xl">🎹</span>
                  </div>
                  <div>
                    <h3 className="text-[#F8FAFC] font-medium">Piano Advanced</h3>
                    <p className="text-sm text-[#A78BFA]">Batch B - Advanced Level</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#F8FAFC] font-medium">4:00 PM</p>
                  <p className="text-sm text-[#A78BFA]">2 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
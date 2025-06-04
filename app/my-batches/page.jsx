'use client';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export default function MyBatchesPage() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // For demo purposes, using a hardcoded email. In a real app, this would come from authentication
  const userEmail = 'demo@example.com';

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await fetch(`/api/batch?email=${userEmail}`);
        if (response.ok) {
          const data = await response.json();
          setBatches(data.data);
        }
      } catch (error) {
        console.error('Error fetching batches:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-8"></div>
              <div className="h-4 bg-gray-200 rounded max-w-md mx-auto mb-12"></div>
              <div className="grid gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-40 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#1A1A1A] mb-4">My Batches</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            View and manage your enrolled classes
          </p>
        </div>

        {batches.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">No Batches Found</h3>
              <p className="text-gray-600 mb-6">You haven't enrolled in any classes yet.</p>
              <a
                href="/m-class"
                className="inline-block bg-[#FF5722] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#F4511E] transition-colors duration-200"
              >
                Explore Classes
              </a>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {batches.map((batch) => (
              <div
                key={batch._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="md:flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-[#1A1A1A]">
                          {batch.subject.name} - {batch.level.name}
                        </h2>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          batch.status === 'active' ? 'bg-green-100 text-green-800' :
                          batch.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">
                        {batch.type.charAt(0).toUpperCase() + batch.type.slice(1)} Class
                      </p>
                      
                      {/* Schedule */}
                      <div className="space-y-2 mb-4">
                        <h4 className="text-sm font-medium text-[#3F51B5]">Schedule:</h4>
                        {batch.schedule.map((slot, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2 text-[#009688]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {slot.day} at {slot.time}
                          </div>
                        ))}
                      </div>

                      {/* Duration */}
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Duration: </span>
                        {format(new Date(batch.startDate), 'MMM d, yyyy')} - {format(new Date(batch.endDate), 'MMM d, yyyy')}
                      </div>
                    </div>

                    <div className="md:ml-8 mt-4 md:mt-0">
                      <div className="bg-[#F8F9FA] rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">Subscription Plan</div>
                        <div className="text-xl font-bold text-[#1A1A1A] mb-2">
                          {batch.subscriptionPlan.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          ${batch.subscriptionPlan.price}
                          {batch.type === 'group' && ' per person'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Group Members (if group class) */}
                  {batch.type === 'group' && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-[#3F51B5] mb-3">Group Members:</h4>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {batch.students.map((student, index) => (
                          <div key={index} className="flex items-center space-x-3 text-sm text-gray-600">
                            <svg className="w-5 h-5 text-[#009688]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <div>
                              <div className="font-medium">{student.name}</div>
                              <div className="text-gray-500">{student.email}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
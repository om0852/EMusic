'use client';

import { useState, useEffect } from 'react';
import { FaCalendar, FaClock, FaUsers, FaChalkboardTeacher } from 'react-icons/fa';

export default function MyBatches() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await fetch('/api/batches', {
        credentials: 'include'
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error fetching batches');
      }

      setBatches(data.batches);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="space-y-3 mt-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Batches</h1>

        {batches.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-500">You are not enrolled in any batches yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {batches.map((batch) => (
              <div key={batch._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{batch.subject}</h2>
                      <p className="text-sm text-gray-500 mt-1">{batch.level}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      batch.status === 'Active' ? 'bg-green-100 text-green-800' :
                      batch.status === 'Completed' ? 'bg-gray-100 text-gray-800' :
                      batch.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {batch.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center text-sm text-gray-500">
                      <FaCalendar className="mr-2" />
                      <span>{formatDate(batch.startDate)} - {formatDate(batch.endDate)}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-500">
                      <FaClock className="mr-2" />
                      <div>
                        {batch.schedule.map((s, i) => (
                          <div key={i}>
                            {s.day}: {s.startTime} - {s.endTime}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-500">
                      <FaUsers className="mr-2" />
                      <span>
                        {batch.students.length} / {batch.maxStudents} students
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-500">
                      <FaChalkboardTeacher className="mr-2" />
                      <span>{batch.teacher.name}</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-sm text-gray-500">{batch.subscription}</span>
                        <p className="text-lg font-semibold text-gray-900">${batch.price}/month</p>
                      </div>
                      <button
                        className="px-4 py-2 bg-primary text-black rounded-md hover:bg-primary-dark transition-colors"
                        onClick={() => {/* Handle view details */}}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
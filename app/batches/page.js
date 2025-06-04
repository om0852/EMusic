'use client';

import { useState, useEffect } from 'react';
import { FaCalendar, FaClock, FaUsers, FaChalkboardTeacher, FaFilter } from 'react-icons/fa';

export default function BatchesPage() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    subscription: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await fetch('/api/batch/all', {
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

  const filteredBatches = batches.filter(batch => {
    const matchesStatus = filters.status === 'all' || batch.status === filters.status;
    const matchesSubscription = filters.subscription === 'all' || batch.subscription === filters.subscription;
    const matchesSearch = searchTerm === '' || 
      batch.subject?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.level?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSubscription && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Completed':
        return 'bg-gray-100 text-gray-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Upcoming':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
                <p className="text-sm text-red-700">{error}</p>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Batches</h1>
          <p className="mt-2 text-sm text-gray-600">
            View and manage all music learning batches
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <input
                type="text"
                placeholder="Search by subject or level..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <select
                className="px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <select
                className="px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                value={filters.subscription}
                onChange={(e) => setFilters(prev => ({ ...prev, subscription: e.target.value }))}
              >
                <option value="all">All Plans</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Semi-Annual">Semi-Annual</option>
                <option value="Annual">Annual</option>
              </select>
            </div>
          </div>
        </div>

        {/* Batches Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredBatches.map((batch) => (
            <div key={batch._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {batch.subject?.name}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {batch.level?.name}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(batch.status)}`}>
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
                    <span>{batch.students.length} / {batch.maxStudents} students</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <FaChalkboardTeacher className="mr-2" />
                    <span>{batch.teacher?.name || 'Unassigned'}</span>
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

        {filteredBatches.length === 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-500">No batches found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
} 
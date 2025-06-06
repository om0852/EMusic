'use client';

import { useState, useEffect } from 'react';
import { FaCalendar, FaClock, FaChalkboardTeacher, FaUsers, FaBook, FaPlus, FaVideo, FaTrash, FaBan } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import AddScheduleModal from '@/app/components/AddScheduleModal';

export default function SchedulePage() {
  const [sessions, setSessions] = useState([]);
  const [cancelledSessions, setCancelledSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState(null);

  useEffect(() => {
    fetchUpcomingSessions();
    fetchCancelledSessions();
  }, []);

  const fetchUpcomingSessions = async () => {
    try {
      const response = await fetch('/api/admin/schedule', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const data = await response.json();
      setSessions(data.sessions);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCancelledSessions = async () => {
    try {
      const response = await fetch('/api/admin/schedule/cancelled', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch cancelled sessions');
      }

      const data = await response.json();
      setCancelledSessions(data.cancelledSessions);
    } catch (err) {
      console.error('Error fetching cancelled sessions:', err);
    }
  };

  const handleUpdateSchedule = async (batchId, newSchedule) => {
    try {
      const loadingToast = toast.loading('Updating schedule...');
      
      const response = await fetch(`/api/admin/batches/${batchId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schedule: newSchedule
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to update schedule');
      }

      toast.dismiss(loadingToast);
      toast.success('Schedule updated successfully');
      await fetchUpcomingSessions(); // Refresh the sessions list
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRemoveSession = async (session) => {
    try {
      // Find the batch this session belongs to
      const response = await fetch(`/api/admin/batches/${session.batchId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch batch details');
      }

      const { batch } = await response.json();
      
      // Filter out this schedule item
      const newSchedule = batch.schedule.filter(
        item => !(item.day === session.day && 
                 item.startTime === session.startTime && 
                 item.endTime === session.endTime)
      );

      // Update the batch with new schedule
      await handleUpdateSchedule(session.batchId, newSchedule);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAddSchedule = async (batchId, newScheduleItem) => {
    try {
      // Get current batch schedule
      const response = await fetch(`/api/admin/batches/${batchId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch batch details');
      }

      const { batch } = await response.json();
      
      // Add new schedule item to existing schedule
      const newSchedule = [...batch.schedule, newScheduleItem];

      // Update batch with new schedule
      await handleUpdateSchedule(batchId, newSchedule);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCancelSession = async (session) => {
    try {
      const loadingToast = toast.loading('Cancelling session...');
      
      const response = await fetch('/api/admin/schedule/cancelled', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batchId: session.batchId,
          date: session.date,
          startTime: session.startTime,
          endTime: session.endTime
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to cancel session');
      }

      toast.dismiss(loadingToast);
      toast.success('Session cancelled successfully');
      
      // Refresh the cancelled sessions list
      await fetchCancelledSessions();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const isSessionCancelled = (session) => {
    return cancelledSessions.some(
      cancelled => 
        cancelled.batchId === session.batchId &&
        new Date(cancelled.date).toDateString() === new Date(session.date).toDateString() &&
        cancelled.startTime === session.startTime
    );
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSessionStatus = (session) => {
    const now = new Date();
    const [hours, minutes] = session.startTime.split(':').map(Number);
    const sessionStart = new Date(session.date);
    sessionStart.setHours(hours, minutes, 0, 0);

    const [endHours, endMinutes] = session.endTime.split(':').map(Number);
    const sessionEnd = new Date(session.date);
    sessionEnd.setHours(endHours, endMinutes, 0, 0);

    // Calculate 10 minutes before session start
    const joinTime = new Date(sessionStart);
    joinTime.setMinutes(joinTime.getMinutes() - 10);

    if (now >= sessionStart && now <= sessionEnd) {
      return 'active';
    } else if (now >= joinTime && now < sessionStart) {
      return 'joining';
    } else if (now < joinTime) {
      return 'upcoming';
    } else {
      return 'ended';
    }
  };

  const getButtonStyles = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700';
      case 'joining':
        return 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700';
      case 'upcoming':
        return 'bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700';
      default:
        return 'bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700';
    }
  };

  const getJoinButtonText = (status) => {
    switch (status) {
      case 'active':
        return 'Join Now';
      case 'joining':
        return 'Join Early';
      default:
        return 'Join Meeting';
    }
  };

  // Update sessions every minute to refresh status
  useEffect(() => {
    const timer = setInterval(() => {
      setSessions(prev => [...prev]); // Force re-render to update status
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sessionDate = new Date(date);
    sessionDate.setHours(0, 0, 0, 0);

    if (sessionDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (sessionDate.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    }
    return sessionDate.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Upcoming Sessions
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Subject & Level
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Students
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sessions.map((session) => {
                  const status = getSessionStatus(session);
                  const isCancelled = isSessionCancelled(session);
                  return (
                    <tr key={session._id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${isCancelled ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center">
                          <FaCalendar className="mr-2 text-gray-400" />
                          {formatDate(session.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center">
                          <FaClock className="mr-2 text-gray-400" />
                          {formatTime(session.startTime)} - {formatTime(session.endTime)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center">
                          <FaBook className="mr-2 text-gray-400" />
                          {session.subject.name} - {session.level.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center">
                          <FaChalkboardTeacher className="mr-2 text-gray-400" />
                          {session.teacher.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center">
                          <FaUsers className="mr-2 text-gray-400" />
                          {session.currentStudents} / {session.maxStudents}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center space-x-3">
                          {!isCancelled && session.meetLink && (
                            <a
                              href={session.meetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center px-3 py-1.5 text-white rounded-md transition-colors duration-200 ${getButtonStyles(status)}`}
                            >
                              <FaVideo className="mr-1.5" />
                              {getJoinButtonText(status)}
                            </a>
                          )}
                          {!isCancelled && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedBatchId(session.batchId);
                                  setIsModalOpen(true);
                                }}
                                className="inline-flex items-center px-3 py-1.5 text-primary dark:text-primary-dark hover:bg-primary/10 dark:hover:bg-primary-dark/10 rounded-md transition-colors duration-200"
                              >
                                <FaPlus className="mr-1.5" />
                                Add
                              </button>
                              <button
                                onClick={() => handleCancelSession(session)}
                                className="inline-flex items-center px-3 py-1.5 text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-md transition-colors duration-200"
                              >
                                <FaBan className="mr-1.5" />
                                Cancel
                              </button>
                              <button
                                onClick={() => handleRemoveSession(session)}
                                className="inline-flex items-center px-3 py-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors duration-200"
                              >
                                <FaTrash className="mr-1.5" />
                                Remove
                              </button>
                            </>
                          )}
                          {isCancelled && (
                            <span className="inline-flex items-center px-3 py-1.5 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md">
                              <FaBan className="mr-1.5" />
                              Cancelled
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {sessions.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <FaCalendar className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No Upcoming Sessions
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        There are no scheduled sessions for today or tomorrow.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AddScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={(scheduleItem) => {
          handleAddSchedule(selectedBatchId, scheduleItem);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
} 
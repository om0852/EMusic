import { useState, useEffect } from 'react';
import { FaTimes, FaCheck, FaTimes as FaX, FaCalendar, FaClock, FaBook } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function StudentAttendanceModal({ isOpen, onClose, student }) {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);

  useEffect(() => {
    if (student && isOpen) {
      fetchAttendance();
    }
  }, [student, isOpen]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/students/${student._id}/attendance`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch attendance');
      }

      const data = await response.json();
      setAttendance(data.attendance);
      
      // Set the first batch as selected by default
      if (data.attendance.length > 0) {
        setSelectedBatch(data.attendance[0].batchId);
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceStats = (batchAttendance) => {
    const total = batchAttendance.sessions.length;
    const present = batchAttendance.sessions.filter(session => 
      session.status === 'present'
    ).length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, percentage };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Attendance Record - {student?.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-4">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ) : error ? (
          <div className="py-4">
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-500 p-4 rounded-md">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Batch Selection */}
            <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
              {attendance.map((batch) => (
                <button
                  key={batch.batchId}
                  onClick={() => setSelectedBatch(batch.batchId)}
                  className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                    selectedBatch === batch.batchId
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {batch.subject.name} - {batch.level.name}
                </button>
              ))}
            </div>

            {/* Attendance Details */}
            {selectedBatch && (
              <div className="flex-1 overflow-y-auto">
                {attendance.map((batch) => {
                  if (batch.batchId !== selectedBatch) return null;

                  const stats = getAttendanceStats(batch);

                  return (
                    <div key={batch.batchId}>
                      {/* Stats Summary */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <div className="text-sm text-gray-500 dark:text-gray-400">Total Sessions</div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <div className="text-sm text-gray-500 dark:text-gray-400">Present</div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.present}</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <div className="text-sm text-gray-500 dark:text-gray-400">Attendance Rate</div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.percentage}%</div>
                        </div>
                      </div>

                      {/* Sessions List */}
                      <div className="space-y-2">
                        {batch.sessions.map((session, index) => (
                          <div
                            key={index}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              session.status === 'present'
                                ? 'bg-green-50 dark:bg-green-900/20'
                                : 'bg-red-50 dark:bg-red-900/20'
                            }`}
                          >
                            <div className="flex items-center space-x-4">
                              <FaCalendar className={`${
                                session.status === 'present'
                                  ? 'text-green-500'
                                  : 'text-red-500'
                              }`} />
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {new Date(session.date).toLocaleDateString()}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {session.startTime} - {session.endTime}
                                </div>
                              </div>
                            </div>
                            {session.status === 'present' ? (
                              <FaCheck className="text-green-500 h-5 w-5" />
                            ) : (
                              <FaX className="text-red-500 h-5 w-5" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 
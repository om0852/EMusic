import { useState, useEffect } from 'react';
import { FaTimes, FaCheck, FaUserAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function AttendanceModal({ isOpen, onClose, session, onSave }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState(new Set());

  useEffect(() => {
    if (session) {
      fetchStudents();
    }
  }, [session]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/batches/${session.batchId}/students`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch students');
      }

      const data = await response.json();
      setStudents(data.students);
      
      // If attendance exists, pre-select those students
      if (session.attendance && session.attendance.length > 0) {
        const presentStudentIds = session.attendance
          .filter(a => a.status === 'present')
          .map(a => a.userId);
        setSelectedStudents(new Set(presentStudentIds));
      } else {
        setSelectedStudents(new Set());
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleStudent = (studentId) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const handleSave = () => {
    const attendance = Array.from(selectedStudents).map(studentId => ({
      studentId,
      status: 'present'
    }));

    // Add absent students
    students.forEach(student => {
      if (!selectedStudents.has(student._id)) {
        attendance.push({
          studentId: student._id,
          status: 'absent'
        });
      }
    });

    onSave(attendance);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Mark Attendance
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
            <div className="mt-4 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Select students who attended the session:
              </p>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {students.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400">
                    No students found in this batch.
                  </p>
                </div>
              ) : (
                students.map((student) =>
                  {
                    return (
                      <div
                    key={student._id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
                    onClick={() => toggleStudent(student._id)}
                  >
                    <div className="flex items-center">
                      <FaUserAlt className="mr-3 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">
                        {student.name}
                      </span>
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      selectedStudents.has(student._id)
                        ? 'bg-green-500'
                        : 'bg-gray-200 dark:bg-gray-600'
                    }`}>
                      {selectedStudents.has(student._id) && (
                        <FaCheck className="text-white text-sm" />
                      )}
                    </div>
                  </div>
                )})
              
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={students.length === 0}
                className={`px-4 py-2 text-white rounded-md transition-colors duration-200 ${
                  students.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary dark:bg-primary-dark hover:bg-primary-dark dark:hover:bg-primary'
                }`}
              >
                Save Attendance
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 
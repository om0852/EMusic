'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaCalendar, FaClock, FaPlus, FaTrash, FaSave, FaArrowLeft, FaVideo, FaLock, FaUpload, FaBook, FaTasks } from 'react-icons/fa';
import { Toaster, toast } from 'react-hot-toast';
import AssignmentSection from '@/app/components/AssignmentSection';

// Common button styles
const buttonStyles = {
  primary: "flex items-center justify-center bg-primary dark:bg-primary-dark text-black dark:text-white px-4 py-2 rounded-md hover:bg-primary-dark dark:hover:bg-primary transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
  secondary: "flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200",
  danger: "text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 cursor-pointer transition-colors duration-200"
};

// Helper function to get the next occurrence of a day
const getNextOccurrence = (dayName, startTime) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  const todayDay = today.getDay();
  const targetDay = days.indexOf(dayName);
  
  // If it's the same day, check the time
  if (todayDay === targetDay) {
    const now = new Date();
    const [hours, minutes] = startTime.split(':');
    const sessionTime = new Date(now);
    sessionTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // If the session time hasn't passed yet, use today's date
    if (sessionTime > now) {
      return today;
    }
  }
  
  // Calculate days until next occurrence
  let daysUntilNext = targetDay - todayDay;
  if (daysUntilNext <= 0 && (todayDay !== targetDay || daysUntilNext < 0)) {
    daysUntilNext += 7;
  }
  
  const nextDate = new Date();
  nextDate.setDate(today.getDate() + daysUntilNext);
  return nextDate;
};

export default function EditBatchPage({ params }) {
  const router = useRouter();
  const { batchId } = params;
  
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [schedule, setSchedule] = useState([]);
  const [newSchedule, setNewSchedule] = useState({
    day: 'Monday',
    startTime: '',
    endTime: ''
  });

  const [meetInfo, setMeetInfo] = useState({
    link: '',
    password: ''
  });

  const [note, setNote] = useState({
    title: '',
    content: '',
    file: null
  });

  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    fetchBatch();
    fetchAssignments();
  }, [batchId]);

  const fetchBatch = async () => {
    try {
      const response = await fetch(`/api/admin/batches/${batchId}`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error fetching batch');
      }

      setBatch(data.batch);
      setSchedule(data.batch.schedule || []);
      setMeetInfo({
        link: data.batch.meetLink || '',
        password: data.batch.meetPassword || ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`/api/admin/batches/${batchId}/assignments`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch assignments');
      }

      const data = await response.json();
      setAssignments(data.assignments);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    }
  };

  const handleAddSchedule = () => {
    if (!newSchedule.startTime || !newSchedule.endTime) {
      setError('Please fill in all schedule fields');
      return;
    }

    // Get the next occurrence of the selected day, passing the start time
    const nextDate = getNextOccurrence(newSchedule.day, newSchedule.startTime);

    setSchedule([...schedule, { 
      ...newSchedule,
      date: nextDate // Store the full date object
    }]);
    
    setNewSchedule({
      day: 'Monday',
      startTime: '',
      endTime: ''
    });
  };

  const handleRemoveSchedule = (index) => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  const handleFileChange = async (e, type, setter) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed');
        return;
      }
      
      // Show loading toast
      const loadingToast = toast.loading('Uploading file...');
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload file');
        }
        
        const data = await response.json();
        setter(prev => ({
          ...prev,
          file
        }));
        
        // Dismiss loading toast and show success
        toast.dismiss(loadingToast);
        toast.success('File uploaded successfully!');
      } catch (err) {
        // Dismiss loading toast and show error
        toast.dismiss(loadingToast);
        toast.error('Failed to upload file');
        console.error(err);
      }
    }
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload file');
      }
      
      const data = await response.json();
      return data.url;
    } catch (err) {
      throw new Error('Failed to upload file');
    }
  };

  const handleAddNote = async () => {
    if (!note.title || !note.content) {
      toast.error('Please fill in required note fields');
      return;
    }

    const loadingToast = toast.loading('Adding note...');
    try {
      let fileUrl = null;
      if (note.file) {
        fileUrl = await uploadFile(note.file);
      }

      const response = await fetch(`/api/admin/batches/${batchId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...note,
          file: fileUrl
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to add note');
      }

      setNote({
        title: '',
        content: '',
        file: null
      });

      await fetchBatch();
      toast.dismiss(loadingToast);
      toast.success('Note added successfully!');
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.message);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Ensure all schedule items have proper Date objects
      const updatedSchedule = schedule.map(item => ({
        ...item,
        date: item.date instanceof Date ? item.date : new Date(item.date)
      }));

      const response = await fetch(`/api/admin/batches/${batchId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schedule: updatedSchedule,
          meetLink: meetInfo.link,
          meetPassword: meetInfo.password
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to update batch');
      }

      toast.success('Batch updated successfully!');
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <Toaster 
        position="top-right"
        toastOptions={{
          success: {
            style: {
              background: '#10B981',
              color: 'white',
            },
          },
          error: {
            style: {
              background: '#EF4444',
              color: 'white',
            },
          },
          loading: {
            style: {
              background: '#3B82F6',
              color: 'white',
            },
          },
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/admin/batches')}
              className="mr-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors duration-200"
            >
              <FaArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Batch</h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {batch?.subject?.name} - {batch?.level?.name}
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className={buttonStyles.primary}
          >
            <FaSave className="mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Google Meet Information */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Google Meet Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FaVideo className="inline mr-2" />
                Meet Link
              </label>
              <input
                type="url"
                value={meetInfo.link}
                onChange={(e) => setMeetInfo({ ...meetInfo, link: e.target.value })}
                placeholder="https://meet.google.com/..."
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark transition-colors duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FaLock className="inline mr-2" />
                Meet Password
              </label>
              <input
                type="text"
                value={meetInfo.password}
                onChange={(e) => setMeetInfo({ ...meetInfo, password: e.target.value })}
                placeholder="Optional password for the meeting"
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark transition-colors duration-200"
              />
            </div>
          </div>
        </div>

        {/* Schedule Management */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
            <FaCalendar className="mr-2" />
            Schedule Management
          </h2>
          
          {/* Add New Schedule */}
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <select
                value={newSchedule.day}
                onChange={(e) => setNewSchedule({ ...newSchedule, day: e.target.value })}
                className="col-span-2 md:col-span-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark transition-colors duration-200"
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              <input
                type="time"
                value={newSchedule.startTime}
                onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark transition-colors duration-200"
              />
              <input
                type="time"
                value={newSchedule.endTime}
                onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark transition-colors duration-200"
              />
              <button
                onClick={handleAddSchedule}
                className={buttonStyles.primary}
              >
                <FaPlus className="mr-2" />
                Add
              </button>
            </div>
          </div>

          {/* Schedule List */}
          <div className="space-y-2">
            {schedule.map((item, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.day}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.startTime} - {item.endTime}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Starting from: {item.date instanceof Date ? item.date.toLocaleDateString() : new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveSchedule(index)}
                  className={buttonStyles.danger}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
            {schedule.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No schedule items added yet</p>
            )}
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
            <FaBook className="mr-2" />
            Add Notes
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={note.title}
                onChange={(e) => setNote({ ...note, title: e.target.value })}
                placeholder="Note title"
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark transition-colors duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content
              </label>
              <textarea
                value={note.content}
                onChange={(e) => setNote({ ...note, content: e.target.value })}
                placeholder="Note content"
                rows={4}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark transition-colors duration-200"
              />
              <div className="flex items-center space-x-2 mt-2">
                <input
                  type="file"
                  accept="*"
                  onChange={(e) => handleFileChange(e, 'file', setNote)}
                  className="hidden"
                  id="noteFile"
                />
                <label
                  htmlFor="noteFile"
                  className={buttonStyles.secondary}
                >
                  <FaUpload className="mr-2" />
                  {note.file ? note.file.name : 'Upload PDF'}
                </label>
              </div>
            </div>

            <button
              onClick={handleAddNote}
              className={buttonStyles.primary}
            >
              <FaPlus className="mr-2" />
              Add Note
            </button>
          </div>

          {/* Previous Notes */}
          {batch?.notes?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Previous Notes</h3>
              <div className="space-y-4">
                {batch.notes.map((note, index) => (
                  <div key={index} className="border dark:border-gray-700 rounded-md p-4 bg-gray-50 dark:bg-gray-700">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{note.title}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(note.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{note.content}</p>
                    {note.file && (
                      <a
                        href={note.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary dark:text-primary-dark hover:text-primary-dark dark:hover:text-primary flex items-center mt-2 cursor-pointer transition-colors duration-200"
                      >
                        <FaUpload className="mr-2" />
                        View PDF
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Assignments Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center">
            <FaTasks className="mr-2" />
            Assignments
          </h2>
          <AssignmentSection
            batchId={batchId}
            assignments={assignments}
            onUpdate={fetchAssignments}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-500 p-4 rounded-md mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import {
  FaCalendar,
  FaClock,
  FaSync,
  FaUsers,
  FaChalkboardTeacher,
  FaVideo,
  FaHistory,
  FaInfoCircle,
  FaGraduationCap,
  FaBook,
  FaTasks,
  FaUpload,
  FaDownload,
  FaComment,
  FaPaperPlane,
  FaSpinner,
  FaExclamationCircle
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function MyBatches() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [completedSessions, setCompletedSessions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [activeTab, setActiveTab] = useState('sessions');
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [folderName, setFolderName] = useState("");
  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      console.log("Selected Batch", selectedBatch)
      fetchSessions(selectedBatch._id);
      fetchAssignments(selectedBatch._id);
      fetchNotes(selectedBatch._id);
    }
  }, [selectedBatch]);

  const fetchFolderList = async () => {
    try {
      const response = await fetch(`/api/admin/batches/${selectedBatch}/folder`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          folderName: folderName,
          id: batchId
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to add folder');
      }
    }
    catch (error) {

    }
  }

  const handleFolderName = async (e) => {
    setFolderName(e.target.value)
  }

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

  const fetchSessions = async (batchId) => {
    try {
      const response = await fetch(`/api/batches/${batchId}/sessions`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error fetching sessions');
      }

      // Filter sessions for upcoming 7 days
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of today

      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      nextWeek.setHours(23, 59, 59, 999); // End of the 7th day

      const upcoming = data.sessions.filter(session => {
        const sessionDate = new Date(session.date);
        const [hours, minutes] = session.startTime.split(':');
        sessionDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return sessionDate >= now && sessionDate <= nextWeek;
      });

      const completed = data.sessions.filter(session => {
        const sessionDate = new Date(session.date);
        const [hours, minutes] = session.startTime.split(':');
        sessionDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return sessionDate < now;
      });

      //console.log('Upcoming sessions:', upcoming); // Add this for debugging
      setUpcomingSessions(upcoming);
      setCompletedSessions(completed);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    }
  };

  const fetchAssignments = async (batchId) => {
    try {
      const response = await fetch(`/api/batches/${batchId}/assignments`, {
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

  const fetchNotes = async (batchId) => {
    try {
      const response = await fetch(`/api/batches/${batchId}/notes`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }

      const data = await response.json();
      setNotes(data.notes);
    } catch (err) {
      console.error('Error fetching notes:', err);
    }
  };

  const handleSubmitAssignment = async (assignmentId) => {
    if (!submissionFile) {
      toast.error('Please select a file to submit');
      return;
    }

    const loadingToast = toast.loading('Uploading assignment...');
    const formData = new FormData();
    formData.append('file', submissionFile);

    try {
      // First upload the file
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.message || 'Failed to upload file');
      }

      const { url: fileUrl } = await uploadResponse.json();

      // Then submit the assignment
      const response = await fetch(`/api/batches/${selectedBatch._id}/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: fileUrl
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit assignment');
      }

      toast.dismiss(loadingToast);
      toast.success('Assignment submitted successfully!');
      setSubmissionFile(null);
      setSelectedAssignment(null);
      await fetchAssignments(selectedBatch._id);
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.message || 'Failed to submit assignment');
      console.error('Assignment submission error:', err);
    }
  };

  const handleAddFeedback = async (assignmentId) => {
    if (!feedback.trim()) {
      toast.error('Please write your feedback');
      return;
    }

    try {
      const response = await fetch(`/api/batches/${selectedBatch._id}/assignments/${assignmentId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: feedback,
          type: 'text'
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to add feedback');
      }

      toast.success('Feedback added successfully!');
      setFeedback('');
      fetchAssignments(selectedBatch._id);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canJoinSession = (session) => {
    const now = new Date();
    const sessionDate = new Date(session.date);
    const [hours, minutes] = session.startTime.split(':');
    sessionDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // Calculate 10 minutes before session start
    const joinTime = new Date(sessionDate);
    joinTime.setMinutes(joinTime.getMinutes() - 10);

    // Calculate session end time
    const endTime = new Date(sessionDate);
    const [endHours, endMinutes] = session.endTime.split(':');
    endTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

    // Debug logs
    //console.log('Now:', now);
    //console.log('Join time:', joinTime);
    //console.log('Session time:', sessionDate);
    //console.log('End time:', endTime);

    return now >= joinTime && now <= endTime;
  };

  const getSessionStatus = (session) => {
    const now = new Date();
    const sessionDate = new Date(session.date);
    const [hours, minutes] = session.startTime.split(':');
    sessionDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const joinTime = new Date(sessionDate);
    joinTime.setMinutes(joinTime.getMinutes() - 10);

    const endTime = new Date(sessionDate);
    const [endHours, endMinutes] = session.endTime.split(':');
    endTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

    if (now < joinTime) {
      // Calculate minutes until join time (not session time)
      const minutesUntil = Math.floor((joinTime - now) / (1000 * 60));
      if (minutesUntil < 60) {
        return `Join opens in ${minutesUntil} minutes`;
      } else {
        const hoursUntil = Math.floor(minutesUntil / 60);
        const remainingMinutes = minutesUntil % 60;
        if (remainingMinutes > 0) {
          return `Join opens in ${hoursUntil}h ${remainingMinutes}m`;
        }
        return `Join opens in ${hoursUntil} hours`;
      }
    } else if (now >= joinTime && now < sessionDate) {
      return 'Join Now (Session starts soon)';
    } else if (now >= sessionDate && now <= endTime) {
      return 'In Progress';
    } else {
      return 'Ended';
    }
  };

  const getRandomGradient = () => {
    const gradients = [
      'from-purple-400 to-pink-500',
      'from-purple-400 to-pink-500',
      'from-purple-400 to-pink-500',
      'from-purple-400 to-pink-500',
      'from-purple-400 to-pink-500',
      'from-purple-400 to-pink-500'
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-pink-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center p-8 rounded-2xl bg-black/50 backdrop-blur-sm border border-white/10 shadow-2xl"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mx-auto w-16 h-16 flex items-center justify-center"
          >
            <FaSpinner className="text-4xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-6 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200"
          >
            Loading your learning journey...
          </motion.p>
          <motion.p
            className="mt-2 text-purple-300 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            Just a moment while we prepare your dashboard
          </motion.p>
          <div className="h-4 bg-purple-900/30 rounded-full w-1/2 mt-6 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 dark:from-gray-900 dark:to-red-950 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-red-200 dark:border-red-900/50">
            <div className="bg-red-500 dark:bg-red-900/80 px-6 py-4 flex items-center">
              <FaExclamationCircle className="text-white text-2xl mr-3" />
              <h2 className="text-lg font-bold text-white">Error Loading Batches</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                We encountered an issue while loading your batches. Please try again later or contact support if the problem persists.
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 p-4 rounded">
                <p className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="mt-6 px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center mx-auto"
              >
                <FaSync className="mr-2" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 dark:from-gray-900 dark:to-red-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 flex items-center">
              <FaGraduationCap className="mr-3 text-indigo-500 dark:text-indigo-400" />
              My Learning Journey
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Track and manage all your enrolled courses in one place
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 flex items-center self-start sm:self-center"
          >
            <FaSync className="mr-2" />
            Refresh
          </button>
        </div>

        {batches.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8 text-center border border-red-100 dark:border-red-900/50 max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBookOpen className="text-red-500 dark:text-red-400 text-3xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No Batches Found</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">You are not enrolled in any batches yet. Explore our courses to get started!</p>
            <button className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {batches.map((batch) => (
              <div
                key={batch._id}
                className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl border border-gray-100 dark:border-gray-700/50 flex flex-col h-full"
              >
                <div className={`h-2 bg-gradient-to-r ${getRandomGradient()}`} />
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {batch.subject.name}
                      </h2>
                      <p className="text-sm text-teal-600 dark:text-teal-400 mt-1">
                        {batch.level.name}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${batch.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800' :
                      batch.status === 'Completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800' :
                        batch.status === 'Cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800'
                      }`}>
                      {batch.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3 flex-1">
                    <div className="flex items-center text-sm text-purple-600 dark:text-purple-400">
                      <FaCalendar className="mr-2 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                      <span className="truncate">
                        {formatDate(batch.startDate)} - {formatDate(batch.endDate)}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-cyan-600 dark:text-cyan-400">
                      <FaUsers className="mr-2 text-cyan-500 dark:text-cyan-400 flex-shrink-0" />
                      <span>
                        {batch.students.length} / {batch.maxStudents} students
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {batch.subscription}
                        </span>
                        <p className="text-lg font-bold text-red-600 dark:text-red-400">
                          ₹{batch.price}/month
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedBatch(batch)}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-medium rounded-lg transition-all duration-300 flex items-center cursor-pointer shadow-md hover:shadow-lg"
                      >
                        <FaInfoCircle className="mr-2" />
                        Enter Class
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Batch Details Modal */}
        {selectedBatch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    <span className="text-indigo-600">{selectedBatch.subject.name}</span>
                    <span className="mx-2 text-gray-400">-</span>
                    <span className="text-teal-600">{selectedBatch.level.name}</span>
                  </h2>
                  <button
                    onClick={() => setSelectedBatch(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex space-x-4 mb-6 border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('sessions')}
                    className={`pb-2 px-1 cursor-pointer transition-all duration-300 ${activeTab === 'sessions' ?
                      'border-b-2 border-indigo-500 text-indigo-600 font-semibold' :
                      'text-gray-500 hover:text-indigo-500'}`}
                  >
                    <FaVideo className={`inline mr-2 ${activeTab === 'sessions' ? 'text-indigo-500' : 'text-gray-400'}`} />
                    Sessions
                  </button>
                  <button
                    onClick={() => setActiveTab('assignments')}
                    className={`pb-2 px-1 cursor-pointer transition-all duration-300 ${activeTab === 'assignments' ?
                      'border-b-2 border-teal-500 text-teal-600 font-semibold' :
                      'text-gray-500 hover:text-teal-500'}`}
                  >
                    <FaTasks className={`inline mr-2 ${activeTab === 'assignments' ? 'text-teal-500' : 'text-gray-400'}`} />
                    Assignments
                  </button>
                  <button
                    onClick={() => setActiveTab('notes')}
                    className={`pb-2 px-1 cursor-pointer transition-all duration-300 ${activeTab === 'notes' ?
                      'border-b-2 border-purple-500 text-purple-600 font-semibold' :
                      'text-gray-500 hover:text-purple-500'}`}
                  >
                    <FaBook className={`inline mr-2 ${activeTab === 'notes' ? 'text-purple-500' : 'text-gray-400'}`} />
                    Notes
                  </button>
                </div>

                {/* Content sections */}
                <div className="bg-gray-50 rounded-lg p-4">
                  {/* Sessions Tab */}
                  {activeTab === 'sessions' && (
                    <>
                      {/* Upcoming Sessions */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
                          <FaVideo className="mr-2 text-indigo-500" />
                          Upcoming Sessions
                        </h3>
                        <div className="space-y-4">
                          {upcomingSessions.map((session) => {
                            const now = new Date();
                            const sessionDate = new Date(session.date);
                            const [hours, minutes] = session.startTime.split(':');
                            sessionDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

                            const joinTime = new Date(sessionDate);
                            joinTime.setMinutes(joinTime.getMinutes() - 10);

                            const endTime = new Date(sessionDate);
                            const [endHours, endMinutes] = session.endTime.split(':');
                            endTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

                            const canJoin = now >= joinTime && now <= endTime;
                            const sessionStatus = getSessionStatus(session);
                            const isActive = sessionStatus.includes('Progress') || sessionStatus.includes('Join Now');

                            return (
                              <div key={session._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-indigo-200 transition-colors">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {formatDate(session.date)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {formatTime(session.startTime)} - {formatTime(session.endTime)}
                                    </p>
                                    <p className={`text-sm mt-1 ${isActive ? 'text-green-500' : 'text-gray-500'
                                      }`}>
                                      {sessionStatus}
                                    </p>
                                  </div>
                                  {session.meetLink && (
                                    <button
                                      onClick={() => {
                                        const meetLink = session.meetLink.startsWith('http')
                                          ? session.meetLink
                                          : `https://${session.meetLink}`;
                                        window.open(meetLink, '_blank');
                                      }}
                                      disabled={!canJoin}
                                      className={`px-4 py-2 rounded-md transition-all duration-300 flex items-center ${canJoin
                                        ? 'bg-indigo-500 hover:bg-indigo-600 text-white cursor-pointer'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                      <FaVideo className="mr-2" />
                                      {canJoin ? (
                                        now >= sessionDate ? 'Join Now' : 'Join Early'
                                      ) : (
                                        'Join Meeting'
                                      )}
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          {upcomingSessions.length === 0 && (
                            <p className="text-gray-500 text-center py-4">
                              No upcoming sessions scheduled
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Completed Sessions */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
                          <FaHistory className="mr-2 text-teal-500" />
                          Completed Sessions
                        </h3>
                        <div className="space-y-4">
                          {completedSessions.map((session) => (
                            <div key={session._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {formatDate(session.date)}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {formatTime(session.startTime)} - {formatTime(session.endTime)}
                                  </p>
                                </div>
                                {session.recordingUrl && (
                                  <a
                                    href={session.recordingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-md transition-colors flex items-center"
                                  >
                                    <FaVideo className="mr-2" />
                                    Watch Recording
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Assignments Tab */}
                  {activeTab === 'assignments' && (
                    <div className="space-y-6">
                      {assignments.map((assignment) => (
                        <div key={assignment._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">
                                {assignment.title}
                              </h4>
                              <p className="text-sm text-gray-500 mt-1">
                                Due: {formatDate(assignment.dueDate)}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              {assignment.files?.document && (
                                <a
                                  href={assignment.files.document}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1 bg-teal-500 hover:bg-teal-600 text-white rounded flex items-center text-sm transition-colors"
                                >
                                  <FaDownload className="mr-2" />
                                  Document
                                </a>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-700 mb-4">
                            {assignment.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Notes Tab */}
                  {activeTab === 'notes' && (
                    <div className="space-y-6">
                        <div className="relative w-full max-w-xs">
                          <label htmlFor="folder-select" className="block text-sm font-medium text-gray-800 mb-2">
                            Select Folder
                          </label>
                          <div className="relative">
                            <select
                              id="folder-select"
                              onChange={handleFolderName}
                              className="block w-full px-4 py-2.5 text-base text-white bg-gray-800 border-2 border-purple-500 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none transition-all duration-200 pr-10"
                              value={folderName}
                            >
                              <option value="" disabled className="bg-gray-800 text-white">
                                Select a folder
                              </option>
                              {selectedBatch?.folder?.map((folder, index) => (
                                <option
                                  key={`${folder}-${index}`}
                                  value={folder}
                                  className="bg-gray-800 text-white hover:bg-purple-600"
                                >
                                  {folder}
                                </option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <svg
                                className="w-5 h-5 text-purple-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>

                      <div >
                        {folderName && (
                          <div>
                            {notes.map((note) => {
                              if (note.folder == folderName) {

                                return (
                                  <div key={note._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                    <div className="flex justify-between items-start mb-4">
                                      <div>
                                        <h4 className="text-lg font-semibold text-gray-900">
                                          {note.title}
                                        </h4>

                                      </div>
                                      {note.file && (
                                        <button
                                          onClick={() => setSelectedPdf(note)}
                                          className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded flex items-center text-sm transition-colors"
                                        >
                                          <FaBook className="mr-2" />
                                          View
                                        </button>
                                      )}
                                    </div>
                                    <p className="text-gray-700 whitespace-pre-wrap">
                                      {note.content}
                                    </p>
                                  </div>
                                )
                              }
                            })}
                          </div>
                        )
                        }
                      </div>

                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PDF Viewer Modal */}
        {selectedPdf && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedPdf.title}
                </h3>
                <button
                  onClick={() => setSelectedPdf(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="relative w-full h-[80vh]">
                <iframe
                  src={`${selectedPdf.file}#toolbar=0&navpanes=0&scrollbar=0`}
                  className="absolute inset-0 w-full h-full"
                  title={selectedPdf.title}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};  
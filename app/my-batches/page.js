'use client';

import { useState, useEffect } from 'react';
import { 
  FaCalendar, 
  FaClock, 
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
  FaPaperPlane
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

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

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      fetchSessions(selectedBatch._id);
      fetchAssignments(selectedBatch._id);
      fetchNotes(selectedBatch._id);
    }
  }, [selectedBatch]);

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

      // Filter sessions for today and tomorrow
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const upcoming = data.sessions.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate >= now && sessionDate <= tomorrow;
      });

      const completed = data.sessions.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate < now;
      });

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
        throw new Error('Failed to upload file');
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
        throw new Error('Failed to submit assignment');
      }

      toast.success('Assignment submitted successfully!');
      setSubmissionFile(null);
      fetchAssignments(selectedBatch._id);
    } catch (err) {
      toast.error(err.message);
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
    const sessionStart = new Date(session.date);
    const [hours, minutes] = session.startTime.split(':');
    sessionStart.setHours(hours, minutes);
    
    // Can join 10 minutes before start time
    const joinTime = new Date(sessionStart);
    joinTime.setMinutes(joinTime.getMinutes() - 10);
    
    return now >= joinTime && now <= sessionStart;
  };

  const getRandomGradient = () => {
    const gradients = [
      'from-blue-500 to-purple-500',
      'from-green-400 to-blue-500',
      'from-pink-500 to-purple-500',
      'from-yellow-400 to-orange-500',
      'from-green-500 to-teal-500',
      'from-indigo-500 to-purple-500'
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="space-y-3 mt-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-400">
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <FaGraduationCap className="mr-3" />
            My Learning Journey
          </h1>
        </div>

        {batches.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-500 dark:text-gray-400">You are not enrolled in any batches yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {batches.map((batch) => (
              <div key={batch._id} className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className={`h-3 bg-gradient-to-r ${getRandomGradient()}`} />
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{batch.subject}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{batch.level}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      batch.status === 'Active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                      batch.status === 'Completed' ? 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400' :
                      batch.status === 'Cancelled' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' :
                      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                    }`}>
                      {batch.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <FaCalendar className="mr-2" />
                      <span>{formatDate(batch.startDate)} - {formatDate(batch.endDate)}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <FaClock className="mr-2" />
                      <div>
                        {batch.schedule.map((s, i) => (
                          <div key={i}>
                            {s.day}: {formatTime(s.startTime)} - {formatTime(s.endTime)}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <FaUsers className="mr-2" />
                      <span>
                        {batch.students.length} / {batch.maxStudents} students
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <FaChalkboardTeacher className="mr-2" />
                      <span>{batch.teacher.name}</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{batch.subscription}</span>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">${batch.price}/month</p>
                      </div>
                      <button
                        onClick={() => setSelectedBatch(batch)}
                        className="px-4 py-2 bg-primary dark:bg-primary-dark text-black dark:text-white rounded-md hover:bg-primary-dark dark:hover:bg-primary transition-colors flex items-center"
                      >
                        <FaInfoCircle className="mr-2" />
                        View Details
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedBatch.subject} - {selectedBatch.level}</h2>
                  <button
                    onClick={() => setSelectedBatch(null)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ×
                  </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex space-x-4 mb-6 border-b dark:border-gray-700">
                  <button
                    onClick={() => setActiveTab('sessions')}
                    className={`pb-2 px-1 ${activeTab === 'sessions' ? 
                      'border-b-2 border-primary dark:border-primary-dark text-primary dark:text-primary-dark' : 
                      'text-gray-500 dark:text-gray-400'}`}
                  >
                    <FaVideo className="inline mr-2" />
                    Sessions
                  </button>
                  <button
                    onClick={() => setActiveTab('assignments')}
                    className={`pb-2 px-1 ${activeTab === 'assignments' ? 
                      'border-b-2 border-primary dark:border-primary-dark text-primary dark:text-primary-dark' : 
                      'text-gray-500 dark:text-gray-400'}`}
                  >
                    <FaTasks className="inline mr-2" />
                    Assignments
                  </button>
                  <button
                    onClick={() => setActiveTab('notes')}
                    className={`pb-2 px-1 ${activeTab === 'notes' ? 
                      'border-b-2 border-primary dark:border-primary-dark text-primary dark:text-primary-dark' : 
                      'text-gray-500 dark:text-gray-400'}`}
                  >
                    <FaBook className="inline mr-2" />
                    Notes
                  </button>
                </div>

                {/* Sessions Tab */}
                {activeTab === 'sessions' && (
                  <>
                    {/* Upcoming Sessions */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                        <FaVideo className="mr-2" />
                        Upcoming Sessions
                      </h3>
                      <div className="space-y-4">
                        {upcomingSessions.map((session) => (
                          <div key={session._id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {formatDate(session.date)}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatTime(session.startTime)} - {formatTime(session.endTime)}
                                </p>
                              </div>
                              {canJoinSession(session) && session.meetLink && (
                                <a
                                  href={session.meetLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center"
                                >
                                  <FaVideo className="mr-2" />
                                  Join Now
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                        {upcomingSessions.length === 0 && (
                          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                            No upcoming sessions for today or tomorrow
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Completed Sessions */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                        <FaHistory className="mr-2" />
                        Completed Sessions
                      </h3>
                      <div className="space-y-4">
                        {completedSessions.map((session) => (
                          <div key={session._id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {formatDate(session.date)}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatTime(session.startTime)} - {formatTime(session.endTime)}
                                </p>
                              </div>
                              {session.recordingUrl && (
                                <a
                                  href={session.recordingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-4 py-2 bg-primary dark:bg-primary-dark text-black dark:text-white rounded-md hover:bg-primary-dark dark:hover:bg-primary transition-colors flex items-center"
                                >
                                  <FaVideo className="mr-2" />
                                  Watch Recording
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                        {completedSessions.length === 0 && (
                          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                            No completed sessions yet
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Assignments Tab */}
                {activeTab === 'assignments' && (
                  <div className="space-y-6">
                    {assignments.map((assignment) => (
                      <div key={assignment._id} className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {assignment.title}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Due: {formatDate(assignment.dueDate)}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            {assignment.files?.document && (
                              <a
                                href={assignment.files.document}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-primary dark:bg-primary-dark text-black dark:text-white rounded flex items-center text-sm hover:bg-primary-dark dark:hover:bg-primary transition-colors"
                              >
                                <FaDownload className="mr-2" />
                                Document
                              </a>
                            )}
                            {assignment.files?.audio && (
                              <a
                                href={assignment.files.audio}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-primary dark:bg-primary-dark text-black dark:text-white rounded flex items-center text-sm hover:bg-primary-dark dark:hover:bg-primary transition-colors"
                              >
                                <FaDownload className="mr-2" />
                                Audio
                              </a>
                            )}
                            {assignment.files?.video && (
                              <a
                                href={assignment.files.video}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-primary dark:bg-primary-dark text-black dark:text-white rounded flex items-center text-sm hover:bg-primary-dark dark:hover:bg-primary transition-colors"
                              >
                                <FaDownload className="mr-2" />
                                Video
                              </a>
                            )}
                          </div>
                        </div>

                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                          {assignment.description}
                        </p>

                        {/* Submission Section */}
                        <div className="border-t dark:border-gray-600 pt-4 mt-4">
                          <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            Your Submission
                          </h5>
                          {assignment.submissions?.find(s => s.student === user?._id) ? (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  Submitted on {formatDate(assignment.submissions[0].submittedAt)}
                                </span>
                                <a
                                  href={assignment.submissions[0].file}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary dark:text-primary-dark hover:underline flex items-center"
                                >
                                  <FaDownload className="mr-1" />
                                  View Submission
                                </a>
                              </div>

                              {/* Feedback Section */}
                              <div className="space-y-3">
                                <h6 className="text-sm font-semibold text-gray-900 dark:text-white">
                                  Feedback
                                </h6>
                                {assignment.submissions[0].feedback?.map((f, i) => (
                                  <div key={i} className="bg-white dark:bg-gray-800 p-3 rounded">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                      {f.content}
                                    </p>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {formatDate(f.createdAt)}
                                    </span>
                                  </div>
                                ))}
                                
                                {/* Add Feedback */}
                                <div className="flex space-x-2">
                                  <input
                                    type="text"
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Write your feedback..."
                                    className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                  />
                                  <button
                                    onClick={() => handleAddFeedback(assignment._id)}
                                    className="px-4 py-2 bg-primary dark:bg-primary-dark text-black dark:text-white rounded-md hover:bg-primary-dark dark:hover:bg-primary transition-colors flex items-center"
                                  >
                                    <FaPaperPlane className="mr-2" />
                                    Send
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="file"
                                  onChange={(e) => setSubmissionFile(e.target.files[0])}
                                  className="hidden"
                                  id={`submission-${assignment._id}`}
                                />
                                <label
                                  htmlFor={`submission-${assignment._id}`}
                                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
                                >
                                  <FaUpload className="mr-2" />
                                  {submissionFile ? submissionFile.name : 'Choose File'}
                                </label>
                                <button
                                  onClick={() => handleSubmitAssignment(assignment._id)}
                                  className="px-4 py-2 bg-primary dark:bg-primary-dark text-black dark:text-white rounded-md hover:bg-primary-dark dark:hover:bg-primary transition-colors flex items-center"
                                >
                                  <FaPaperPlane className="mr-2" />
                                  Submit
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {assignments.length === 0 && (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                        No assignments available yet
                      </p>
                    )}
                  </div>
                )}

                {/* Notes Tab */}
                {activeTab === 'notes' && (
                  <div className="space-y-6">
                    {notes.map((note) => (
                      <div key={note._id} className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {note.title}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {formatDate(note.createdAt)}
                            </p>
                          </div>
                          {note.file && (
                            <a
                              href={note.file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-primary dark:bg-primary-dark text-black dark:text-white rounded flex items-center text-sm hover:bg-primary-dark dark:hover:bg-primary transition-colors"
                            >
                              <FaDownload className="mr-2" />
                              Download PDF
                            </a>
                          )}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {note.content}
                        </p>
                      </div>
                    ))}
                    {notes.length === 0 && (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                        No notes available yet
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
'use client';

import { useState } from 'react';
import { FaTasks, FaUpload, FaVideo, FaMicrophone, FaComment, FaTrash, FaDownload, FaFile } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const buttonStyles = {
  primary: "flex items-center justify-center bg-primary dark:bg-primary-dark text-black dark:text-white px-4 py-2 rounded-md hover:bg-primary-dark dark:hover:bg-primary transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
  secondary: "flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200",
  danger: "text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 cursor-pointer transition-colors duration-200"
};

export default function AssignmentSection({ batchId, assignments = [], onUpdate }) {
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    files: {
      document: null,
      audio: null,
      video: null
    },
    dueDate: new Date().toISOString().split('T')[0]
  });

  const [feedback, setFeedback] = useState({
    type: 'text', // 'text', 'audio', 'video'
    content: '',
    file: null
  });

  const handleFileUpload = async (file, type) => {
    if (!file) return null;
    
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

  const handleAddAssignment = async () => {
    if (!newAssignment.title || !newAssignment.description || !newAssignment.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const loadingToast = toast.loading('Adding assignment...');
    try {
      const uploadedFiles = {};
      
      // Upload all files
      for (const [type, file] of Object.entries(newAssignment.files)) {
        if (file) {
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
            credentials: 'include'
          });
          
          if (!response.ok) {
            throw new Error(`Failed to upload ${type} file`);
          }
          
          const data = await response.json();
          uploadedFiles[type] = data.url; // Store the URL from the upload response
        }
      }

      const response = await fetch(`/api/admin/batches/${batchId}/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newAssignment.title,
          description: newAssignment.description,
          dueDate: newAssignment.dueDate,
          files: uploadedFiles // Send the URLs to be stored in the model
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to add assignment');
      }

      setNewAssignment({
        title: '',
        description: '',
        files: {
          document: null,
          audio: null,
          video: null
        },
        dueDate: new Date().toISOString().split('T')[0]
      });

      onUpdate();
      toast.dismiss(loadingToast);
      toast.success('Assignment added successfully!');
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.message || 'Failed to add assignment');
    }
  };

  const handleAddFeedback = async (assignmentId, studentId) => {
    if (!feedback.content && !feedback.file) {
      toast.error('Please provide feedback content or upload a file');
      return;
    }

    const loadingToast = toast.loading('Adding feedback...');
    try {
      let fileUrl = null;
      if (feedback.file) {
        fileUrl = await handleFileUpload(feedback.file, feedback.type);
      }

      const response = await fetch(`/api/admin/batches/${batchId}/assignments/${assignmentId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: feedback.type,
          content: feedback.content,
          file: fileUrl,
          studentId
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to add feedback');
      }

      setFeedback({
        type: 'text',
        content: '',
        file: null
      });

      onUpdate();
      toast.dismiss(loadingToast);
      toast.success('Feedback added successfully!');
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error('Failed to add feedback');
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New Assignment */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Add New Assignment
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={newAssignment.title}
              onChange={(e) => setNewAssignment(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark"
              placeholder="Assignment title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={newAssignment.description}
              onChange={(e) => setNewAssignment(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark"
              rows={4}
              placeholder="Assignment description"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={newAssignment.dueDate}
                onChange={(e) => setNewAssignment(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Attachments
              </label>
              <div className="space-y-2">
                {/* Document Upload */}
                <label className={`${buttonStyles.secondary} w-full justify-center`}>
                  <FaFile className="mr-2" />
                  Upload Document (PDF)
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => setNewAssignment(prev => ({
                      ...prev,
                      files: { ...prev.files, document: e.target.files[0] }
                    }))}
                  />
                </label>
                {newAssignment.files.document && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Document: {newAssignment.files.document.name}
                  </p>
                )}

                {/* Audio Upload */}
                <label className={`${buttonStyles.secondary} w-full justify-center`}>
                  <FaMicrophone className="mr-2" />
                  Upload Audio
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => setNewAssignment(prev => ({
                      ...prev,
                      files: { ...prev.files, audio: e.target.files[0] }
                    }))}
                  />
                </label>
                {newAssignment.files.audio && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Audio: {newAssignment.files.audio.name}
                  </p>
                )}

                {/* Video Upload */}
                <label className={`${buttonStyles.secondary} w-full justify-center`}>
                  <FaVideo className="mr-2" />
                  Upload Video
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => setNewAssignment(prev => ({
                      ...prev,
                      files: { ...prev.files, video: e.target.files[0] }
                    }))}
                  />
                </label>
                {newAssignment.files.video && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Video: {newAssignment.files.video.name}
                  </p>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleAddAssignment}
            className={buttonStyles.primary}
          >
            <FaTasks className="mr-2" />
            Add Assignment
          </button>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {assignments.map((assignment) => (
          <div key={assignment._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {assignment.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-2">
                {assignment.files?.document && (
                  <a
                    href={assignment.files.document}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonStyles.secondary}
                    title="Download Document"
                  >
                    <FaFile className="mr-2" />
                    Document
                  </a>
                )}
                {assignment.files?.audio && (
                  <a
                    href={assignment.files.audio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonStyles.secondary}
                    title="Download Audio"
                  >
                    <FaMicrophone className="mr-2" />
                    Audio
                  </a>
                )}
                {assignment.files?.video && (
                  <a
                    href={assignment.files.video}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonStyles.secondary}
                    title="Download Video"
                  >
                    <FaVideo className="mr-2" />
                    Video
                  </a>
                )}
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {assignment.description}
            </p>

            {/* Student Submissions */}
            <div className="mt-6 space-y-4">
              <h5 className="text-sm font-semibold text-gray-900 dark:text-white">
                Student Submissions
              </h5>
              {assignment.submissions?.map((submission) => (
                <div key={submission._id} className="border dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {submission.student.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Submitted: {new Date(submission.submittedAt).toLocaleString()}
                      </p>
                    </div>
                    {submission.file && (
                      <a
                        href={submission.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={buttonStyles.secondary}
                      >
                        <FaDownload className="mr-2" />
                        View Submission
                      </a>
                    )}
                  </div>

                  {/* Feedback Form */}
                  <div className="mt-4 space-y-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setFeedback(prev => ({ ...prev, type: 'text' }))}
                        className={`p-2 rounded ${feedback.type === 'text' ? 'bg-primary/10 dark:bg-primary-dark/10' : ''}`}
                      >
                        <FaComment />
                      </button>
                      <button
                        onClick={() => setFeedback(prev => ({ ...prev, type: 'audio' }))}
                        className={`p-2 rounded ${feedback.type === 'audio' ? 'bg-primary/10 dark:bg-primary-dark/10' : ''}`}
                      >
                        <FaMicrophone />
                      </button>
                      <button
                        onClick={() => setFeedback(prev => ({ ...prev, type: 'video' }))}
                        className={`p-2 rounded ${feedback.type === 'video' ? 'bg-primary/10 dark:bg-primary-dark/10' : ''}`}
                      >
                        <FaVideo />
                      </button>
                    </div>

                    {feedback.type === 'text' ? (
                      <textarea
                        value={feedback.content}
                        onChange={(e) => setFeedback(prev => ({ ...prev, content: e.target.value }))}
                        className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark"
                        rows={3}
                        placeholder="Write your feedback..."
                      />
                    ) : (
                      <div>
                        <label className={buttonStyles.secondary}>
                          <FaUpload className="mr-2" />
                          Upload {feedback.type === 'audio' ? 'Audio' : 'Video'}
                          <input
                            type="file"
                            accept={feedback.type === 'audio' ? 'audio/*' : 'video/*'}
                            className="hidden"
                            onChange={(e) => setFeedback(prev => ({ ...prev, file: e.target.files[0] }))}
                          />
                        </label>
                        {feedback.file && (
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {feedback.file.name}
                          </p>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => handleAddFeedback(assignment._id, submission.student._id)}
                      className={buttonStyles.primary}
                    >
                      Add Feedback
                    </button>
                  </div>

                  {/* Previous Feedback */}
                  {submission.feedback?.map((item) => (
                    <div key={item._id} className="mt-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                      {item.type === 'text' ? (
                        <p className="mt-1 text-gray-700 dark:text-gray-300">{item.content}</p>
                      ) : (
                        <div className="mt-2">
                          {item.type === 'audio' ? (
                            <audio controls src={item.file} className="w-full" />
                          ) : (
                            <video controls src={item.file} className="w-full rounded" />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
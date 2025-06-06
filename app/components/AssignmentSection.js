'use client';

import { useState, useRef } from 'react';
import { FaTasks, FaUpload, FaVideo, FaMicrophone, FaComment, FaTrash, FaDownload, FaFile, FaStop, FaPlay } from 'react-icons/fa';
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

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingType, setRecordingType] = useState(null); // 'audio' or 'video'
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Add new state for previews
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploaded, setIsUploaded] = useState({
    audio: false,
    video: false
  });

  const startRecording = async (type, context = 'assignment') => {
    try {
      const constraints = {
        audio: true,
        video: type === 'video'
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, {
          type: type === 'video' ? 'video/webm' : 'audio/webm'
        });
        
        // Create preview URL
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        
        // Create a File object from the blob
        const file = new File([blob], `${type}-recording.webm`, {
          type: type === 'video' ? 'video/webm' : 'audio/webm'
        });

        if (context === 'assignment') {
          setNewAssignment(prev => ({
            ...prev,
            files: { ...prev.files, [type]: file }
          }));
          setIsUploaded(prev => ({ ...prev, [type]: false }));
        } else {
          setFeedback(prev => ({
            ...prev,
            type,
            file
          }));
        }

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingType(type);
      toast.success(`${type === 'video' ? 'Video' : 'Audio'} recording started`);
    } catch (err) {
      console.error('Recording error:', err);
      toast.error('Failed to start recording. Please check your device permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Recording stopped');
    }
  };

  const handleFileUpload = (e, type, context = 'assignment') => {
    const file = e.target.files[0];
    if (!file) return;

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    if (context === 'assignment') {
      setNewAssignment(prev => ({
        ...prev,
        files: { ...prev.files, [type]: file }
      }));
      setIsUploaded(prev => ({ ...prev, [type]: true }));
    } else {
      setFeedback(prev => ({
        ...prev,
        type,
        file
      }));
    }
  };

  const clearRecording = (type, context = 'assignment') => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    if (context === 'assignment') {
      setNewAssignment(prev => ({
        ...prev,
        files: { ...prev.files, [type]: null }
      }));
      setIsUploaded(prev => ({ ...prev, [type]: false }));
    } else {
      setFeedback(prev => ({
        ...prev,
        file: null
      }));
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
      toast.error('Please provide feedback content or record/upload a file');
      return;
    }

    const loadingToast = toast.loading('Adding feedback...');
    try {
      let fileUrl = null;
      if (feedback.file) {
        fileUrl = await handleFileUpload(null, feedback.type);
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
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Attachments
              </label>
              <div className="space-y-2">
                {/* Document Upload */}
                <label className={`${buttonStyles.secondary} w-full justify-center cursor-pointer`}>
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

                {/* Audio Recording/Upload */}
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => isRecording ? stopRecording() : startRecording('audio', 'assignment')}
                      className={`${buttonStyles.secondary} flex-1 justify-center cursor-pointer ${isRecording && recordingType === 'audio' ? 'bg-red-100 dark:bg-red-900/30' : ''}`}
                      disabled={isRecording && recordingType !== 'audio' || isUploaded.audio}
                    >
                      {isRecording && recordingType === 'audio' ? (
                        <>
                          <FaStop className="mr-2" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <FaMicrophone className="mr-2" />
                          Record Audio
                        </>
                      )}
                    </button>
                    <label className={`${buttonStyles.secondary} flex-1 justify-center cursor-pointer ${isUploaded.audio ? 'bg-green-100 dark:bg-green-900/30' : ''}`}>
                      <FaUpload className="mr-2" />
                      Upload Audio
                      <input
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'audio', 'assignment')}
                        disabled={newAssignment.files.audio && !isUploaded.audio}
                      />
                    </label>
                  </div>
                  {newAssignment.files.audio && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {isUploaded.audio ? 'Uploaded: ' : 'Recorded: '}
                          {newAssignment.files.audio.name}
                        </span>
                        <button
                          onClick={() => clearRecording('audio', 'assignment')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      <audio controls src={previewUrl} className="w-full" />
                    </div>
                  )}
                </div>

                {/* Video Recording/Upload */}
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => isRecording ? stopRecording() : startRecording('video', 'assignment')}
                      className={`${buttonStyles.secondary} flex-1 justify-center cursor-pointer ${isRecording && recordingType === 'video' ? 'bg-red-100 dark:bg-red-900/30' : ''}`}
                      disabled={isRecording && recordingType !== 'video' || isUploaded.video}
                    >
                      {isRecording && recordingType === 'video' ? (
                        <>
                          <FaStop className="mr-2" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <FaVideo className="mr-2" />
                          Record Video
                        </>
                      )}
                    </button>
                    <label className={`${buttonStyles.secondary} flex-1 justify-center cursor-pointer ${isUploaded.video ? 'bg-green-100 dark:bg-green-900/30' : ''}`}>
                      <FaUpload className="mr-2" />
                      Upload Video
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'video', 'assignment')}
                        disabled={newAssignment.files.video && !isUploaded.video}
                      />
                    </label>
                  </div>
                  {newAssignment.files.video && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {isUploaded.video ? 'Uploaded: ' : 'Recorded: '}
                          {newAssignment.files.video.name}
                        </span>
                        <button
                          onClick={() => clearRecording('video', 'assignment')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      <video controls src={previewUrl} className="w-full rounded" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={handleAddAssignment}
            className={`${buttonStyles.primary} w-full mt-4`}
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

                  {/* Feedback Section */}
                  <div className="space-y-3">
                    <h6 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Add Feedback
                    </h6>
                    <div className="space-y-3">
                      <textarea
                        value={feedback.content}
                        onChange={(e) => setFeedback(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Write your feedback..."
                        className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-primary dark:focus:ring-primary-dark focus:border-primary dark:focus:border-primary-dark"
                        rows={3}
                      />
                      
                      {/* Audio Recording/Upload */}
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => isRecording ? stopRecording() : startRecording('audio', 'feedback')}
                            className={`${buttonStyles.secondary} flex-1 justify-center cursor-pointer ${isRecording && recordingType === 'audio' ? 'bg-red-100 dark:bg-red-900/30' : ''}`}
                            disabled={isRecording && recordingType !== 'audio' || (feedback.file && feedback.type === 'video')}
                          >
                            {isRecording && recordingType === 'audio' ? (
                              <>
                                <FaStop className="mr-2" />
                                Stop Recording
                              </>
                            ) : (
                              <>
                                <FaMicrophone className="mr-2" />
                                Record Audio
                              </>
                            )}
                          </button>
                          <label className={`${buttonStyles.secondary} flex-1 justify-center cursor-pointer ${feedback.type === 'audio' && feedback.file ? 'bg-green-100 dark:bg-green-900/30' : ''}`}>
                            <FaUpload className="mr-2" />
                            Upload Audio
                            <input
                              type="file"
                              accept="audio/*"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, 'audio', 'feedback')}
                              disabled={isRecording || (feedback.file && feedback.type !== 'audio')}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Video Recording/Upload */}
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => isRecording ? stopRecording() : startRecording('video', 'feedback')}
                            className={`${buttonStyles.secondary} flex-1 justify-center cursor-pointer ${isRecording && recordingType === 'video' ? 'bg-red-100 dark:bg-red-900/30' : ''}`}
                            disabled={isRecording && recordingType !== 'video' || (feedback.file && feedback.type === 'audio')}
                          >
                            {isRecording && recordingType === 'video' ? (
                              <>
                                <FaStop className="mr-2" />
                                Stop Recording
                              </>
                            ) : (
                              <>
                                <FaVideo className="mr-2" />
                                Record Video
                              </>
                            )}
                          </button>
                          <label className={`${buttonStyles.secondary} flex-1 justify-center cursor-pointer ${feedback.type === 'video' && feedback.file ? 'bg-green-100 dark:bg-green-900/30' : ''}`}>
                            <FaUpload className="mr-2" />
                            Upload Video
                            <input
                              type="file"
                              accept="video/*"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, 'video', 'feedback')}
                              disabled={isRecording || (feedback.file && feedback.type !== 'video')}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Preview Section */}
                      {feedback.file && (
                        <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {isUploaded[feedback.type] ? 'Uploaded' : 'Recorded'} {feedback.type}
                            </span>
                            <button
                              onClick={() => clearRecording(feedback.type, 'feedback')}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FaTrash />
                            </button>
                          </div>
                          {feedback.type === 'audio' ? (
                            <audio controls src={previewUrl} className="w-full" />
                          ) : (
                            <video controls src={previewUrl} className="w-full rounded" />
                          )}
                        </div>
                      )}

                      <button
                        onClick={() => handleAddFeedback(assignment._id, submission.student._id)}
                        className={`${buttonStyles.primary} w-full`}
                        disabled={!feedback.content && !feedback.file}
                      >
                        <FaComment className="mr-2" />
                        Add Feedback
                      </button>
                    </div>
                  </div>

                  {/* Previous Feedback Display */}
                  {submission.feedback?.length > 0 && (
                    <div className="mt-4 space-y-4">
                      <h6 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Previous Feedback
                      </h6>
                      {submission.feedback.map((item, index) => (
                        <div key={index} className="pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>{new Date(item.createdAt).toLocaleString()}</span>
                            <span className="capitalize">{item.type}</span>
                          </div>
                          {item.type === 'text' ? (
                            <p className="mt-1 text-gray-700 dark:text-gray-300">{item.content}</p>
                          ) : item.type === 'audio' ? (
                            <audio controls src={item.file} className="mt-2 w-full" />
                          ) : (
                            <video controls src={item.file} className="mt-2 w-full rounded" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
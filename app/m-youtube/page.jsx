'use client';
import { useState, useEffect } from 'react';

export default function EClassPage() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [levels, setLevels] = useState([]);

  // Sample video data - In a real app, this would come from your backend
  const sampleVideos = {
    'Beginner Piano': [
      { id: 1, title: 'Introduction to Piano', videoId: 'dQw4w9WgXcQ', description: 'Learn the basics of piano playing' },
      { id: 2, title: 'Basic Piano Chords', videoId: 'dQw4w9WgXcQ', description: 'Understanding and playing basic chords' },
    ],
    'Intermediate Guitar': [
      { id: 3, title: 'Advanced Strumming Patterns', videoId: 'dQw4w9WgXcQ', description: 'Master different strumming techniques' },
      { id: 4, title: 'Fingerpicking Basics', videoId: 'dQw4w9WgXcQ', description: 'Learn essential fingerpicking patterns' },
    ],
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch('/api/subject');
        if (response.ok) {
          const data = await response.json();
          setSubjects(data.data);
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchLevels = async () => {
      if (!selectedSubject) return;
      try {
        const response = await fetch(`/api/level?subjectId=${selectedSubject._id}`);
        if (response.ok) {
          const data = await response.json();
          setLevels(data.data);
        }
      } catch (error) {
        console.error('Error fetching levels:', error);
      }
    };
    fetchLevels();
  }, [selectedSubject]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#1A1A1A] mb-4">Video Lessons</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Access our comprehensive library of video lessons. Learn at your own pace with our carefully curated content.
          </p>
        </div>

        {/* Subject and Level Selection */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div>
            <label className="block text-sm font-medium text-[#3F51B5] mb-2">Select Subject</label>
            <div className="grid gap-4">
              {subjects.map((subject) => (
                <div
                  key={subject._id}
                  onClick={() => {
                    setSelectedSubject(subject);
                    setSelectedLevel(null);
                  }}
                  className={`cursor-pointer p-4 rounded-lg border transition-all duration-200 ${
                    selectedSubject?._id === subject._id
                      ? 'border-[#3F51B5] bg-[#3F51B5]/5'
                      : 'border-gray-200 bg-white hover:border-[#3F51B5]/50'
                  }`}
                >
                  <h3 className="font-semibold text-[#1A1A1A]">{subject.name}</h3>
                </div>
              ))}
            </div>
          </div>

          {selectedSubject && (
            <div>
              <label className="block text-sm font-medium text-[#009688] mb-2">Select Level</label>
              <div className="grid gap-4">
                {levels.map((level) => (
                  <div
                    key={level._id}
                    onClick={() => setSelectedLevel(level)}
                    className={`cursor-pointer p-4 rounded-lg border transition-all duration-200 ${
                      selectedLevel?._id === level._id
                        ? 'border-[#009688] bg-[#009688]/5'
                        : 'border-gray-200 bg-white hover:border-[#009688]/50'
                    }`}
                  >
                    <h3 className="font-semibold text-[#1A1A1A]">{level.name}</h3>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Video Content */}
        {selectedLevel && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">
                  {selectedSubject.name} - {selectedLevel.name}
                </h2>
                <p className="text-gray-600">Available video lessons for this level</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 p-6">
                {(sampleVideos[selectedLevel.name] || []).map((video) => (
                  <div key={video.id} className="bg-[#F8F9FA] rounded-lg overflow-hidden">
                    <div className="aspect-w-16 aspect-h-9">
                      <iframe
                        src={`https://www.youtube.com/embed/${video.videoId}`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      ></iframe>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-[#1A1A1A] mb-2">{video.title}</h3>
                      <p className="text-sm text-gray-600">{video.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Progress */}
            {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">Your Progress</h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-[#009688] h-2.5 rounded-full" style={{ width: '45%' }}></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">45% complete</p>
            </div> */}
          </div>
        )}
      </div>
    </div>
  );
} 
'use client';
import { useState, useEffect } from 'react';

const LevelsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [levels, setLevels] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    schedule: [{ day: '', startTime: '', endTime: '' }],
    price: {
      individual: 0,
      group: 0
    },
    startDate: '',
    endDate: '',
    duration: 1, // Duration in months
  });

  // Fetch subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch('/api/subject');
        if (response.ok) {
          const data = await response.json();
          setSubjects(data.data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchSubjects();
  }, []);

  // Fetch levels when subject changes
  useEffect(() => {
    const fetchLevels = async () => {
      if (!selectedSubject) return;
      try {
        const response = await fetch(`/api/level?subjectId=${selectedSubject}`);
        if (response.ok) {
          const data = await response.json();
          setLevels(data.data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchLevels();
  }, [selectedSubject]);

  const calculateSessionDates = (startDate, schedule, durationMonths) => {
    const dates = [];
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + durationMonths);

    const start = new Date(startDate);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    while (start <= endDate) {
      schedule.forEach(slot => {
        const dayIndex = days.indexOf(slot.day);
        if (dayIndex === start.getDay()) {
          const sessionDate = new Date(start);
          const [startHours, startMinutes] = slot.startTime.split(':');
          const [endHours, endMinutes] = slot.endTime.split(':');
          
          sessionDate.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);
          
          dates.push({
            date: new Date(sessionDate),
            day: slot.day,
            startTime: slot.startTime,
            endTime: slot.endTime
          });
        }
      });
      
      // Move to next day
      start.setDate(start.getDate() + 1);
    }

    return dates;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = formData._id ? 'PUT' : 'POST';

    // Ensure we have a valid start date
    if (!formData.startDate) {
      formData.startDate = new Date().toISOString().split('T')[0];
    }

    // Ensure we have a valid duration
    if (!formData.duration) {
      formData.duration = 1;
    }

    try {
      const response = await fetch('/api/level', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsModalOpen(false);
        const fetchLevels = async () => {
          const response = await fetch(`/api/level?subjectId=${selectedSubject}`);
          if (response.ok) {
            const data = await response.json();
            setLevels(data.data);
          }
        };
        fetchLevels();
        setFormData({
          name: '',
          description: '',
          subject: '',
          schedule: [{ day: '', startTime: '', endTime: '' }],
          price: {
            individual: 0,
            group: 0
          },
          startDate: new Date().toISOString().split('T')[0],
          duration: 1
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deleteLevel = async (id) => {
    try {
      const response = await fetch(`/api/level?id=${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        const updatedLevels = levels.filter(level => level._id !== id);
        setLevels(updatedLevels);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const addSchedule = () => {
    setFormData({
      ...formData,
      schedule: [...formData.schedule, { day: '', startTime: '', endTime: '' }]
    });
  };

  const removeSchedule = (index) => {
    const newSchedule = formData.schedule.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      schedule: newSchedule
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#F8FAFC] mb-2">Levels</h1>
          <p className="text-[#A78BFA]">Manage course levels for each subject</p>
        </div>
        {selectedSubject && (
          <button
            onClick={() => {
              setFormData({ ...formData, subject: selectedSubject });
              setIsModalOpen(true);
            }}
            className="bg-[#2563EB] text-[#F8FAFC] px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            Add Level
          </button>
        )}
      </div>

      {/* Subject Selection */}
      <div className="bg-[#1E293B] p-6 rounded-lg shadow-xl border border-[#334155]">
        <label className="block text-sm font-medium text-[#A78BFA] mb-2">
          Select Subject
        </label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="w-full rounded-lg border-[#334155] bg-[#0F172A] text-[#F8FAFC] shadow-sm focus:border-[#A78BFA] focus:ring-[#A78BFA] px-4 py-2.5"
        >
          <option value="">Select a subject</option>
          {subjects.map((subject) => (
            <option key={subject._id} value={subject._id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>

      {/* Levels List */}
      {selectedSubject && (
        <div className="bg-[#1E293B] rounded-lg shadow-xl border border-[#334155] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#334155]">
              <thead className="bg-[#1E293B]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#A78BFA] uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#A78BFA] uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#A78BFA] uppercase tracking-wider">
                    Price (Individual)
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#A78BFA] uppercase tracking-wider">
                    Price (Group)
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#A78BFA] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]">
                {levels.map((level) => (
                  <tr key={level._id} className="hover:bg-[#334155] transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-[#F8FAFC] font-medium">
                      {level.name}
                    </td>
                    <td className="px-6 py-4 text-[#F8FAFC]">{level.description}</td>
                    <td className="px-6 py-4 text-[#F8FAFC]">${level.price?.individual}</td>
                    <td className="px-6 py-4 text-[#F8FAFC]">${level.price?.group}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          setFormData(level);
                          setIsModalOpen(true);
                        }}
                        className="text-[#A78BFA] hover:text-[#FFD700] mr-4 transition-colors duration-150 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteLevel(level._id)}
                        className="text-[#F87171] hover:text-red-400 transition-colors duration-150 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-[#1E293B] p-8 rounded-lg w-full max-w-2xl shadow-2xl border border-[#334155]">
            <h2 className="text-2xl font-bold mb-6 text-[#F8FAFC]">
              {formData._id ? 'Update Level' : 'Add Level'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#A78BFA] mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full rounded-lg border-[#334155] bg-[#0F172A] text-[#F8FAFC] shadow-sm focus:border-[#A78BFA] focus:ring-[#A78BFA] px-4 py-2.5"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#A78BFA] mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="block w-full rounded-lg border-[#334155] bg-[#0F172A] text-[#F8FAFC] shadow-sm focus:border-[#A78BFA] focus:ring-[#A78BFA] px-4 py-2.5"
                  required
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#A78BFA] mb-2">
                    Individual Price
                  </label>
                  <input
                    type="number"
                    value={formData.price.individual}
                    onChange={(e) => setFormData({
                      ...formData,
                      price: { ...formData.price, individual: Number(e.target.value) }
                    })}
                    className="block w-full rounded-lg border-[#334155] bg-[#0F172A] text-[#F8FAFC] shadow-sm focus:border-[#A78BFA] focus:ring-[#A78BFA] px-4 py-2.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#A78BFA] mb-2">
                    Group Price
                  </label>
                  <input
                    type="number"
                    value={formData.price.group}
                    onChange={(e) => setFormData({
                      ...formData,
                      price: { ...formData.price, group: Number(e.target.value) }
                    })}
                    className="block w-full rounded-lg border-[#334155] bg-[#0F172A] text-[#F8FAFC] shadow-sm focus:border-[#A78BFA] focus:ring-[#A78BFA] px-4 py-2.5"
                    required
                  />
                </div>
              </div>

              {/* Date Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#A78BFA] mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="block w-full rounded-lg border-[#334155] bg-[#0F172A] text-[#F8FAFC] shadow-sm focus:border-[#A78BFA] focus:ring-[#A78BFA] px-4 py-2.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#A78BFA] mb-2">
                    Duration (Months)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="block w-full rounded-lg border-[#334155] bg-[#0F172A] text-[#F8FAFC] shadow-sm focus:border-[#A78BFA] focus:ring-[#A78BFA] px-4 py-2.5"
                    required
                  />
                </div>
              </div>

              {/* Schedule */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-[#A78BFA]">
                    Schedule
                  </label>
                  <button
                    type="button"
                    onClick={addSchedule}
                    className="text-[#A78BFA] hover:text-[#FFD700] text-sm font-medium"
                  >
                    + Add Time Slot
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.schedule.map((slot, index) => (
                    <div key={index} className="grid grid-cols-4 gap-4 items-center">
                      <select
                        value={slot.day}
                        onChange={(e) => {
                          const newSchedule = [...formData.schedule];
                          newSchedule[index].day = e.target.value;
                          setFormData({ ...formData, schedule: newSchedule });
                        }}
                        className="rounded-lg border-[#334155] bg-[#0F172A] text-[#F8FAFC] shadow-sm focus:border-[#A78BFA] focus:ring-[#A78BFA] px-4 py-2.5"
                        required
                      >
                        <option value="">Select Day</option>
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                      <div className="col-span-2 grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-[#A78BFA] mb-1">
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => {
                              const newSchedule = [...formData.schedule];
                              newSchedule[index].startTime = e.target.value;
                              setFormData({ ...formData, schedule: newSchedule });
                            }}
                            className="w-full rounded-lg border-[#334155] bg-[#0F172A] text-[#F8FAFC] shadow-sm focus:border-[#A78BFA] focus:ring-[#A78BFA] px-4 py-2.5"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#A78BFA] mb-1">
                            End Time
                          </label>
                          <input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => {
                              const newSchedule = [...formData.schedule];
                              newSchedule[index].endTime = e.target.value;
                              setFormData({ ...formData, schedule: newSchedule });
                            }}
                            className="w-full rounded-lg border-[#334155] bg-[#0F172A] text-[#F8FAFC] shadow-sm focus:border-[#A78BFA] focus:ring-[#A78BFA] px-4 py-2.5"
                            required
                          />
                        </div>
                      </div>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeSchedule(index)}
                          className="text-[#F87171] hover:text-red-400 justify-self-end"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                      {index === 0 && <div />} {/* Empty div for grid alignment when no remove button */}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 border border-[#334155] rounded-lg text-[#F8FAFC] hover:bg-[#334155] transition-colors duration-150 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#2563EB] text-[#F8FAFC] rounded-lg hover:bg-blue-700 transition-colors duration-150 font-medium"
                >
                  {formData._id ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LevelsPage;

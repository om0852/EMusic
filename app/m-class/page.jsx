'use client';
import { useState, useEffect } from 'react';

export default function MClassPage() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [levels, setLevels] = useState([]);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [showPaymentStep, setShowPaymentStep] = useState(false);
  const [classType, setClassType] = useState(null); // 'individual' or 'group'
  const [groupMembers, setGroupMembers] = useState([{ email: '', name: '' }]);

  // Subscription durations and their discounts
  const subscriptionPlans = [
    { duration: 1, name: 'Monthly', discount: 0 },
    { duration: 3, name: 'Quarterly', discount: 10 },
    { duration: 6, name: 'Semi-Annual', discount: 15 },
    { duration: 12, name: 'Annual', discount: 25 },
  ];

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

  const calculateDiscountedPrice = (basePrice, discount) => {
    return basePrice - (basePrice * (discount / 100));
  };

  const calculateGroupPrice = (basePrice, duration, discount) => {
    // Group price is now per person directly
    return calculateDiscountedPrice(basePrice * duration, discount);
  };

  const handleEnrollClick = (level) => {
    setSelectedLevel(level);
    setShowSubscriptionModal(true);
    setShowPaymentStep(false);
    setClassType(null);
    setGroupMembers([{ email: '', name: '' }]);
  };

  const handleAddGroupMember = () => {
    setGroupMembers([...groupMembers, { email: '', name: '' }]);
  };

  const handleRemoveGroupMember = (index) => {
    if (groupMembers.length > 1) {
      const newMembers = groupMembers.filter((_, i) => i !== index);
      setGroupMembers(newMembers);
    }
  };

  const handleGroupMemberChange = (index, field, value) => {
    const newMembers = groupMembers.map((member, i) => {
      if (i === index) {
        return { ...member, [field]: value };
      }
      return member;
    });
    setGroupMembers(newMembers);
  };

  const handleContinueToPayment = () => {
    setShowPaymentStep(true);
  };

  const handleBackToPlans = () => {
    setShowPaymentStep(false);
    setClassType(null);
  };

  const handleSubscribe = async () => {
    try {
      const batchData = {
        subject: selectedSubject._id,
        level: selectedLevel._id,
        type: classType,
        students: classType === 'group' ? groupMembers : [{ name: 'Demo User', email: 'demo@example.com' }],
        schedule: selectedLevel.schedule,
        subscriptionPlan: {
          duration: selectedPlan.duration,
          name: selectedPlan.name,
          price: classType === 'individual' 
            ? calculateDiscountedPrice(selectedLevel.price.individual * selectedPlan.duration, selectedPlan.discount)
            : calculateGroupPrice(80, selectedPlan.duration, selectedPlan.discount)
        }
      };

      const response = await fetch('/api/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batchData),
      });

      if (response.ok) {
        // Redirect to My Batches page
        window.location.href = '/my-batches';
      } else {
        console.error('Failed to create batch');
      }
    } catch (error) {
      console.error('Error creating batch:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#1A1A1A] mb-4">Live Music Classes</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join our live interactive music classes with professional instructors. Choose your preferred subject and level to get started.
          </p>
        </div>

        {/* Subject Selection */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {subjects.map((subject) => (
            <div
              key={subject._id}
              onClick={() => setSelectedSubject(subject)}
              className={`cursor-pointer p-6 rounded-xl border transition-all duration-200 ${
                selectedSubject?._id === subject._id
                  ? 'border-[#3F51B5] bg-[#3F51B5]/5'
                  : 'border-gray-200 bg-white hover:border-[#3F51B5]/50'
              }`}
            >
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">{subject.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{subject.description}</p>
              <div className="flex items-center text-sm text-[#3F51B5]">
                <span>View Levels</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Levels and Schedule */}
        {selectedSubject && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">
                Available Levels for {selectedSubject.name}
              </h2>
              <p className="text-gray-600">Select a level to view schedule and enroll</p>
            </div>
            
            <div className="divide-y divide-gray-200">
              {levels.map((level) => (
                <div key={level._id} className="p-6">
                  <div className="md:flex justify-between items-start">
                    <div className="mb-4 md:mb-0">
                      <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">{level.name}</h3>
                      <p className="text-gray-600 mb-4">{level.description}</p>
                      
                      {/* Schedule */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-[#3F51B5]">Available Time Slots:</h4>
                        {level.schedule.map((slot, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2 text-[#009688]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {slot.day} at {slot.time}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Pricing and Enrollment */}
                    <div className="md:ml-8 md:min-w-[200px]">
                      <div className="bg-[#F8F9FA] rounded-lg p-4 space-y-4">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Individual Class</div>
                          <div className="text-2xl font-bold text-[#1A1A1A]">${level.price.individual}/month</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Group Class</div>
                          <div className="text-2xl font-bold text-[#1A1A1A]">${level.price.group}/month</div>
                        </div>
                        <button 
                          onClick={() => handleEnrollClick(level)}
                          className="w-full bg-[#FF5722] text-white py-2 rounded-lg font-medium hover:bg-[#F4511E] transition-colors duration-200"
                        >
                          View Plans & Enroll
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Updated Subscription Modal */}
        {showSubscriptionModal && selectedLevel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-[#1A1A1A]">
                    {showPaymentStep ? 'Choose Payment Option' : 'Choose Your Subscription Plan'}
                  </h2>
                  <button 
                    onClick={() => {
                      setShowSubscriptionModal(false);
                      setShowPaymentStep(false);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {!showPaymentStep ? (
                  // Updated Subscription Plans View
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {subscriptionPlans.map((plan) => {
                      const individualPrice = calculateDiscountedPrice(
                        selectedLevel.price.individual * plan.duration,
                        plan.discount
                      );
                      const groupPrice = calculateGroupPrice(
                        80, // Fixed $80 per person per month
                        plan.duration,
                        plan.discount
                      );

                      return (
                        <div 
                          key={plan.duration}
                          className={`border rounded-lg p-6 cursor-pointer transition-all duration-200 ${
                            selectedPlan === plan
                              ? 'border-[#3F51B5] bg-[#3F51B5]/5'
                              : 'hover:border-[#3F51B5]/50'
                          }`}
                          onClick={() => setSelectedPlan(plan)}
                        >
                          <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">{plan.name}</h3>
                          {plan.discount > 0 && (
                            <div className="bg-[#FF5722] text-white text-sm px-2 py-1 rounded-full inline-block mb-4">
                              Save {plan.discount}%
                            </div>
                          )}
                          
                          <div className="space-y-4">
                            <div>
                              <div className="text-sm text-gray-600">Individual Class</div>
                              <div className="text-2xl font-bold text-[#1A1A1A]">
                                ${individualPrice.toFixed(2)}
                                <span className="text-sm text-gray-600 font-normal">
                                  /{plan.duration} {plan.duration === 1 ? 'month' : 'months'}
                                </span>
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Group Class</div>
                              <div className="text-2xl font-bold text-[#1A1A1A]">
                                ${groupPrice.toFixed(2)}
                                <span className="text-sm text-gray-600 font-normal">
                                  /person/{plan.duration} {plan.duration === 1 ? 'month' : 'months'}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                (minimum 2 students required)
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // Updated Payment Options View
                  <div>
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                      <div
                        className={`border rounded-lg p-6 cursor-pointer transition-all duration-200 ${
                          classType === 'individual'
                            ? 'border-[#3F51B5] bg-[#3F51B5]/5'
                            : 'hover:border-[#3F51B5]/50'
                        }`}
                        onClick={() => setClassType('individual')}
                      >
                        <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">Individual Class</h3>
                        <p className="text-gray-600 mb-4">One-on-one sessions with the instructor</p>
                        <div className="text-2xl font-bold text-[#1A1A1A]">
                          ${calculateDiscountedPrice(
                            selectedLevel.price.individual * selectedPlan.duration,
                            selectedPlan.discount
                          ).toFixed(2)}
                        </div>
                      </div>

                      <div
                        className={`border rounded-lg p-6 cursor-pointer transition-all duration-200 ${
                          classType === 'group'
                            ? 'border-[#3F51B5] bg-[#3F51B5]/5'
                            : 'hover:border-[#3F51B5]/50'
                        }`}
                        onClick={() => setClassType('group')}
                      >
                        <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">Group Class</h3>
                        <p className="text-gray-600 mb-4">Learn together with others (min. 2 students)</p>
                        <div className="text-2xl font-bold text-[#1A1A1A]">
                          ${calculateGroupPrice(
                            80,
                            selectedPlan.duration,
                            selectedPlan.discount
                          ).toFixed(2)}
                          <span className="text-sm text-gray-600 font-normal">/person</span>
                        </div>
                      </div>
                    </div>

                    {/* Updated Group Members Form */}
                    {classType === 'group' && (
                      <div className="border rounded-lg p-6 mb-8">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-[#1A1A1A]">Group Members</h3>
                          <button
                            onClick={handleAddGroupMember}
                            className="text-[#3F51B5] hover:text-[#283593] font-medium flex items-center"
                          >
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Member
                          </button>
                        </div>
                        <div className="space-y-4">
                          {groupMembers.map((member, index) => (
                            <div key={index} className="grid md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  Name
                                </label>
                                <input
                                  type="text"
                                  value={member.name}
                                  onChange={(e) => handleGroupMemberChange(index, 'name', e.target.value)}
                                  className="w-full px-3 py-2 border rounded-lg focus:ring-[#3F51B5] focus:border-[#3F51B5]"
                                  placeholder="Enter name"
                                />
                              </div>
                              <div className="flex gap-4">
                                <div className="flex-1">
                                  <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Email
                                  </label>
                                  <input
                                    type="email"
                                    value={member.email}
                                    onChange={(e) => handleGroupMemberChange(index, 'email', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-[#3F51B5] focus:border-[#3F51B5]"
                                    placeholder="Enter email"
                                  />
                                </div>
                                {index > 0 && (
                                  <button
                                    onClick={() => handleRemoveGroupMember(index)}
                                    className="mt-6 text-red-500 hover:text-red-700"
                                  >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        {groupMembers.length < 2 && (
                          <div className="mt-4 text-amber-600 text-sm">
                            * Minimum 2 students required for group class
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-8 flex justify-end space-x-4">
                  {showPaymentStep ? (
                    <>
                      <button
                        onClick={handleBackToPlans}
                        className="px-6 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors duration-200"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleSubscribe}
                        disabled={!classType || (classType === 'group' && (groupMembers.length < 2 || groupMembers.some(m => !m.email || !m.name)))}
                        className={`px-6 py-2 rounded-lg text-white font-medium transition-colors duration-200 ${
                          classType && !(classType === 'group' && (groupMembers.length < 2 || groupMembers.some(m => !m.email || !m.name)))
                            ? 'bg-[#FF5722] hover:bg-[#F4511E]'
                            : 'bg-gray-300 cursor-not-allowed'
                        }`}
                      >
                        Proceed to Payment
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setShowSubscriptionModal(false)}
                        className="px-6 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleContinueToPayment}
                        disabled={!selectedPlan}
                        className={`px-6 py-2 rounded-lg text-white font-medium transition-colors duration-200 ${
                          selectedPlan
                            ? 'bg-[#FF5722] hover:bg-[#F4511E]'
                            : 'bg-gray-300 cursor-not-allowed'
                        }`}
                      >
                        Continue
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
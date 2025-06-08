'use client';
import { useState, useEffect } from 'react';
import Script from 'next/script';

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
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Subscription durations and their discounts
  const subscriptionPlans = [
    { duration: 1, name: 'Monthly', discount: 0 },
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

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (userData) => {
    try {
      setIsProcessingPayment(true);

      // Calculate total amount based on class type and plan
      const basePrice = classType === 'individual' 
        ? selectedLevel.price.individual 
        : selectedLevel.price.group * groupMembers.length;
      
      const amount = calculateDiscountedPrice(
        basePrice * selectedPlan.duration,
        selectedPlan.discount
      );

      //console.log('Initiating payment for amount:', amount);

      // Create order
      const orderResponse = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency: 'INR',
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(`Failed to create order: ${orderData.error || orderData.details || 'Unknown error'}`);
      }

      //console.log('Order created successfully:', orderData);

      // Load Razorpay SDK
      const res = await loadRazorpay();
      if (!res) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      // Verify Razorpay key exists
      if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
        throw new Error('Razorpay public key is not configured');
      }

      // Configure Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Musicoul',
        description: `${selectedLevel.name} - ${classType} Class`,
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            //console.log('Payment successful:', response);

            // Create batch after successful payment
            const batchData = {
              subject: selectedSubject._id,
              level: selectedLevel._id,
              type: classType,
              students: classType === 'group' 
                ? groupMembers.map(member => ({
                    email: member.email,
                    name: member.name
                  }))
                : [{
                    userId: userData.user._id,
                    email: userData.user.email
                  }],
              schedule: selectedLevel.schedule,
              subscription: selectedPlan.name,
              price: amount,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
            };

            //console.log('Creating batch with data:', batchData);

            const batchResponse = await fetch('/api/batch', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(batchData),
              credentials: 'include'
            });

            if (batchResponse.ok) {
              window.location.href = '/my-batches';
            } else {
              const errorData = await batchResponse.json();
              throw new Error(`Failed to create batch: ${errorData.error || 'Unknown error'}`);
            }
          } catch (error) {
            console.error('Error after payment:', error);
            alert(`Payment successful but failed to create batch: ${error.message}. Please contact support.`);
          }
        },
        modal: {
          ondismiss: function() {
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: userData.user.name || '',
          email: userData.user.email || '',
          contact: userData.user.phone || ''
        },
        theme: {
          color: '#800080',
        },
      };

      //console.log('Initializing Razorpay with options:', { ...options, key: '***' });

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      setIsProcessingPayment(false);

    } catch (error) {
      console.error('Payment error:', error);
      alert(`Payment failed: ${error.message}`);
      setIsProcessingPayment(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      // First check if user is authenticated
      const authResponse = await fetch('/api/auth/check', {
        credentials: 'include'
      });
      
      if (!authResponse.ok) {
        window.location.href = '/login';
        return;
      }

      const userData = await authResponse.json();
      
      // Proceed with payment
      await handlePayment(userData);
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-20">
            <div className="inline-block">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                Live Music Classes
              </h1>
              <div className="h-1 w-24 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full"></div>
            </div>
            <p className="text-gray-300 max-w-2xl mx-auto text-lg mt-6">
              Join our live interactive music classes with professional instructors. Choose your preferred subject and level to get started.
            </p>
          </div>

          {/* Subject Selection */}
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {subjects.map((subject) => (
              <div
                key={subject._id}
                onClick={() => setSelectedSubject(subject)}
                className={`cursor-pointer p-8 rounded-lg transition-all duration-300 ${
                  selectedSubject?._id === subject._id
                    ? 'bg-gradient-to-br from-purple-900/80 to-pink-900/80 ring-2 ring-pink-500 shadow-lg text-white'
                    : 'bg-gray-800 hover:shadow-lg hover:ring-2 hover:ring-pink-400 shadow-md text-gray-200 hover:bg-gray-700/80'
                }`}
              >
                <h3 className="text-2xl font-semibold text-white mb-3">{subject.name}</h3>
                <p className="text-gray-300 mb-4">{subject.description}</p>
                <div className={`flex items-center text-sm font-medium ${
                  selectedSubject?._id === subject._id ? 'text-pink-400' : 'text-gray-400'
                }`}>
                  <span>View Levels</span>
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>

          {/* Levels and Schedule */}
          {selectedSubject && (
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700">
              <div className="p-8 border-b border-gray-700 bg-gradient-to-r from-purple-900/40 to-pink-900/40">
                <h2 className="text-3xl font-semibold text-white mb-2">
                  Available Levels for {selectedSubject.name}
                </h2>
                <p className="text-gray-300">Select a level to view schedule and enroll</p>
              </div>
              
              <div className="divide-y divide-gray-100">
                {levels.map((level) => (
                  <div key={level._id} className="p-8 hover:bg-gray-800/50 transition-colors duration-200 border-b border-gray-700 last:border-b-0">
                    <div className="md:flex justify-between items-start">
                      <div className="mb-6 md:mb-0 md:flex-1">
                        <h3 className="text-2xl font-semibold text-white mb-3">{level.name}</h3>
                        <p className="text-gray-300 mb-6">{level.description}</p>
                        
                        {/* Schedule */}
                        <div className="space-y-3">
                          <h4 className="text-lg font-medium text-white mb-4">Available Time Slots</h4>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {level.schedule.map((slot, index) => (
                              <div key={index} className="flex items-center text-base text-gray-200 bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-pink-500/50 transition-colors">
                                <svg className="w-5 h-5 mr-3 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {slot.day} at {slot.time}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Pricing and Enrollment */}
                      <div className="md:ml-8 md:w-[320px]">
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg border border-gray-700 p-6 space-y-6">
                          <div>
                            <div className="text-lg font-medium text-gray-300 mb-2">Individual Class</div>
                            <div className="text-3xl font-bold text-white">
                              ₹{level.price.individual}
                              <span className="text-base font-normal text-gray-400">/month</span>
                            </div>
                          </div>
                          <div className="pt-4 border-t border-gray-700">
                            <div className="text-lg font-medium text-gray-300 mb-2">Group Class</div>
                            <div className="text-3xl font-bold text-white">
                              ₹{level.price.group}
                              <span className="text-base font-normal text-gray-400">/month</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleEnrollClick(level)}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-lg hover:shadow-pink-500/20"
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

          {/* Subscription Modal */}
          {showSubscriptionModal && selectedLevel && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-purple-900/40 to-pink-900/40">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-white">
                      {showPaymentStep ? 'Choose Payment Option' : 'Choose Your Subscription Plan'}
                    </h2>
                    <button 
                      onClick={() => {
                        setShowSubscriptionModal(false);
                        setShowPaymentStep(false);
                      }}
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  {!showPaymentStep ? (
                    <div className="space-y-6 max-w-3xl mx-auto">
                      {subscriptionPlans.map((plan) => {
                        const individualPrice = calculateDiscountedPrice(
                          selectedLevel.price.individual * plan.duration,
                          plan.discount
                        );
                        const groupPrice = calculateGroupPrice(
                          selectedLevel.price.group,
                          plan.duration,
                          plan.discount
                        );

                        return (
                          <div 
                            key={plan.duration}
                            className={`border rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                              selectedPlan === plan
                                ? 'border-pink-500 bg-gradient-to-br from-purple-900/30 to-pink-900/30 shadow-lg shadow-pink-500/10'
                                : 'border-gray-700 hover:border-pink-500/50 hover:shadow-md bg-gray-800/50 hover:bg-gray-700/50'
                            }`}
                            onClick={() => setSelectedPlan(plan)}
                          >
                            <div className="flex justify-between items-start mb-6">
                              <div>
                                <h3 className="text-2xl font-semibold text-white mb-2">{plan.name} Plan</h3>
                                <p className="text-gray-300">Choose your preferred class type</p>
                              </div>
                              {plan.discount > 0 && (
                                <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-md">
                                  Save {plan.discount}%
                                </div>
                              )}
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-6">
                              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 shadow-sm hover:border-pink-500/50 transition-colors">
                                <div className="text-lg font-medium text-gray-300 mb-4">Individual Class</div>
                                <div className="text-3xl font-bold text-white mb-3">
                                  ₹{individualPrice}
                                  <span className="text-base font-normal text-gray-400">/month</span>
                                </div>
                                <p className="text-gray-400">One-on-one personalized sessions</p>
                              </div>
                              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 shadow-sm hover:border-pink-500/50 transition-colors">
                                <div className="text-lg font-medium text-gray-300 mb-4">Group Class</div>
                                <div className="text-3xl font-bold text-white mb-3">
                                  ₹{groupPrice}
                                  <span className="text-base font-normal text-gray-400">/person/month</span>
                                </div>
                                <p className="text-gray-400">Learn with peers (min. 2 students)</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div>
                      <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div
                          className={`border rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                            classType === 'individual'
                              ? 'border-pink-500 bg-gradient-to-br from-purple-900/30 to-pink-900/30 shadow-lg shadow-pink-500/10'
                              : 'border-gray-700 hover:border-pink-500/50 hover:shadow-md bg-gray-800/50 hover:bg-gray-700/50'
                          }`}
                          onClick={() => setClassType('individual')}
                        >
                          <h3 className="text-2xl font-semibold text-white mb-3">Individual Class</h3>
                          <p className="text-gray-300 mb-6">One-on-one sessions with the instructor</p>
                          <div className="text-3xl font-bold text-white">
                            ₹{calculateDiscountedPrice(
                              selectedLevel.price.individual * selectedPlan.duration,
                              selectedPlan.discount
                            )}
                            <span className="text-base font-normal text-gray-400">/month</span>
                          </div>
                        </div>

                        <div
                          className={`border rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                            classType === 'group'
                              ? 'border-pink-500 bg-gradient-to-br from-purple-900/30 to-pink-900/30 shadow-lg shadow-pink-500/10'
                              : 'border-gray-700 hover:border-pink-500/50 hover:shadow-md bg-gray-800/50 hover:bg-gray-700/50'
                          }`}
                          onClick={() => setClassType('group')}
                        >
                          <h3 className="text-2xl font-semibold text-white mb-3">Group Class</h3>
                          <p className="text-gray-300 mb-6">Learn together with others (min. 2 students)</p>
                          <div className="text-3xl font-bold text-white">
                            ₹{calculateGroupPrice(
                              selectedLevel.price.group,
                              selectedPlan.duration,
                              selectedPlan.discount
                            )}
                            <span className="text-base font-normal text-gray-400">/person/month</span>
                          </div>
                        </div>
                      </div>

                      {/* Group Members Form */}
                      {classType === 'group' && (
                        <div className="border rounded-xl p-6 mb-8 bg-gray-800/50 shadow-sm">
                          <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-white">Student Details</h3>
                          
                          </div>
                          <div className="space-y-4">
                            {groupMembers.map((member, index) => (
                              <div key={index} className="grid md:grid-cols-2 gap-4 p-4 bg-gray-700 rounded-lg">
                                <div>
                                  <label className="block text-sm font-medium text-gray-200 mb-1">
                                    Name
                                  </label>
                                  <input
                                    type="text"
                                    value={member.name}
                                    onChange={(e) => handleGroupMemberChange(index, 'name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-200"
                                    placeholder="Enter name"
                                  />
                                </div>
                                <div className="flex gap-4">
                                  <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-200 mb-1">
                                      Email
                                    </label>
                                    <input
                                      type="email"
                                      value={member.email}
                                      onChange={(e) => handleGroupMemberChange(index, 'email', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-200"
                                      placeholder="Enter email"
                                    />
                                  </div>
                                  {index > 0 && (
                                    <button
                                      onClick={() => handleRemoveGroupMember(index)}
                                      className="mt-6 text-red-500 hover:text-red-600 transition-colors"
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
                          
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-8 flex justify-end space-x-4">
                    {showPaymentStep ? (
                      <>
                        <button
                          onClick={handleBackToPlans}
                          className="px-6 py-2 border border-gray-600 rounded-lg text-gray-200 hover:bg-gray-700/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-pink-500"
                        >
                          Back
                        </button>
                        <button
                          onClick={handleSubscribe}
                          disabled={!classType || isProcessingPayment || (classType === 'group' && ( groupMembers.some(m => !m.email || !m.name)))}
                          className={`px-6 py-2 rounded-lg text-white font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-pink-500 ${
                            classType && !isProcessingPayment && !(classType === 'group' && ( groupMembers.some(m => !m.email || !m.name)))
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-pink-500/30'
                              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {isProcessingPayment ? 'Processing...' : 'Proceed to Payment'}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setShowSubscriptionModal(false)}
                          className="px-6 py-2 border border-gray-600 rounded-lg text-gray-200 hover:bg-gray-700/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-pink-500"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleContinueToPayment}
                          disabled={!selectedPlan}
                          className={`px-6 py-2 rounded-lg text-white font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-pink-500 ${
                            selectedPlan
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-pink-500/30'
                              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
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
    </>
  );
} 
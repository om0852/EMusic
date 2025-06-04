"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#3F51B5] to-[#009688] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-[#1A1A1A] mb-6">
              Welcome to eMusic Learning
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Choose your preferred learning path and start your musical journey
              today
            </p>

            {/* Class Options */}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* M-Class Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
              >
                <div className="p-8">
                  <div className="w-16 h-16 bg-[#3F51B5] rounded-full flex items-center justify-center mb-6 mx-auto">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                    M-Class
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Live interactive music classes with professional
                    instructors. Real-time feedback and personalized attention.
                  </p>
                  <ul className="text-gray-600 mb-8 space-y-2">
                    <li className="flex items-center">
                      <svg
                        className="w-5 h-5 text-[#3F51B5] mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Live Online Sessions
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="w-5 h-5 text-[#3F51B5] mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Interactive Learning
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="w-5 h-5 text-[#3F51B5] mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Flexible Schedule
                    </li>
                  </ul>
                  <Link
                    href="/m-class"
                    className="block w-full bg-[#FF5722] text-white text-center py-3 rounded-lg font-semibold hover:bg-[#F4511E] transition-colors duration-200"
                  >
                    Explore M-Class
                  </Link>
                </div>
              </motion.div>

              {/* E-Class Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
              >
                <div className="p-8">
                  <div className="w-16 h-16 bg-[#009688] rounded-full flex items-center justify-center mb-6 mx-auto">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                    E-Class
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Access our curated collection of video lessons. Learn at
                    your own pace with structured content.
                  </p>
                  <ul className="text-gray-600 mb-8 space-y-2">
                    <li className="flex items-center">
                      <svg
                        className="w-5 h-5 text-[#009688] mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Video Tutorials
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="w-5 h-5 text-[#009688] mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Self-Paced Learning
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="w-5 h-5 text-[#009688] mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Lifetime Access
                    </li>
                  </ul>
                  <Link
                    href="/e-class"
                    className="block w-full bg-[#FF5722] text-white text-center py-3 rounded-lg font-semibold hover:bg-[#F4511E] transition-colors duration-200"
                  >
                    Explore E-Class
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#1A1A1A] mb-4">
            Why Choose eMusic Learning?
          </h2>
          <p className="text-gray-600">
            Experience the best of both worlds with our comprehensive learning
            options
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="text-center">
            <div className="w-12 h-12 bg-[#3F51B5] rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">
              Flexible Learning
            </h3>
            <p className="text-gray-600">
              Choose between live classes or self-paced video lessons
            </p>
          </div>

          {/* Feature 2 */}
          <div className="text-center">
            <div className="w-12 h-12 bg-[#009688] rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">
              Expert Instructors
            </h3>
            <p className="text-gray-600">
              Learn from professional musicians and certified teachers
            </p>
          </div>

          {/* Feature 3 */}
          <div className="text-center">
            <div className="w-12 h-12 bg-[#FF5722] rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">
              Quality Content
            </h3>
            <p className="text-gray-600">
              Structured curriculum and high-quality learning materials
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Raleway, Playfair_Display } from 'next/font/google';
import Typewriter from 'typewriter-effect';

const raleway = Raleway({ subsets: ['latin'], variable: '--font-raleway' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export default function Home() {
  return (
    <div className={`min-h-screen bg-black ${raleway.variable} font-sans`}>
      {/* Font Preload */}
      <style jsx global>{`
        :root {
          --font-raleway: ${raleway.style.fontFamily};
          --font-playfair: ${playfair.style.fontFamily};
        }
      `}</style>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900 to-red-900"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center relative z-10 pt-10 ">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`text-4xl md:text-6xl font-bold text-white mb-6 ${playfair.variable} font-serif`}
            >
              Welcome to Musicoul Learning
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-2xl md:text-3xl font-bold text-yellow-400 mb-6 h-12"
            >
              <div className="text-3xl md:text-6xl font-bold mb-2">
                <span className="text-white">Unleash your inner </span>
                <Typewriter
                  options={{
                    strings: ['Musician', 'Artist','Singer','Dancer','Harmonist','Tabla Player','Percussionist','Pianist'],
                    autoStart: true,
                    loop: true,
                    wrapperClassName: 'inline-block bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 bg-clip-text text-transparent',
                    cursorClassName: 'text-pink-400',
                  }}
                />
              </div>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-xl text-gray-300 mt-30 mb-12 max-w-2xl mx-auto"
            >
              Choose your preferred learning path and start your musical journey today
            </motion.p>

            {/* Class Options */}
            <div className="grid md:grid-cols-2  gap-8 max-w-4xl mx-auto">
              {/* m-premium Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ scale: 1.02, boxShadow: '0 10px 30px -5px rgba(255, 215, 0, 0.2)' }}
                className="relative bg-gradient-to-br from-black to-gray-900 rounded-2xl overflow-hidden border border-yellow-600/30"
              >
                {/* Premium badge */}
                <div className="absolute top-4 right-4 bg-yellow-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                  PREMIUM
                </div>

                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/5 to-transparent"></div>

                <div className="p-8 relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-600 to-yellow-400 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg ring-4 ring-yellow-500/20">
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

                  <div className="text-center mb-6">
                    <h2 className={`text-3xl font-bold text-white mb-2 ${playfair.variable} font-serif`}>
                      M-Premium
                    </h2>
                    <div className="w-16 h-1 bg-gradient-to-r from-yellow-600 to-yellow-400 mx-auto mb-4"></div>
                  </div>

                  <p className="text-gray-300 text-center mb-8 leading-relaxed">
                    Experience the ultimate in music education with our premium live classes, featuring world-class instructors and personalized attention.
                  </p>

                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white font-medium">Live 1:1 Sessions</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white font-medium">Personalized Feedback</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white font-medium">Flexible Scheduling</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white font-medium">Progress Tracking</span>
                    </li>
                  </ul>

                  <Link
                    href="/m-premium"
                    className="block w-full bg-gradient-to-r from-yellow-600 to-yellow-700 text-white text-center py-3.5 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-yellow-500/20 border border-yellow-500/30"
                  >
                    Start Premium Journey
                  </Link>
                </div>
              </motion.div>
              {/* E-Class Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="bg-black/80 rounded-xl p-6 backdrop-blur-sm border border-white/10"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mb-4 mx-auto">
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
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white text-center mb-3">M-Free</h2>
                <p className="text-gray-300 text-center mb-6">
                  Access our curated collection of video lessons and learn at your own pace.
                </p>
                <ul className="space-y-2 mb-6 h-[20%] md:h-[45%]">
                  <li className="flex items-center text-gray-300">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                    Video Tutorials
                  </li>
                  <li className="flex items-center text-gray-300">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                    Self-Paced Learning
                  </li>
                  <li className="flex items-center text-gray-300">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                    Lifetime Access
                  </li>
                </ul>
                <Link
                  href="/m-free"
                  className="block w-full  bg-gradient-to-r from-red-600 to-red-800 text-white text-center py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Explore M-Free
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={`text-4xl font-bold text-white mb-4 ${playfair.variable} font-serif`}
          >
            Why Choose Musicoul Learning?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-xl text-gray-300"
          >
            Experience the best of both worlds with our comprehensive learning options
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-pink-600 to-purple-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg">
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
            <h3 className={`text-xl font-semibold text-white mb-3 ${playfair.variable} font-serif`}>
              Flexible Learning
            </h3>
            <p className="text-gray-300">
              Choose between live classes or self-paced video lessons
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-red-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg">
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
            <h3 className={`text-xl font-semibold text-white mb-3 ${playfair.variable} font-serif`}>
              Expert Instructors
            </h3>
            <p className="text-gray-300">
              Learn from professional musicians and certified teachers
            </p>

          </motion.div>

          {/* Feature 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-pink-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg">
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
            <h3 className={`text-xl font-semibold text-white mb-3 ${playfair.variable} font-serif`}>
              Quality Content
            </h3>
            <p className="text-gray-300">
              Structured curriculum and high-quality learning materials
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

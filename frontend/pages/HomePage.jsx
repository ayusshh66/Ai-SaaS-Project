import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, BookOpen, Code2 } from 'lucide-react';
import { FaGithub, FaTwitter } from 'react-icons/fa';
import Navbar from '../components/Navbar';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <motion.section 
        initial="hidden" animate="visible" variants={fadeInUp}
        className="max-w-6xl mx-auto px-4 py-20 text-center"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
          <span className="text-orange-600">eMOM</span>: AI-Powered Kitchen Intelligence
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Streamlining your kitchen inventory, recipe generation, and meal planning with intelligent, data-driven automation.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/dashboard">
            <button className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform">Launch App</button>
          </Link>
          <a href="https://github.com/ayusshh66/Ai-SaaS-Project" target="_blank" rel="noopener noreferrer">
            <button className="border border-orange-200 px-8 py-3 rounded-xl font-bold hover:bg-orange-50 transition">View Source</button>
          </a>
        </div>
      </motion.section>

      <motion.section 
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
        className="bg-white py-20 border-t border-orange-100"
      >
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Meet the Developer</h2>
          <div className="bg-orange-50 rounded-3xl p-8 md:p-12 border border-orange-100">
            <h3 className="text-2xl font-bold mb-4">Hi, I'm Ayush</h3>
            <p className="text-gray-700 mb-6 leading-relaxed">
              I am a first-year B.Tech Computer Science student at <strong>Indraprastha University (GGSIPU)</strong>, 
              specializing in <strong>Data Science</strong>. As a developer graduating in 2029 based in Delhi, 
              I am passionate about building full-stack applications that solve real-world problems.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100">
                <Code2 className="text-orange-600 mb-3" />
                <h4 className="font-bold mb-2">Tech Proficiency</h4>
                <p className="text-sm text-gray-600">React, Tailwind CSS, Node.js, Express, and PostgreSQL.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100">
                <BookOpen className="text-orange-600 mb-3" />
                <h4 className="font-bold mb-2">Academic Path</h4>
                <p className="text-sm text-gray-600">B.Tech CS (Data Science) @ GGSIPU | Class of 2029</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <footer className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row justify-between items-center text-gray-500">
        <p>© 2026 eMOM by Ayush</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="https://github.com/ayusshh66" target="_blank" rel="noopener noreferrer"><FaGithub className="w-6 h-6 hover:text-orange-600 cursor-pointer transition-colors" /></a>
          <a href="https://x.com/AyushDevlps" target="_blank" rel="noopener noreferrer"><FaTwitter className="w-6 h-6 hover:text-orange-600 cursor-pointer transition-colors" /></a>
          <a href="mailto:adonisjefrey66@gmail.com"><Mail className="w-6 h-6 hover:text-orange-600 cursor-pointer transition-colors" /></a>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
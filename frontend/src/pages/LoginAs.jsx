import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (role) => {
    setShowLoginModal(false);
    switch (role) {
      case 'admin':
        navigate('/admin-login');
        break;
      case 'doctor':
        navigate('/doctor-login');
        break;
      case 'patient':
        navigate('/patient-login');
        break;
      default:
        break;
    }
  };

  return (
    <div className="bg-white text-black scroll-smooth relative font-sans">
      {/* Header / Navigation */}
      <header className="max-w-7xl mx-auto px-6 sm:px-10 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-700">Medico</h1>
        <nav>
          <ul className="flex space-x-8 text-base font-medium">
            {['Home', 'Services', 'About', 'Contact'].map((link) => (
              <li key={link}>
                <a
                  href={`#${link.toLowerCase()}`}
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-300 hover:underline"
                >
                  {link}
                </a>
              </li>
            ))}
            <li>
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition"
              >
                Login
              </button>
            </li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="bg-gradient-to-br from-blue-50 to-white py-20" id="home">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 flex flex-col-reverse md:flex-row items-center justify-between gap-12">
          {/* Text Section */}
          <section className="md:w-1/2 text-center md:text-left">
            <h1 className="text-5xl font-extrabold leading-tight text-blue-700 mb-6">
              Doctor<br />Appointments System
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Welcome to SRM Hospitals – your digital gateway to modern healthcare. Book, cancel, and explore AI-driven health predictions in just a few clicks.
            </p>
            <button
              onClick={() => handleLogin('patient')}
              className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-lg font-semibold rounded-full px-8 py-3 shadow-xl hover:scale-105 transition duration-300"
            >
              Book Appointment
            </button>
          </section>

          {/* Image Section */}
          <section className="md:w-1/2">
            <img
              alt="Doctor with stethoscope"
              className="rounded-xl w-full shadow-2xl object-cover"
              src="https://storage.googleapis.com/a1aa/image/69cdc7f9-c2e6-458e-d3e7-3395cf6d333b.jpg"
              width="600"
              height="400"
            />
          </section>
        </div>
      </main>

      {/* Services Section */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 py-20" id="services">
        <h2 className="text-4xl font-bold text-blue-600 mb-10 text-center">Our Services</h2>
        <div className="grid md:grid-cols-3 gap-10 text-gray-700">
          {[
            {
              title: '📅 Book Appointments',
              desc: 'Schedule visits with preferred doctors at your convenience without waiting in queues.'
            },
            {
              title: '❌ Cancel Anytime',
              desc: 'Can’t make it? Cancel your appointments quickly without any hassle.'
            },
            {
              title: '🧠 AI Symptom Predictor',
              desc: 'Use our smart AI to analyze symptoms and get doctor recommendations in seconds.'
            },
          ].map((service, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all border border-blue-100 hover:border-blue-300">
              <h3 className="text-xl font-semibold mb-2 text-blue-700">{service.title}</h3>
              <p>{service.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 py-20 bg-gray-50 rounded-xl shadow-inner" id="about">
        <h2 className="text-4xl font-bold text-blue-600 mb-6 text-center">About Us</h2>
        <p className="text-lg text-gray-700 leading-relaxed max-w-4xl mx-auto text-center">
          SRM Hospitals is a leader in modern healthcare, backed by expert professionals and state-of-the-art facilities.
          Our mission is to bridge the gap between patients and care by making healthcare smarter and more accessible.
          <br /><br />
          With our online appointment system, we bring efficiency, convenience, and innovation to your fingertips.
        </p>
      </section>

      {/* Contact Section */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 py-20" id="contact">
        <h2 className="text-4xl font-bold text-blue-600 mb-6 text-center">Contact Information</h2>
        <div className="text-lg text-gray-700 text-center">
          <p className="mb-2">👨‍💻 <strong>Team Members</strong></p>
          <ul className="mb-4 space-y-1">
            <li>A. Sudheesh (AP22110011083)</li>
            <li>Kaja Jaya Sankar Saketh (AP22110011083)</li>
            <li>K. Saritha (AP22110011110)</li>
            <li>N. Janani (AP22110011102)</li>
          </ul>
          <p className="text-sm text-gray-500 mt-6 italic">
            This system is developed as part of an academic project at SRM Institute of Science and Technology.
          </p>
        </div>
      </section>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-sm text-center relative animate-fade-in scale-100 transition-transform duration-300">
            <h1 className="text-blue-600 text-3xl font-extrabold mb-1 tracking-wide">Medico</h1>
            <p className="text-xl font-semibold mb-2 text-gray-800">Welcome to Medico</p>
            <p className="text-gray-500 mb-6">Your trusted healthcare partner</p>

            <button
              onClick={() => handleLogin('admin')}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 rounded-xl text-lg font-semibold mb-4 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              🛡️ Admin Login
            </button>
            <button
              onClick={() => handleLogin('doctor')}
              className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white py-3 rounded-xl text-lg font-semibold mb-4 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              👨‍⚕️ Doctor Login
            </button>
            <button
              onClick={() => handleLogin('patient')}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-700 text-white py-3 rounded-xl text-lg font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              🧑‍💼 Patient Login
            </button>

            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;

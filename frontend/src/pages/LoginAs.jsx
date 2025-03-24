import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginAs = () => {
  const navigate = useNavigate();

  const handleSelection = (role) => {
    switch(role) {
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
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{
        backgroundImage: "url('/api/placeholder/1920/1080')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 relative">
        {/* Logo */}
        <div className="absolute -top-12 left-4">
          <div className="flex items-center gap-2">
            <img 
              src="/api/placeholder/40/40" 
              alt="Medico Logo" 
              className="w-10 h-10"
            />
            <span className="text-2xl font-bold text-blue-600">Medico</span>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="mt-4">
          <h2 className="text-xl font-semibold text-center mb-8">Login As</h2>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6">
            <button 
              onClick={() => handleSelection('admin')}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Admin
            </button>
            
            <button 
              onClick={() => handleSelection('doctor')}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Doctor
            </button>
            
            <button 
              onClick={() => handleSelection('patient')}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Patient
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginAs;
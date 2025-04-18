import React, { useEffect, useState } from 'react';
import { Home, User, LogOut, Trash2, Calendar, Clock } from 'lucide-react';

const DoctorDashboard = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState('');
  const [newSlot, setNewSlot] = useState({ start: '', end: '' });
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDoctorData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/doctor-login";
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/doctors/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setDoctor(data);
      } catch (err) {
        console.error("🔴 Error fetching doctor data:", err.message);

        if (err.message.includes('401')) {
          console.warn("⚠️ Unauthorized! Redirecting to login...");
          localStorage.removeItem("token");
          window.location.href = "/doctor-login";
        } else {
          setError("Failed to load doctor data. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, []);

  // Fetch appointments when date is selected
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!selectedDate || !doctor) return;
      
      const token = localStorage.getItem("token");
      const doctorId = localStorage.getItem('doctorId'); // Or wherever you're storing it
      
      if (!token) return;
      
      try {
        setAppointmentsLoading(true);
        
        // Simpler URL structure without encoding the doctor name
        const response = await fetch(`http://localhost:5000/api/doctors/appointments?date=${selectedDate}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,  // token from login
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setAppointments(data);
      } catch (err) {
        console.error("Error fetching appointments:", err.message);
        setAppointments([]);
      } finally {
        setAppointmentsLoading(false);
      }
    };

    fetchAppointments();
  }, [selectedDate, doctor]);

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getSlotsForSelectedDate = () => {
    if (!doctor?.time_slots) return [];
    const dateSlots = doctor.time_slots.find((ts) => ts.date === selectedDate);
    return dateSlots?.slots || [];
  };

  const handleAddSlot = async () => {
    const token = localStorage.getItem('token');
    if (!token) return console.error('No token found');
  
    if (!selectedDate || !newSlot.start || !newSlot.end) {
      return alert('Please select a date and enter both start and end times.');
    }
  
    const slotTime = `${newSlot.start} - ${newSlot.end}`;
    
    try {
      const response = await fetch('http://localhost:5000/api/doctors/add-timeslot', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          date: selectedDate, 
          slots: [{ time: slotTime, status: 'free' }]  // Now sending objects with time and status
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add slot');
      }
  
      // Update doctor state with new data
      setDoctor(prev => {
        const updatedTimeSlots = [...(prev.time_slots || [])];
        const existingSlotIndex = updatedTimeSlots.findIndex(ts => ts.date === selectedDate);
        
        if (existingSlotIndex >= 0) {
          // Update existing date entry
          updatedTimeSlots[existingSlotIndex] = {
            ...updatedTimeSlots[existingSlotIndex],
            slots: [...updatedTimeSlots[existingSlotIndex].slots, { time: slotTime, status: 'free' }]
          };
        } else {
          // Add new date entry
          updatedTimeSlots.push({
            date: selectedDate,
            slots: [{ time: slotTime, status: 'free' }]
          });
        }
        
        return {
          ...prev,
          time_slots: updatedTimeSlots
        };
      });
      
      // Reset form
      setNewSlot({ start: '', end: '' });
      alert('Slot added successfully!');
    } catch (error) {
      console.error('Error adding time slot:', error.message);
      alert(error.message || 'Something went wrong');
    }
  };

  const handleDeleteSlot = async (slotTime) => {
    const token = localStorage.getItem('token');
    if (!token) return console.error('No token found');
    
    try {
      const response = await fetch('http://localhost:5000/api/doctors/delete-slot', {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ date: selectedDate, slotTime: slotTime })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete slot');
      }
      
      // Update local state
      setDoctor(prev => {
        const updatedTimeSlots = [...(prev.time_slots || [])];
        const dateIndex = updatedTimeSlots.findIndex(ts => ts.date === selectedDate);
        
        if (dateIndex >= 0) {
          // Remove the specific slot by matching time property
          updatedTimeSlots[dateIndex].slots = updatedTimeSlots[dateIndex].slots
            .filter(slot => slot.time !== slotTime);
            
          // If no slots left, remove the date entry
          if (updatedTimeSlots[dateIndex].slots.length === 0) {
            updatedTimeSlots.splice(dateIndex, 1);
          }
        }
        
        return {
          ...prev,
          time_slots: updatedTimeSlots
        };
      });
      
      alert('Slot deleted successfully!');
    } catch (error) {
      console.error('Error deleting slot:', error.message);
      alert(error.message || 'Failed to delete slot');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/doctor-login';
  };

  // Check if a date has appointments
  const hasAppointmentsOnDate = (dateStr) => {
    if (!doctor) return false;
    
    // This is a placeholder - in a real app, you'd check from a pre-fetched list of dates with appointments
    // For now, we'll just check if the date matches the selected date with appointments
    return selectedDate === dateStr && appointments.length > 0;
  };

  // Format the appointment date for display
  const formatAppointmentDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return dateString;
    }
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const days = getDaysInMonth(year, month);

    return (
      <div className="grid grid-cols-7 gap-2 mt-4">
        {[...Array(days)].map((_, i) => {
          const date = new Date(year, month, i + 1);
          const formatted = formatDate(date);
          const isSlotDay = doctor?.time_slots?.some((ts) => ts.date === formatted);
          const isToday = formatDate(new Date()) === formatted;
          const hasAppointments = hasAppointmentsOnDate(formatted);

          return (
            <button
              key={i}
              onClick={() => setSelectedDate(formatted)}
              className={`p-2 rounded border text-center relative ${
                selectedDate === formatted
                  ? 'bg-blue-500 text-white'
                  : isSlotDay
                  ? 'bg-green-100'
                  : isToday
                  ? 'border-blue-500'
                  : 'bg-white'
              }`}
            >
              {i + 1}
              {hasAppointments && (
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen">
      <div className="w-64 bg-blue-600 text-white p-6">
        <div className="text-xl font-bold mb-6">Medico</div>
        <nav className="space-y-4">
          <button
            onClick={() => setActiveSection('home')}
            className={`flex items-center w-full p-3 rounded ${
              activeSection === 'home' ? 'bg-blue-700' : 'hover:bg-blue-500'
            }`}
          >
            <Home className="mr-3" /> Home
          </button>
          <button
            onClick={() => setActiveSection('profile')}
            className={`flex items-center w-full p-3 rounded ${
              activeSection === 'profile' ? 'bg-blue-700' : 'hover:bg-blue-500'
            }`}
          >
            <User className="mr-3" /> Profile
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-3 rounded hover:bg-red-500"
          >
            <LogOut className="mr-3" /> Logout
          </button>
        </nav>
      </div>

      <div className="flex-1 bg-gray-100 p-8">
        {activeSection === 'home' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">
              Welcome, {doctor?.name || '...'}
            </h2>

            <div className="flex justify-between items-center mb-2">
              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() - 1,
                      1
                    )
                  )
                }
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                Prev
              </button>
              <h3 className="text-xl font-semibold">
                {currentMonth.toLocaleString('default', { month: 'long' })}{' '}
                {currentMonth.getFullYear()}
              </h3>
              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() + 1,
                      1
                    )
                  )
                }
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                Next
              </button>
            </div>

            {renderCalendar()}

            {selectedDate && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Time Slots Section */}
                <div className="bg-white p-4 rounded shadow">
                  <h4 className="font-semibold mb-2 flex items-center">
                    <Clock className="mr-2" size={18} />
                    Available Time Slots: {selectedDate}
                  </h4>
                  <div className="mb-4">
                    {getSlotsForSelectedDate().length > 0 ? (
                      <ul className="mt-2 space-y-2">
                        {getSlotsForSelectedDate().map((slot, idx) => (
                          <li key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                            <span>{slot.time}</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              slot.status === 'free' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {slot.status}
                            </span>
                            <button 
                              onClick={() => handleDeleteSlot(slot.time)}
                              className="text-red-500 hover:text-red-700"
                              disabled={slot.status === 'booked'}
                              title={slot.status === 'booked' ? "Cannot delete booked slots" : "Delete slot"}
                            >
                              <Trash2 size={16} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 text-gray-500">No slots added for this day yet.</p>
                    )}
                  </div>

                  <div className="bg-blue-50 p-3 rounded">
                    <h5 className="font-medium mb-2">Add New Time Slot</h5>
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Start Time</label>
                        <input
                          type="time"
                          className="p-2 border rounded w-full"
                          value={newSlot.start}
                          onChange={(e) => setNewSlot(prev => ({ ...prev, start: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">End Time</label>
                        <input
                          type="time"
                          className="p-2 border rounded w-full"
                          value={newSlot.end}
                          onChange={(e) => setNewSlot(prev => ({ ...prev, end: e.target.value }))}
                          required
                        />
                      </div>
                      <button
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                        onClick={handleAddSlot}
                      >
                        Add Slot
                      </button>
                    </div>
                  </div>
                </div>

                {/* Appointments Section */}
                <div className="bg-white p-4 rounded shadow">
                  <h4 className="font-semibold mb-2 flex items-center">
                    <Calendar className="mr-2" size={18} />
                    Appointments: {selectedDate}
                  </h4>
                  
                  {appointmentsLoading ? (
                    <div className="flex justify-center items-center p-4">
                      <p>Loading appointments...</p>
                    </div>
                  ) : appointments.length > 0 ? (
                    <div className="divide-y">
                      {appointments.map((appointment) => (
                        <div key={appointment._id} className="py-3">
                          <div className="flex justify-between">
                            <span className="font-medium">{appointment.patient_name}</span>
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {appointment.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            <div>Time: {appointment.time_slot}</div>
                            <div>Date: {formatAppointmentDate(appointment.appointment_date)}</div>
                            
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 py-4 text-center">
                      No appointments scheduled for this date.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === 'profile' && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Doctor Profile</h2>
            <div className="space-y-2">
              <p>
                <strong>Name:</strong> {doctor?.name}
              </p>
              <p>
                <strong>Email:</strong> {doctor?.email}
              </p>
              <p>
                <strong>Specialization:</strong> {doctor?.specialization}
              </p>
              <p>
                <strong>Phone:</strong> {doctor?.phone}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
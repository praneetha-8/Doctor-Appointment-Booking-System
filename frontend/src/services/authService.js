import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

export const signupPatient = async (patientData) => {
  try {
    const response = await axios.post(`${API_URL}/signup`, patientData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const loginPatient = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
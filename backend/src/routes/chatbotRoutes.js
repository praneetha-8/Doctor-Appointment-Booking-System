const express = require("express");
const { Mistral } = require("@mistralai/mistralai");
require("dotenv").config();

const router = express.Router();

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const client = new Mistral({ apiKey: MISTRAL_API_KEY });

// POST /api/chatbot/message
router.post("/message", async (req, res) => {
  const userMessage = req.body.message;

  // Step 1: Greet the user
  if (userMessage.toLowerCase().includes("hi") || userMessage.toLowerCase().includes("hello")) {
    return res.json({
      message: "Hi! How can I assist you today? Feel free to tell me your symptoms."
    });
  }

  // Step 2: Extract known symptoms
  const symptoms = userMessage;
 {
    try {
      const doctorRecommendation = await getDoctorRecommendation(symptoms);
      return res.json({ message: doctorRecommendation });
    } catch (err) {
      console.error("Mistral API error:", err.message);
      return res.json({
        message: "Oops! Something went wrong while getting doctor recommendations. Please try again later.",
      });
    }
  }

  // Default fallback
  res.json({
    message: "Sorry, I didn't understand your symptoms. Can you please rephrase or try again? I'm here to help!",
  });
});

// Extract known symptoms from message
// function getSymptomsFromMessage(message) {
//   const knownSymptoms = [
//     "nose problem",
//     "headache",
//     "fever",
//     "stomach ache",
//     "chest pain",
//     "nausea",
//     "vomiting",
//     "fatigue",
//     "joint pain",
//     "cold",
//     "cough",
//     "sore throat",
//     "shortness of breath",
//     "abdominal pain"
//   ];

//   return knownSymptoms.filter(symptom =>
//     message.toLowerCase().includes(symptom)
//   );
// }

// Call Mistral AI for doctor recommendation
async function getDoctorRecommendation(userSymptoms) {
  const prompt = `Given the following symptoms: ${userSymptoms}, which type of specialist doctor should the patient consult? Return only the specialist name(s), not detailed explanations.`;

  const chatResponse = await client.agents.complete({
    agentId: "ag:e373f9e3:20250419:untitled-agent:0379d906", // Replace with your actual agent ID if needed
    messages: [{ role: 'user', content: prompt }],
  });

  const specialist = chatResponse.choices[0].message.content.trim();

  return `For symptoms like ${userSymptoms}, I recommend consulting a ${specialist}. Let me know if you need help booking an appointment!`;
}

module.exports = router;

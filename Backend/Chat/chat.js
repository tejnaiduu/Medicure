const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function getChatResponse(userQuery) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

   const systemPrompt = `You are a professional and supportive medical chatbot assistant. Your main focus is medical and health-related topics. You provide detailed, accurate, and clear explanations based on user queries.

    1. MEDICAL QUESTIONS:
      - Respond fully and professionally with as much detail as needed give in professional response
      - Use simple language and avoid jargon
      - Maintain a helpful, caring, and expert tone
      - Always recommend seeing a healthcare professional for serious issues

    2. NON-MEDICAL QUESTIONS:
      - Respond briefly with a general answer if possible
      - Politely mention that your expertise is in medical topics
      - Example: "Here’s a quick overview, but I specialize in health topics. Feel free to ask about your health."

    3. CASUAL MESSAGES (Hi, Thanks, How are you):
      - Respond warmly but briefly
      - Gently guide the user back to medical or health-related questions

    If the user asks for explanations, give clear and simple explanations first, then offer to explain further if needed.
    Always focus on user well-being and provide information that is genuinely helpful.`;

    const prompt = `${systemPrompt}\n\nUser: ${userQuery}\n\nAssistant:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text();

    return aiResponse;

  } catch (error) {
    console.error("Error getting chat response:", error);

    // Check if model is overloaded or rate-limited
    const errorMessage = error?.message?.toLowerCase();
    if (errorMessage?.includes("quota") || errorMessage?.includes("rate limit") || errorMessage?.includes("overloaded")) {
      return "I'm currently handling many requests. Please wait a moment and try again.";
    }

    return "Sorry, something went wrong while generating a response. Please try again shortly.";
  }
}

module.exports = {
  getChatResponse
};

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const ParseResume = require("./ResumeParser.js");
const dotenv = require('dotenv').config()


const genAIInstances = [
  new GoogleGenerativeAI(process.env.API_KEY_1),
  new GoogleGenerativeAI(process.env.API_KEY_2),
  new GoogleGenerativeAI(process.env.API_KEY_3),
  new GoogleGenerativeAI(process.env.API_KEY_4),
  new GoogleGenerativeAI(process.env.API_KEY_5),
  new GoogleGenerativeAI(process.env.API_KEY_6),
  new GoogleGenerativeAI(process.env.API_KEY_7),
  new GoogleGenerativeAI(process.env.API_KEY_8),
  new GoogleGenerativeAI(process.env.API_KEY_9),
  new GoogleGenerativeAI(process.env.API_KEY_10),
  new GoogleGenerativeAI(process.env.API_KEY_11),
  new GoogleGenerativeAI(process.env.API_KEY_12),
  new GoogleGenerativeAI(process.env.API_KEY_13),
  new GoogleGenerativeAI(process.env.API_KEY_14),
];

let currentGenAIIndex = 0;

function getNextGenAI() {
  const genAI = genAIInstances[currentGenAIIndex];
  currentGenAIIndex = (currentGenAIIndex + 1) % genAIInstances.length;
  return genAI;
}

module.exports = async function ParseResumeDistributed(
  resume_url,
  job_requirement,
  maxretries = 3
) {
  for (let attempts = 0; attempts < maxretries; attempts++) {
    try {
      console.log("retry", attempts)
      const genAI = getNextGenAI();
      const result = await ParseResume(resume_url, job_requirement, genAI);
      return result;
    } catch (error) {
      if (error) {
        console.log("retry error ", error)
        console.log(
          `Retry attempt ${attempts + 1} due to error`
        );
        continue;
      }
      else {
        return [
          {
          personal_information: {
            name: "error fetching name ",
            contact: "error fetching contact",
            email: "error fetching email",
          },
          suitability_rating: "error fetching rating",
          reason: "error fetching reason",
        }]
      }
    }
  }
};

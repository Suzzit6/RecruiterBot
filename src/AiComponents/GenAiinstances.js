const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const ParseResume = require("./ResumeParser.js");
const dotenv = require('dotenv').config()


// const API_KEY_1 = "AIzaSyAAO13jZCuYbZwePj5K_JQfuJftuOVHKpY";

// const API_KEY_2 = "AIzaSyDCZPTzDoz6PuBLhlcNWc3gHP4imWiLmBE";

// const API_KEY_3 = "AIzaSyBxqgbJJEAWeo7C5VrHo7QUxwF7i4Y38P0";

// const API_KEY_4 = "AIzaSyB71sTyoWeR2ngXmj5uc3q9C7t-bOCXrHc";

const genAIInstances = [
  new GoogleGenerativeAI(process.env.API_KEY_1),
  new GoogleGenerativeAI(process.env.API_KEY_2),
  new GoogleGenerativeAI(process.env.API_KEY_3),
  new GoogleGenerativeAI(process.env.API_KEY_4),
];

let currentGenAIIndex = 0;

function getNextGenAI() {
  const genAI = genAIInstances[currentGenAIIndex];
  currentGenAIIndex = (currentGenAIIndex + 1) % genAIInstances.length;

  console.log(genAI);

  //   if (genAI[apikey] || genAI.GoogleGenerativeAI.apikey) {
  //       console.log(genAI[apikey] + "brackets")
  //       console.log(genAI.GoogleGenerativeAI.apikey +"nobrackets")
  //   }
  return genAI;
}

module.exports = async function ParseResumeDistributed(
  resume_url,
  job_requirement,
  maxretries = 3
) {
  for (let attempts = 0; attempts < maxretries; attempts++) {
    try {
      const genAI = getNextGenAI();
      const result = await ParseResume(resume_url, job_requirement, genAI);
      return result;
    } catch (error) {
      if ((error.message.includes("JSON") && attempts < maxretries - 1)) {
        console.log(
          `Retry attempt ${attempts + 1} due to JSON error`
        );
        continue;
      } if (error.message.includes("RECITATION")&& attempts < maxretries - 1 ) {
        console.log(
            `Retry attempt ${attempts + 1} due to Recitation error`
          );
          continue;
        
      }
      else {
        return {
          personal_information: {
            name: "error fetching name ",
            contact: "error fetching contact",
            email: "error fetching email",
          },
          suitability_rating: "error fetching rating",
          reason: "error fetching reason",
        };
      }
    }
  }
};

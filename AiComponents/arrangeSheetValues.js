const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const fs = require('fs');

  const apiKey = "";
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ];
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    safetySettings
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    // responseMimeType: "image/jpeg",
    response_mime_type: "application/json"
  };

  
  module.exports = async function runChat(input) {
    const chatSession = model.startChat({
      generationConfig,
    });
   const prompt = `I have an array of objects where each object contains various keys and values. I need the array to be rearranged so that each object only contains the following keys: Timestamp, Name, Email, Phone, skills, and resume. If any of these keys are absent in the input object, their value should be set to null. The output should be in same  format as the input is . Here is an example of the desired output format:\n\n{\n  Timestamp: 'time stamp here from the input',\n  Name: 'name of the candidate',\n  Email: 'abc@gmail.com',\n  Phone: 'phone no. here',\n  skills: 'skills here',\n  resume: 'resume link here from the input'\n}\n\n\nThe output should be an array of objects, each formatted as shown above. The output should only contain the specified keys and no extra keys. strictly the output should be in json format only . heres the input:\n\n ${input} ,\n  `

    const result = await chatSession.sendMessage(prompt)
        console.log(JSON.parse(result.response.text()));
       const res= JSON.parse(result.response.text());
       return res 
  }
  //  const input = `[
  //   {
  //     Timestamp: '6/17/2024 20:45:41',
  //     'Your Name': 'sujit',
  //     'Your Email': 'something@gmail.com',
  //     'Your Phone': '9997774444',
  //     skills: 'node js python',
  //     'resume ': 'https://drive.google.com/file/d/1PqqJGv6cvdC4csT-fPLrvrj2iiiKvyZ-';
  //   },
  //   {
  //     Timestamp: 'random',
  //     'Your Name': 'sujit2test',
  //     'Your Email': 'abc@gmail.com',
  //     'Your Phone': '7998855441',
  //     skills: 'c++ , python',
  //     'resume ': 'https://drive.google.com/file/d/1q4EcWcPjHOVXJt7KAQyMLnyg70tN8atg'
  //   },
  //   {
  //     Timestamp: 'randomdate',
  //     'Your Name': 'sujit5test',
  //     'Your Email': 'juujutsu@hotmail.com',
  //     'Your Phone': '7788855544',
  //     skills: 'html',
  //     'resume ': 'https://drive.google.com/file/d/1biwCnhSolL1lhzvJ5NeFym4V4IDiHQUD'
  //   }
  // ]`

  // runChat(input)

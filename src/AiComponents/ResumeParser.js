import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import fs from 'fs';

  const apiKey = "AIzaSyAAO13jZCuYbZwePj5K_JQfuJftuOVHKpY";
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
    response_mime_type: "application/json"
  };



  async function ParseResume(resume_path,job_requirement) {
    const resume = fs.readFileSync(resume_path,'utf-8')
    const chatSession = model.startChat({
      generationConfig,
      
        // inlineData: {
        //   mimeType: "image/jpeg",
        //   data: Buffer.from(fs.readFileSync(image1)).toString("base64")
        // }
    });
    const prompt = `Parse the following resume and extract key information into a JSON format. ${resume} Include the following details:\n\n\n1. Personal Information: name, contact number, email, and location\n2. Work Experience: For each position, provide company name, candidate's role, and work duration\n3. Projects: List significant projects undertaken\n4. Education:\n   - Highest degree attained\n   - Field of study\n   - University/institution names\n   - Graduation dates\n   - GPA (if provided)\n5. Skills:\n   - Technical skills\n   - Soft skills\n   - Language proficiencies\n6. Certifications and Achievements:\n   - Awards and hackathons\n   - Professional certifications\n7. Tools and Technologies:\n   - Software proficiency\n   - Programming languages\n8. Social Links: LinkedIn, GitHub, portfolio\n9. Gaps in Employment: Identify any significant gaps\n\nAfter extracting this information, compare the candidate's profile to the following job requirements:\n ${job_requirement}  \nBased on the comparison, rate the candidate's suitability for the role on a scale of 1 to 10. Include this rating in the JSON output.\n\nProvide the extracted information and suitability rating in a single, well-structured JSON format.`
    const result = await chatSession.sendMessage(prompt)
     console.log(result.response.text());
  }
  
  const resume = 'resume.pdf'
  const job_requirement = `### Internship Opportunity at Studio Frontier

#### About Studio Frontier
Studio Frontier is a boutique software development studio based in Mumbai. We specialize in building custom applications for startups and scaleups, along with developing our in-house SaaS products. Our founders bring over a decade of industry experience.

#### Internship Details

**Position:** Software Development Intern  
**Number of Openings:** 2  
**Location:** Mumbai, Maharashtra

#### Responsibilities
As a selected intern, you will:
1. Work on our in-house products.
2. Engage in client projects.
3. Develop tools to enhance company operations.

#### Skills Required
- HTML
- JavaScript
- React
- ReactJS


#### Eligibility Criteria
Only candidates who meet the following criteria can apply:
1. Available for a full-time (in-office) internship.
2. Can start the internship between 12th Jun'24 and 17th Jul'24.
3. Available for a duration of 3 months.
4. From or willing to relocate to Mumbai and neighboring cities.
5. Possess relevant skills and interests.

**Preferred Background:** Computer Engineering students

#### Perks
- Certificate
- Letter of recommendation
- Informal dress code
- 5-day work week`
  ParseResume(resume,job_requirement)
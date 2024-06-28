const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const { fileURLToPath } = require('url');


// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

 module.exports = async function extractTextFromPDF(pdfPath) {


    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);
    return data.text;
  }
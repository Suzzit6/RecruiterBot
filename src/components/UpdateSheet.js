
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const google = require('googleapis').google;


module.exports =  async function UpdateSheet(ctx,Candidate,name,phone,email) {


    const auth = new google.auth.GoogleAuth({
        keyFile: "token.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets",
      });
    
      const client = await auth.getClient();
    
      const googleSheets = google.sheets({ version: "v4", auth: client });
       const  {sheetID} = ctx.session
    
      const spreadsheetId = sheetID ;
      // const spreadsheetId = "13YtvCq_9KB1AW3Rpn_SoSbS615AgaxCXZpKn51G-Seo";
    
      const metaData = await googleSheets.spreadsheets.get({
        auth,
        spreadsheetId,
      })
       
      let sheetExists = metaData.data.sheets.some((sheet)=>{
         console.log(sheet.properties.title)
           sheet.properties.title === "CandidateLists"
           return true
      })
      

      if (!sheetExists) {
        await googleSheets.spreadsheets.batchUpdate({
          spreadsheetId: spreadsheetId,
          resource: {
            requests: [
              {
                addSheet: {
                  properties: {
                    title: "CandidateLists",
                  },
                },
              },
            ],
          },
        });
        console.log(` CandidateLists created`);
      }
      
      const values = [
        [
          Candidate.personal_information.name || name,
          Candidate.personal_information.contact_number || phone ,
          Candidate.personal_information.email || email, 
          Candidate.suitability_rating, 
          Candidate.reason 
        ]
      ]
       if (values) {
        
       
      await googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: "CandidateLists!A:E",
        valueInputOption: "USER_ENTERED",
        resource: {
          values: values,
        },
      });
    }
  
    }
  
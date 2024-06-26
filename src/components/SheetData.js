import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { google } from 'googleapis';



export default  async function accessSpreadsheet(SheetID) {


const auth = new google.auth.GoogleAuth({
    keyFile: "token.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  const client = await auth.getClient();

  const googleSheets = google.sheets({ version: "v4", auth: client });

  const spreadsheetId = SheetID;
  // const spreadsheetId = "13YtvCq_9KB1AW3Rpn_SoSbS615AgaxCXZpKn51G-Seo";

  const metaData = await googleSheets.spreadsheets.get({
    auth,
    spreadsheetId,
  })
   

  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "Form Responses 1",
  });

  // console.log(getRows.data)

  const rows = getRows.data.values;
  

    if (rows.length > 1) {

      const keys = rows[0].map(String);
      const data = rows.slice(1).map(row => {
        let obj = {};
        keys.forEach((key, index) => {
        
          obj[key] = row[index];
        });
        return obj;
      });
      return data
  
    } else {
      console.log("No data found");
    }
 

}






const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");
const google = require("googleapis").google;

module.exports = async function FilterCandids(ctx, percentage = 0) {
  try {
    console.log("Inside handle filter step 2");
    const auth = new google.auth.GoogleAuth({
      keyFile: "token.json",
      scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    const client = await auth.getClient();

    const googleSheets = google.sheets({ version: "v4", auth: client });
    const { sheetID } = ctx.session;

    const spreadsheetId = sheetID;
    // const spreadsheetId = "13YtvCq_9KB1AW3Rpn_SoSbS615AgaxCXZpKn51G-Seo";

    const metaData = await googleSheets.spreadsheets.get({
      auth,
      spreadsheetId,
    });

    const getRows = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: `CandidateLists!A2:D`,
    });

    const rows = getRows.data.values;
    if (!rows || rows.length === 0) {
      return [];
    }

    const sortedCandidates = rows.sort(
      (a, b) => parseFloat(b[3]) - parseFloat(a[3])
    );
    const keepcount = Math.ceil(sortedCandidates.length * percentage);
    const topcandidates = sortedCandidates.slice(0, keepcount);

    let sheetExists = metaData.data.sheets.some((sheet) => sheet.properties.title === "FilteredCandidates"
      
    );

    if (!sheetExists) {
     await googleSheets.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheetId,
        resource: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: "FilteredCandidates",
                },
              },
            },
          ],
        },
      });
      console.log(`FilteredCandidates created`);
    }

   await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "FilteredCandidates!A:D",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: topcandidates,
      },
    });
  } catch (error) {
    console.error("Error filtering candidates:", error);
    ctx.reply(
      "An error occurred while filtering candidates. Please try again."
    );
  }
}

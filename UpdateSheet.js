const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");
const google = require("googleapis").google;

module.exports = async function UpdateSheet(
  ctx,
  candidatePromises
) {
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

  let sheetExists = metaData.data.sheets.some(
    (sheet) => sheet.properties.title === "CandidateLists"
  );

  try {
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
      console.log(`CandidateLists created`);
    }
    const resolvedCandidates = await Promise.all(candidatePromises);
    console.log("candidatePromises ",candidatePromises)

// Now `resolvedCandidates` is an array of actual candidate data, not promises
const singleCandidate = resolvedCandidates.map(async(candidate) => {
  console.log("Candidate", candidate);
  console.log("parsedResume", candidate.parsedResume);
  console.log("name", candidate.parsedResume[0]?.personal_information.name);

  const values = [
    [
      candidate.parsedResume[0]?.personal_information.name || candidate.name,
      candidate.parsedResume[0]?.personal_information.contact_number || candidate.phone,
      candidate.parsedResume[0]?.personal_information.email || candidate.email,
      candidate.parsedResume[0]?.suitability_rating,
      candidate.parsedResume[0]?.reason,
    ],
  ];
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
    })

  } catch (error) {
    console.log(error);
    console.log(name, phone, email);
  }
};

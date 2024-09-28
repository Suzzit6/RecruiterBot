const TelegramBot = require("node-telegram-bot-api");
const extractSheetId = require("./ExtractID.js");
const ConvertLink = require("./ConvertLink.js");
const runChat = require("../AiComponents/arrangeSheetValues.js");
const ParseResume = require("../AiComponents/ResumeParser.js");
const LocalSession = require("telegraf-session-local");
const { RateLimiter } = require("limiter");
const ParseResumeDistributed = require("../AiComponents/GenAiinstances.js");
const dotenv = require("dotenv").config();
const asyncLimit = require("async-limit");

const FilterCandids = require("./filter.js");
const accessSpreadsheet = require("./SheetData.js");
const UpdateSheet = require("./UpdateSheet.js");
const { Telegraf } = require("telegraf");

const localSession = new LocalSession({
  database: "session_db.json",
  property: "session",
  storage: LocalSession.storageMemory,
});

const limiter = new RateLimiter({
  tokensPerInterval: 2, // number of requests
  interval: "second", // per second
});

const token = process.env.token;

const bot = new Telegraf(token, { polling: true });
bot.use(localSession.middleware());

const State = {
  IDLE: "IDLE",
  WAITING_FOR_SHEET: "WAITING_FOR_SHEET",
  WAITING_FOR_JOB_REQ: "WAITING_FOR_JOB_REQ",
  WAITING_TO_FILTER: "WAITING_TO_FILTER",
};
const userStates = new Map();

bot.command("start", (ctx) => {
  ctx.session.state = State.WAITING_FOR_SHEET;
  ctx.reply(
    "Please provide the Google Sheet link containing your form data. Make sure the Sheet or any of the drive link in the Sheet is not restricted"
  );
});

bot.on("text", async (ctx) => {
  const userId = ctx.from.id;
  const currentState = ctx.session.state || State.IDLE;

  switch (currentState) {
    case State.WAITING_FOR_SHEET:
      await handleSheetLink(ctx);
      break;
      a;
    case State.WAITING_FOR_JOB_REQ:
      await handleJobRequirement(ctx);
      break;
    case State.WAITING_TO_FILTER:
      await handlefiltercandids(ctx);
      break;
    default:
      ctx.reply("Use /start to begin the process.");
  }
});

async function handleSheetLink(ctx) {
  try {
    const sheetLink = ctx.message.text;
    ctx.reply("Please wait while we are processing Sheet data ");
    const sheetID = extractSheetId(sheetLink);
    ctx.session.sheetID = sheetID;
    const sheetValues = await accessSpreadsheet(sheetID);

    if (!sheetValues) {
      ctx.reply(
        "Failed to access the spreadsheet. Please check the link or Make sure the sheet is not restricted."
      );
      return;
    }

    const modifiedSheet = await runChat(JSON.stringify(sheetValues));
    ctx.session.modifiedSheet = modifiedSheet;

    ctx.session.state = State.WAITING_FOR_JOB_REQ;
    console.log(modifiedSheet);

    ctx.reply(
      "Sheet data processed successfully. Now, please provide your job requirements"
    );
  } catch (error) {
    console.error("Error processing sheet:", error);
    ctx.reply(
      "An error occurred while processing the sheet. Make sure the Sheet or any of the drive link in the Sheet is not restricted."
    );
    ctx.session.state = State.IDLE;
  }
}

async function handleJobRequirement(ctx) {
  try {
    const jobRequirement = ctx.message.text;
    console.log("jobRequirement  " + jobRequirement);
    const { modifiedSheet } = ctx.session;
    ctx.reply("Starting to process resumes. This may take some time...");
    console.log(modifiedSheet);
    const pLimit = (await import("p-limit")).default;
    const limit = pLimit(14);
    const startTime = Date.now(); // Capture start time

    const candidatePromises = modifiedSheet.map(async (row, index) => {
      const rawUrl = row.resume;
      const candidEmail = row.Email;
      const candidPhone = row.Phone;
      const candidName = row.Name;
      const resumeUrl = ConvertLink(rawUrl);
      const parsedResume = [];

      try {
        const storeParsedData = async (resumeUrl, job_requirement) => {
          try {
            const result = await ParseResumeDistributed(
              resumeUrl,
              job_requirement
            );
            parsedResume.push(result); // Store each result in the array
          } catch (error) {
            console.error("Error while parsing resume:", error);
          }
        };

        // const parsedResume = await ParseResumeDistributed(
        //   resumeUrl,
        //   jobRequirement
        // );
        await limit(() => storeParsedData(resumeUrl, jobRequirement));

        console.log(parsedResume);
        return {
          name: candidName,
          Email: candidEmail,
          Phone: candidPhone,
          parsedResume,
        };
      } catch (error) {
        ctx.reply(`error parsing in resume at ${rawUrl} of ${candidName} `);
        console.log(error);

        return {
          name: candidName,
          rating: "error while parsing",
        };
      }
    });
    
    const results = await Promise.all(candidatePromises).then(() => {
      const updated_sheet =  UpdateSheet(
        ctx,
        candidatePromises
      );
     if (updated_sheet) {
        ctx.reply(
         `Processed ${modifiedSheet.length} resumes`
       );
     }
      const endTime = Date.now(); // Capture end time
      const timeTakenInSeconds = (endTime - startTime) / 1000;
      console.log(`Processing completed in ${timeTakenInSeconds} seconds`);
    });
    await ctx.reply(
      `Please provide percentage of candidates you want to filter`
    );
    ctx.session.state = State.WAITING_TO_FILTER;
    delete ctx.session.modifiedSheet;
  } catch (error) {
    console.error("Error parsing resumes:", error);
    ctx.reply(
      "An error occurred while parsing resumes.Make sure all the Resumes in the Sheet are in PDF format."
    );
    ctx.session.state = State.IDLE;
  }
}

async function handlefiltercandids(ctx) {
  const args = ctx.message.text.split(" ");

  const percentage = parseInt(args[1]) / 100;
  console.log(percentage);
  if (isNaN(percentage) || percentage > 1) {
    return ctx.reply("Please provide a valid percentage between 1 and 100.");
  }
  await FilterCandids(ctx, percentage);
  ctx.session.state = State.IDLE;
}

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

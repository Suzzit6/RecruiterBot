import TelegramBot from "node-telegram-bot-api";
import extractSheetId from "./ExtractID.js";
import ConvertLink from "./ConvertLink.js";
import { runChat } from "../AiComponents/arrangeSheetValues.js";
import { ParseResume } from "../AiComponents/ResumeParser.js";
import LocalSession from "telegraf-session-local";

import accessSpreadsheet from "./SheetData.js";
import UpdateSheet from "./UpdateSheet.js"
import { Telegraf } from "telegraf";

const localSession = new LocalSession({
  database: "session_db.json",
  property: "session",
  storage: LocalSession.storageMemory,
});


const token = "7163115626:AAGqRVKo1x0_NqDUuSWmPBW828r8ZTGoL2c";

const bot = new Telegraf(token, { polling: true });
bot.use(localSession.middleware());

const State = {
  IDLE: "IDLE",
  WAITING_FOR_SHEET: "WAITING_FOR_SHEET",
  WAITING_FOR_JOB_REQ: "WAITING_FOR_JOB_REQ",
};
const userStates = new Map();

bot.command("start", (ctx) => {
  ctx.session.state = State.WAITING_FOR_SHEET;
  ctx.reply("Please provide the Google Sheet link containing your form data. Make sure the Sheet or any of the drive link in the Sheet is not restricted");
});

bot.on("text", async (ctx) => {
  const userId = ctx.from.id;
  const currentState = ctx.session.state || State.IDLE;

  switch (currentState) {
    case State.WAITING_FOR_SHEET:
      await handleSheetLink(ctx);
      break;
    case State.WAITING_FOR_JOB_REQ:
      await handleJobRequirement(ctx);
      break;
    default:
      ctx.reply("Use /start to begin the process.");
  }
});

async function handleSheetLink(ctx) {
  try {
    const sheetLink = ctx.message.text;
    ctx.reply(
      "Please wait while we are processing Sheet data "
    );
    const sheetID = extractSheetId(sheetLink);
    ctx.session.sheetID = sheetID
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
    console.log("modifiedSheet  " + {modifiedSheet});

    for (const row of modifiedSheet) {
      const rawUrl = row.resume;
      const candidEmail = row.Email
      const candidPhone = row.Phone
      const candidName = row.Name

      const resumeUrl = ConvertLink(rawUrl);

      const parsedResume = await ParseResume(resumeUrl, jobRequirement);


      await ctx.reply(`Candidate: ${parsedResume.personal_information.name}`);
      await ctx.reply(`Suitability Rating: ${parsedResume.suitability_rating}`);
      await ctx.reply("---");

      const updated_sheet = UpdateSheet(ctx,parsedResume,candidName,candidPhone,candidEmail)

    }

    ctx.reply("All candidates processed. Check the CandidateLists Sheet for the List of all the candidates");
    ctx.session.state = State.IDLE;
    delete ctx.session.modifiedSheet;
  } catch (error) {
    console.error("Error parsing resumes:", error);
    ctx.reply("An error occurred while parsing resumes.Make sure all the Resumes in the Sheet are in PDF format.");
    ctx.session.state = State.IDLE;
  }
}

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

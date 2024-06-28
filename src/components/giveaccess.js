const TelegramBot = require("node-telegram-bot-api");
const extractSheetId = require("./ExtractID.js");
const ConvertLink = require("./ConvertLink.js");
const runChat = require('../AiComponents/arrangeSheetValues.js');
const  ParseResume  = require("../AiComponents/ResumeParser.js");
const LocalSession = require("telegraf-session-local");
const { RateLimiter } = require("limiter");


const accessSpreadsheet = require("./SheetData.js");
const UpdateSheet = require("./UpdateSheet.js");
const { Telegraf } = require("telegraf");


const localSession = new LocalSession({
  database: "session_db.json",
  property: "session",
  storage: LocalSession.storageMemory,
});

const limiter = new RateLimiter({
  tokensPerInterval: 3,  // number of requests
  interval: "second"      // per second
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
      break;a
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
    const batchSize = 3;
    
    for (let i = 0; i < modifiedSheet.length ; i += batchSize) {
        const batch = modifiedSheet.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (row) => {
          await limiter.removeTokens(1);
          const rawUrl = row.resume;
          const candidEmail = row.Email
          const candidPhone = row.Phone
          const candidName = row.Name
    
          const resumeUrl = ConvertLink(rawUrl);
    
          const parsedResume = await ParseResume(resumeUrl, jobRequirement);
    
          const updated_sheet = UpdateSheet(ctx,parsedResume,candidName,candidPhone,candidEmail)
          // return {
          //   name: parsedResume.personal_information.name,
          //   rating: parsedResume.suitability_rating
          // };
      
        })
      
    
      // const candidatePromises = modifiedSheet.map( async (row)=>{
       
        
         
        
      // })

    // for (const row of modifiedSheet) {
    // }
    const results = await Promise.all(batchPromises);
    
    // for (const result of results) {
    //   await ctx.reply(`Candidate: ${parsedResume.personal_information.name}`);
    //   await ctx.reply(`Suitability Rating: ${parsedResume.suitability_rating}`);
    //   await ctx.reply("---");
      
    // }


    await ctx.reply(`Processed batch ${Math.floor(i/batchSize) + 1}`);
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

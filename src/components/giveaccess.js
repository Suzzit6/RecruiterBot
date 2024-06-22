import TelegramBot from "node-telegram-bot-api";
import extractSheetId from "./ExtractID.js";
import ConvertLink from "./ConvertLink.js";

import accessSpreadsheet from "./SheetData.js";
import { Telegraf } from "telegraf";


const token = "7163115626:AAGqRVKo1x0_NqDUuSWmPBW828r8ZTGoL2c";

const bot = new Telegraf(token, { polling: true });

bot.command("giveaccess", (ctx) => {
//   const chatId = msg.chat.id;
  const resp = "Now give the google sheet link which has your form data";
  console.log(resp);
  ctx.reply(resp)
//   bot.sendMessage(chatId, resp);

  bot.on("text", async (msg) => {
    // const chatId = msg.chat.id;

    // console.log(msg.link_preview_options.url);

    const sheetLink = msg.text;

    const sheetID = extractSheetId(sheetLink);
    const sheetValues = await accessSpreadsheet(sheetID);
    console.log( sheetValues);
    // console.log( sheetValues[resume]);
    // const resumeUrl =   sheetValues[0].resume;

   sheetValues.forEach((row,index)=>{

      const rawurl =  row.resume

      const resumeUrl =  ConvertLink(rawurl)

      console.log(resumeUrl)
      ctx.replyWithDocument({url:resumeUrl, filename:`resume${Date.now()}.pdf`})

   })


    // bot.off('text', listener);

  });
  // const listener = (msg) => {};
  // setTimeout(() => {
  //   bot.off('text', listener);
  // }, 60000); 
});


bot.launch();

import TelegramBot from 'node-telegram-bot-api';
import extractSheetId from './ExtractID.js';
import accessSpreadsheet from './SheetData.js';

const token = "7163115626:AAGqRVKo1x0_NqDUuSWmPBW828r8ZTGoL2c";

const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/giveaccess/, (msg, match) => {
    
    const chatId = msg.chat.id;
    const resp = "Now give the google sheet link which has your form data"; 
    console.log(resp)
    bot.sendMessage(chatId, resp);

    bot.on('message', (msg) => {
        const chatId = msg.chat.id;
        console.log(msg.link_preview_options.url)
        const sheetLink = msg.link_preview_options.url
        
       const sheetID =  extractSheetId(sheetLink)
        accessSpreadsheet(sheetID)
        
        // bot.sendMessage(chatId, msg);
      });
  });

const TelegramBot = require('node-telegram-bot-api');

const token = "7163115626:AAGqRVKo1x0_NqDUuSWmPBW828r8ZTGoL2c";

const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/giveaccess/, (msg, match) => {

  const chatId = msg.chat.id;
  const resp = "Now give the google sheet link which has your form data"; 
  bot.sendMessage(chatId, resp);

  bot.on('message', (msg) => {
      const chatId = msg.chat.id;
      const sheetLink = msg.text
      
      bot.sendMessage(chatId, sheetLink);
    });
});
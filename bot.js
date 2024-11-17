const TelegramBot = require('node-telegram-bot-api');

const token = '7484499923:AAGFDFeq2uk8L7jrYQ-f4gqnWI7tFfPUCQI';

const bot = new TelegramBot(token, { polling: true });

// Обработчик события при начале диалога (/start)
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Привет, октагон!');
});

// Лог сообщений в консоль для отладки
bot.on('message', (msg) => {
    console.log(`Message received: ${msg.text} from ${msg.chat.username || 'unknown user'}`);
});

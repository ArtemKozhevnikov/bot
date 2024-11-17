const TelegramBot = require('node-telegram-bot-api');

const token = '7484499923:AAGFDFeq2uk8L7jrYQ-f4gqnWI7tFfPUCQI';

const bot = new TelegramBot(token, { polling: true });

// Команда /help
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = `
Доступные команды:
1. /help - показывает список команд.
2. /site - отправляет ссылку на сайт Октагона.
3. /creator - отправляет ФИО создателя.
`;
    bot.sendMessage(chatId, helpMessage);
});

// Команда /site
bot.onText(/\/site/, (msg) => {
    const chatId = msg.chat.id;
    const siteLink = 'https://students.forus.ru'; // Ссылка на сайт
    bot.sendMessage(chatId, `Вот ссылка на сайт Октагона: ${siteLink}`);
});

// Команда /creator
bot.onText(/\/creator/, (msg) => {
    const chatId = msg.chat.id;
    const creatorName = 'Кожевников Артём Евгеньевич'; // Замените на ваше ФИО
    bot.sendMessage(chatId, `Создатель бота: ${creatorName}`);
});

// Лог сообщений в консоль
bot.on('message', (msg) => {
    console.log(`Received message: ${msg.text} from ${msg.chat.username || 'unknown user'}`);
});
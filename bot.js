const TelegramBot = require('node-telegram-bot-api');
const mysql = require('mysql2/promise');

const token = '7484499923:AAGFDFeq2uk8L7jrYQ-f4gqnWI7tFfPUCQI';

const bot = new TelegramBot(token, { polling: true });

// Настройки подключения к базе данных
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'chatbottests',
};

// Команда /help
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = `
Доступные команды:
1. /help - показывает список команд.
2. /site - отправляет ссылку на сайт Октагона.
3. /creator - отправляет ФИО создателя.
4. /randomItem - возвращает случайный элемент из таблицы Items.
5. /deleteItem <id> - удаляет елемент из таблицы Items по ID.
6. /getItemByID <id> - возвращает элемент из таблицы Items по ID. 
7. /getAllItems - возвращает все элементы из таблицы Items.
8. /addItem <name> <desc> - добавляет элемент в таблицу Items.
9. /updateItem <id> <name> <desc> - обновляет елемент из таблицы Items по ID.
`;
    bot.sendMessage(chatId, helpMessage);
});

// Команда /site
bot.onText(/\/site/, (msg) => {
    const chatId = msg.chat.id;
    const siteLink = 'https://students.forus.ru';
    bot.sendMessage(chatId, `Вот ссылка на сайт Октагона: ${siteLink}`);
});

// Команда /creator
bot.onText(/\/creator/, (msg) => {
    const chatId = msg.chat.id;
    const creatorName = 'Кожевников Артём Евгеньевич';
    bot.sendMessage(chatId, `Создатель бота: ${creatorName}`);
});

// Команда /randomItem
bot.onText(/\/randomItem/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.query('SELECT * FROM Items ORDER BY RAND() LIMIT 1');
        connection.end();

        if (rows.length > 0) {
            const item = rows[0];
            bot.sendMessage(chatId, `ID: ${item.id};  Name: ${item.name};  Desc: ${item.desc}`);
        } else {
            bot.sendMessage(chatId, 'Нет доступных элементов.');
        }
    } catch (err) {
        bot.sendMessage(chatId, `Ошибка: ${err.message}`);
    }
});

// Команда /deleteItem
bot.onText(/\/deleteItem (\d+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const itemId = parseInt(match[1], 10);

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.query('DELETE FROM Items WHERE id = ?', [itemId]);
        connection.end();

        if (result.affectedRows > 0) {
            bot.sendMessage(chatId, 'Элемент успешно удален.');
        } else {
            bot.sendMessage(chatId, 'Ошибка: Элемент с таким ID не найден.');
        }
    } catch (err) {
        bot.sendMessage(chatId, `Ошибка: ${err.message}`);
    }
});

// Команда /getItemByID
bot.onText(/\/getItemByID (\d+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const itemId = parseInt(match[1], 10);

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.query('SELECT * FROM Items WHERE id = ?', [itemId]);
        connection.end();

        if (rows.length > 0) {
            const item = rows[0];
            bot.sendMessage(chatId, `ID: ${item.id};  Name: ${item.name};  Desc: ${item.desc}`);
        } else {
            bot.sendMessage(chatId, 'Ошибка: Элемент с таким ID не найден.');
        }
    } catch (err) {
        bot.sendMessage(chatId, `Ошибка: ${err.message}`);
    }
});

// Команда /getAllItems
bot.onText(/\/getAllItems/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.query('SELECT * FROM Items');
        connection.end();

        if (rows.length > 0) {
            const response = rows.map(item => `ID: ${item.id};  Name: ${item.name};  Desc: ${item.desc}`).join('\n');
            bot.sendMessage(chatId, response);
        } else {
            bot.sendMessage(chatId, 'Нет доступных элементов.');
        }
    } catch (err) {
        bot.sendMessage(chatId, `Ошибка: ${err.message}`);
    }
});

// Команда /addItem
bot.onText(/\/addItem (.+) (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const name = match[1];
    const desc = match[2];

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.query('INSERT INTO Items (name, `desc`) VALUES (?, ?)', [name, desc]);
        connection.end();

        bot.sendMessage(chatId, `Элемент добавлен: ID: ${result.insertId};  Name: ${name};  Desc: ${desc}`);
    } catch (err) {
        bot.sendMessage(chatId, `Ошибка: ${err.message}`);
    }
});

// Команда /updateItem
bot.onText(/\/updateItem (\d+) (.+) (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const id = parseInt(match[1], 10);
    const name = match[2];
    const desc = match[3];

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.query('UPDATE Items SET name = ?, `desc` = ? WHERE id = ?', [name, desc, id]);
        connection.end();

        if (result.affectedRows > 0) {
            bot.sendMessage(chatId, `Элемент обновлен: ID: ${id};  Name: ${name};  Desc: ${desc}`);
        } else {
            bot.sendMessage(chatId, 'Ошибка: Элемент с таким ID не найден.');
        }
    } catch (err) {
        bot.sendMessage(chatId, `Ошибка: ${err.message}`);
    }
});

// Лог сообщений в консоль
bot.on('message', (msg) => {
    console.log(`Received message: ${msg.text} from ${msg.chat.username || 'unknown user'}`);
});
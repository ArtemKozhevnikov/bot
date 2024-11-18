const TelegramBot = require('node-telegram-bot-api');
const mysql = require('mysql2/promise');

const axios = require('axios');
const SCREENSHOT_API_KEY = 'c3727ba40735665a32e236e46d92d6b6';

const token = '7484499923:AAGFDFeq2uk8L7jrYQ-f4gqnWI7tFfPUCQI';

const bot = new TelegramBot(token, { polling: true });


// Функция для выбора случайного элемента из БД
async function getRandomItemMessage(dbConfig) {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.query('SELECT * FROM Items ORDER BY RAND() LIMIT 1');
        connection.end();

        if (rows.length > 0) {
            const item = rows[0];
            return `ID: ${item.id};  Name: ${item.name};  Desc: ${item.desc}`;
        } else {
            return 'Нет доступных элементов.';
        }
    } catch (err) {
        console.error(`Ошибка при получении randomItem: ${err.message}`);
        return 'Ошибка при получении элемента.';
    }
}

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
10. !qr <текст> - создает QR-код из переданного текста.
11. !webscr <URL> - делает скриншот указанного веб-сайта и отправляет его в чат.
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

    // Получить сообщение с случайным элементом
    const message = await getRandomItemMessage(dbConfig);

    // Отправить сообщение пользователю
    bot.sendMessage(chatId, message);
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

// Команда "!qr" для генерации QR-кода
bot.onText(/^\!qr/, function(msg) {
	console.log(msg);
	var userId = msg.from.id;
	var data = msg.text.substring(3).trim();
	var imageqr = "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=" + data;
	bot.sendMessage(msg.chat.id, "[✏️](" + imageqr + ")Qr code de: " + data,{parse_mode : "Markdown"});
});

// Команда "!webscr" для скриншота сайта
// Попробовал вставить код из вспомогалетльной ссылки, но этот api уже не работает. Домен продаётся)
// Поэтому нашёл другой api и реализовал ниже
//bot.onText(/^\!webscr/, function(msg) {
//	console.log(msg);
//	var userId = msg.from.id;
//	var url = msg.text.substring(8).trim();
//	var image = "https://api.letsvalidate.com/v1/thumbs/?url=" + url + "&width=1280&height=720";
//	bot.sendMessage(msg.chat.id, "[📷](" + image + ") Captura de la web: " + url,{parse_mode : "Markdown"});
//});

// Команда "!webscr" для скриншота сайта
bot.onText(/^\!webscr (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const url = match[1].trim(); // Extract URL from the command

    // Validate URL
    if (!/^https?:\/\//i.test(url)) {
        bot.sendMessage(chatId, 'Ошибка: Укажите корректный URL с протоколом http или https.');
        return;
    }

    try {
        const apiUrl = `http://api.screenshotlayer.com/api/capture?access_key=${SCREENSHOT_API_KEY}&url=${encodeURIComponent(url)}&viewport=1280x1024&fullpage=1&format=PNG`;

        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

        if (response.status === 200) {
        
            const buffer = Buffer.from(response.data, 'binary');
            await bot.sendPhoto(chatId, buffer, { caption: `Скриншот сайта: ${url}` });
        } else {
            bot.sendMessage(chatId, `Ошибка при создании скриншота. Код ошибки: ${response.status}`);
        }
    } catch (err) {
        console.error('Error capturing screenshot:', err.message);
        bot.sendMessage(chatId, 'Ошибка: Не удалось получить скриншот. Попробуйте позже.');
    }
});

// Обновление или добавление записи в таблицу "Users" с последней датой сообщения
bot.on('message', async (msg) => {
    const userId = msg.from.id;
    const today = new Date().toISOString().split('T')[0];

    try {
        const connection = await mysql.createConnection(dbConfig);

        await connection.query(
            `INSERT INTO Users (ID, lastMessage) VALUES (?, ?)
             ON DUPLICATE KEY UPDATE lastMessage = VALUES(lastMessage)`,
            [userId, today]
        );

        connection.end();
        console.log(`Обновлена запись для пользователя ${userId}`);
    } catch (err) {
        console.error(`Ошибка обновления записи: ${err.message}`);
    }

    console.log(`Received message: ${msg.text} from ${msg.chat.username || 'unknown user'}`);
});

const { setIntervalAsync } = require('set-interval-async/dynamic');

// Проверка каждый день (13:00 МСК)
setIntervalAsync(async () => {
    const now = new Date();
    const moscowOffset = 3 * 60 * 60 * 1000; // Смещение на 3 часа относительно UTC
    const moscowTime = new Date(now.getTime() + moscowOffset);

    if (moscowTime.getHours() === 13 && moscowTime.getMinutes() === 0) {
        try {
            const connection = await mysql.createConnection(dbConfig);

            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
            const twoDaysAgoString = twoDaysAgo.toISOString().split('T')[0];

            const [rows] = await connection.query(
                'SELECT ID FROM Users WHERE lastMessage < ?',
                [twoDaysAgoString]
            );

            connection.end();

            for (const user of rows) {
                const chatId = user.ID;

                const message = await getRandomItemMessage(dbConfig);

                await bot.sendMessage(chatId, `Вы не писали более 2 дней. Вот ваш случайный элемент:\n${message}`);
            }
        } catch (err) {
            console.error(`Ошибка проверки пользователей: ${err.message}`);
        }
    }
}, 60000);

// Лог сообщений в консоль
bot.on('message', (msg) => {
    console.log(`Received message: ${msg.text} from ${msg.chat.username || 'unknown user'}`);
});
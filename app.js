const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
    if (req.url === '/static') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ header: "Hello", body: "Octagon NodeJS Test" }));
    } else if (req.url.startsWith('/dynamic')) {
        const query = url.parse(req.url, true).query;
        const { a, b, c } = query;

        // Проверка на наличие переменных и их корректность
        if (isNaN(a) || isNaN(b) || isNaN(c)) {
            res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ header: "Error" }));
        } else {
            const result = (a * b * c) / 3;
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ header: "Calculated", body: result.toString() }));
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Page not found');
    }
});

server.listen(3000, () => {
    console.log('Сервер запущен: http://localhost:3000');
});

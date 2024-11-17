const http = require('http');
const url = require('url');
const pool = require('./db');

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const { pathname, query } = parsedUrl;

    if (pathname === '/getAllItems') {
        try {
            const [rows] = await pool.query('SELECT * FROM Items');
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(rows));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: err.message }));
        }
    } else if (pathname === '/addItem') {
        const { name, desc } = query;
        if (!name || !desc) {
            res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(null));
            return;
        }
        try {
            const [result] = await pool.query('INSERT INTO Items (name, `desc`) VALUES (?, ?)', [name, desc]);
            res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ id: result.insertId, name, desc }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: err.message }));
        }
    } else if (pathname === '/deleteItem') {
        const { id } = query;
        if (!id || isNaN(id)) {
            res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(null));
            return;
        }
        try {
            const [result] = await pool.query('DELETE FROM Items WHERE id = ?', [id]);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(result.affectedRows ? {} : null));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: err.message }));
        }
    } else if (pathname === '/updateItem') {
        const { id, name, desc } = query;
        if (!id || isNaN(id) || !name || !desc) {
            res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(null));
            return;
        }
        try {
            const [result] = await pool.query('UPDATE Items SET name = ?, `desc` = ? WHERE id = ?', [name, desc, id]);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(result.affectedRows ? { id, name, desc } : {}));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: err.message }));
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Page not found');
    }
});

server.listen(3000, () => {
    console.log('Сервер запущен: http://localhost:3000');
});

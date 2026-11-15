const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Отдаём файлы из папки public

// подкл к бд sqlite

const db = new sqlite3.Database(path.join(__dirname, 'comments.db'), (err) => {
    if (err) {
        console.error('Ошибка открытия БД:', err.message);
    } else {
        console.log('Подключено к базе данных SQLite');
    }
});

// Создаю таблицу, если ее еще нет
db.run(`
    CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        date TEXT NOT NULL
    )
`);

// api для работы с комменатми

// get получить все комментарии (новые первыми)
app.get('/api/comments', (req, res) => {
    db.all('SELECT * FROM comments ORDER BY id DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// post добавить комментарий
app.post('/api/comments', (req, res) => {
    const { text, date } = req.body;
    if (!text) return res.status(400).json({ error: 'Текст обязателен' });

    const sql = 'INSERT INTO comments (text, date) VALUES (?, ?)';
    db.run(sql, [text, date], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ id: this.lastID, text, date });
    });
});

// delete  удалить комментарий по ID
app.delete('/api/comments/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    db.run('DELETE FROM comments WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) return res.status(404).json({ error: 'Не найден' });
        res.json({ success: true });
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors('*'));
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Инициализация базы данных (создание таблицы и тестовых данных)
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_url TEXT,
        price DECIMAL(10, 2) NOT NULL
      );
    `);
    
    const res = await pool.query('SELECT COUNT(*) FROM books');
    if (parseInt(res.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO books (title, description, image_url, price) VALUES
        ('Грокаем алгоритмы', 'Иллюстрированное пособие для программистов и любопытствующих.', 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=400', 1200.00),
        ('Чистый код', 'Создание, анализ и рефакторинг кода. Классика Роберта Мартина.', 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=400', 1500.00),
        ('Вы не знаете JS', 'Глубокое погружение в механизмы языка JavaScript.', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400', 950.00);
      `);
      console.log('Тестовые данные успешно добавлены в БД.');
    }
  } catch (err) {
    console.error('Ошибка инициализации БД:', err);
  }
};

initDB();

// Получение списка всех книг (с поиском и сортировкой)
app.get('/api/books', async (req, res) => {
  try {
    const { search, sort } = req.query;
    let queryText = 'SELECT * FROM books';
    let values = [];

    if (search) {
      queryText += ' WHERE LOWER(title) LIKE LOWER($1) OR LOWER(description) LIKE LOWER($1)';
      values.push(`%${search}%`);
    }

    if (sort === 'asc') {
      queryText += ' ORDER BY price ASC';
    } else if (sort === 'desc') {
      queryText += ' ORDER BY price DESC';
    } else {
      queryText += ' ORDER BY id DESC';
    }

    const result = await pool.query(queryText, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера при получении товаров' });
  }
});

// Добавление новой книги
app.post('/api/books', async (req, res) => {
  const { title, description, image_url, price } = req.body;
  if (!title || !price) {
    return res.status(400).json({ error: 'Название и цена обязательны' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO books (title, description, image_url, price) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, image_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400', price]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера при добавлении товара' });
  }
});

// Удаление книги
app.delete('/api/books/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM books WHERE id = $1', [id]);
    res.json({ message: 'Товар успешно удален' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера при удалении товара' });
  }
});

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});


import React, { useState, useEffect } from 'react';

// Используем относительный путь, который будет перехвачен прокси Vite
const API_URL = '/api/books';

function App() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [form, setForm] = useState({ title: '', price: '', description: '', image_url: '' });

  const fetchBooks = async () => {
    try {
      const res = await fetch(`${API_URL}?search=${search}&sort=${sort}`);
      const data = await res.json();
      setBooks(data);
    } catch (err) {
      console.error("Ошибка загрузки данных:", err);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [search, sort]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price) return;
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      setForm({ title: '', price: '', description: '', image_url: '' });
      fetchBooks();
    } catch (err) {
      console.error("Ошибка добавления:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchBooks();
    } catch (err) {
      console.error("Ошибка удаления:", err);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Книжный Каталог</h1>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h3>Добавить новую книгу в каталог</h3>
        <input placeholder="Название книги *" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required style={{ marginRight: '10px' }} />
        <input type="number" placeholder="Цена (руб.) *" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required style={{ marginRight: '10px' }} />
        <input placeholder="Ссылка на обложку (URL)" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} style={{ marginRight: '10px', width: '300px' }} /><br/><br/>
        <textarea placeholder="Описание книги" value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ width: '100%', marginBottom: '10px' }} /><br/>
        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Добавить книгу</button>
      </form>

      <div style={{ marginBottom: '20px' }}>
        <input placeholder="Поиск по названию..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginRight: '15px', padding: '5px' }} />
        <select value={sort} onChange={e => setSort(e.target.value)} style={{ padding: '5px' }}>
          <option value="">Без сортировки</option>
          <option value="asc">Цена: по возрастанию</option>
          <option value="desc">Цена: по убыванию</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        {books.map(book => (
          <div key={book.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'between' }}>
            <img src={book.image_url || 'https://placeholder.com'} alt={book.title} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }} />
            <h4 style={{ margin: '10px 0 5px 0' }}>{book.title}</h4>
            <p style={{ fontSize: '12px', color: '#666', flexGrow: 1 }}>{book.description}</p>
            <div style={{ fontWeight: 'bold', margin: '10px 0' }}>{book.price} руб.</div>
            <button onClick={() => handleDelete(book.id)} style={{ padding: '5px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Удалить</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;


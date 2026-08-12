import { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:3001/api/fruits';

function App() {
  const [fruits, setFruits] = useState([]);
  const [formData, setFormData] = useState({ name: '', quantity: 0, color: '', image_url: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Read
  useEffect(() => {
    fetchFruits();
  }, []);

  const fetchFruits = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setFruits(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching fruits:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Create or Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      if (editingId) {
        // Update
        const response = await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const updatedFruit = await response.json();
        setFruits(fruits.map((f) => (f.id === editingId ? updatedFruit : f)));
        setEditingId(null);
      } else {
        // Create
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const newFruit = await response.json();
        setFruits([...fruits, newFruit]);
      }
      setFormData({ name: '', quantity: 0, color: '', image_url: '' });
    } catch (error) {
      console.error('Error saving fruit:', error);
    }
  };

  const handleEdit = (fruit) => {
    setFormData({
      name: fruit.name,
      quantity: fruit.quantity,
      color: fruit.color || '',
      image_url: fruit.image_url || ''
    });
    setEditingId(fruit.id);
  };

  const handleCancelEdit = () => {
    setFormData({ name: '', quantity: 0, color: '', image_url: '' });
    setEditingId(null);
  };

  // Delete
  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      setFruits(fruits.filter((f) => f.id !== id));
    } catch (error) {
      console.error('Error deleting fruit:', error);
    }
  };

  return (
    <div className="app-container">
      <header className="hero">
        <h1>Fruit Inventory Gallery</h1>
        <p>A fresh and dynamic way to track your delicious produce.</p>
      </header>

      <main className="main-content">
        <section className="form-section">
          <h2>{editingId ? 'Edit Fruit' : 'Add New Fruit'}</h2>
          <form onSubmit={handleSubmit} className="fruit-form">
            <div className="input-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Apple"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="quantity">Quantity</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="color">Color</label>
              <input
                type="text"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                placeholder="e.g. Red"
              />
            </div>
            <div className="input-group">
              <label htmlFor="image_url">Image URL</label>
              <input
                type="url"
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                placeholder="https://example.com/apple.jpg"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update Fruit' : 'Add Fruit'}
              </button>
              {editingId && (
                <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="gallery-section">
          <h2>Current Inventory</h2>
          {loading ? (
            <div className="loader">Loading fresh fruits...</div>
          ) : fruits.length === 0 ? (
            <div className="empty-state"> HIIIIIIIIIIIIIII Halloo-No fruits in inventory. Add some on the left!</div>
          ) : (
            <div className="fruit-grid">
              {fruits.map((fruit) => (
                <div key={fruit.id} className="fruit-card">
                  <div className="fruit-image-container">
                    {fruit.image_url ? (
                      <img src={fruit.image_url} alt={fruit.name} className="fruit-image" />
                    ) : (
                      <div className="fruit-image-placeholder">
                        <span>No Image</span>
                      </div>
                    )}
                    <span className="color-badge" style={{ backgroundColor: fruit.color || '#ccc' }}>
                      {fruit.color || 'None'}
                    </span>
                  </div>

                  <div className="fruit-details">
                    <div className="fruit-header">
                      <h3>{fruit.name}</h3>
                      <span className="fruit-id">#{fruit.id}</span>
                    </div>
                    <div className="fruit-meta">
                      <span className="quantity">
                        <strong>{fruit.quantity}</strong> in stock
                      </span>
                    </div>
                  </div>

                  <div className="fruit-actions">
                    <button className="btn btn-icon edit" onClick={() => handleEdit(fruit)}>
                      Edit
                    </button>
                    <button className="btn btn-icon delete" onClick={() => handleDelete(fruit.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;

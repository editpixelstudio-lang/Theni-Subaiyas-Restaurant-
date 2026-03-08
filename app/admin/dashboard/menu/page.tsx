'use client';

import { useState, useEffect } from 'react';
import './menu-management.css';

interface Category {
  _id: string;
  name: string;
}

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  isAvailable: boolean;
}

export default function MenuManagement() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [loading, setLoading] = useState(true);
  const [catLoading, setCatLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/menu');
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
      }
    } catch (err) {
      console.error('Failed to fetch menu items', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) setCategories(data.categories);
    } catch (err) {
      console.error('Failed to fetch categories');
    }
  };

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setEditingItem(prev => ({ ...prev, imageUrl: data.imageUrl }));
      } else {
        alert('Upload failed: ' + data.error);
      }
    } catch (error) {
      console.error('Upload Error:', error);
      alert('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const isEditing = !!editingItem._id;
    const url = isEditing ? `/api/menu/${editingItem._id}` : '/api/menu';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });

      if (res.ok) {
        fetchItems();
        setIsModalOpen(false);
        setEditingItem(null);
      } else {
        alert('Failed to save item');
      }
    } catch (error) {
      console.error('Save error', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      const res = await fetch(`/api/menu/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchItems();
      }
    } catch (error) {
      console.error('Delete error', error);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setCatLoading(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setNewCatName('');
        fetchCategories();
      } else {
        alert(data.error || 'Failed to add category');
      }
    } catch (err) {
      alert('Error adding category');
    } finally {
      setCatLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure? Items in this category will remain but the category tag will be gone.')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) fetchCategories();
    } catch (err) {
      console.error('Delete category error', err);
    }
  };

  const openNewModal = () => {
    setEditingItem({
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      category: categories[0]?.name || 'General',
      isAvailable: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const toggleAvailability = async (item: MenuItem) => {
    try {
      const res = await fetch(`/api/menu/${item._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      });
      if (res.ok) {
        fetchItems();
      }
    } catch (error) {
      console.error('Toggle error', error);
    }
  };

  if (loading) return <div className="loading-state">Loading menu items...</div>;

  return (
    <div className="menu-management animate-fade-in">
      <div className="menu-header">
        <div>
          <h2>Menu Management</h2>
          <p>Manage your food categories and items</p>
        </div>
        <button className="btn btn-primary" onClick={openNewModal}>
          + Add New Item
        </button>
      </div>

      <div className="category-manager">
        <h3>📂 Manage Categories {catLoading && <span className="loading-inline">Updating...</span>}</h3>
        <form onSubmit={handleAddCategory} className="category-add-form">
          <input 
            type="text" 
            placeholder="New Category Name (e.g. Seafood)" 
            value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={catLoading}>Add</button>
        </form>
        <div className="category-tags">
          {categories.map(cat => (
            <div key={cat._id} className="category-tag">
              {cat.name}
              <button className="btn-remove-cat" onClick={() => handleDeleteCategory(cat._id)}>×</button>
            </div>
          ))}
          {categories.length === 0 && <p className="empty-inline">No custom categories yet.</p>}
        </div>
      </div>

      <div className="menu-list">
        {items.length === 0 ? (
          <div className="empty-state">No menu items found. Add some delicious dishes!</div>
        ) : (
          items.map(item => (
            <div key={item._id} className={`menu-card ${!item.isAvailable ? 'unavailable' : ''}`}>
              <div className="menu-image">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} />
                ) : (
                  <div className="placeholder-img">No Image</div>
                )}
              </div>
              <div className="menu-details">
                <div className="menu-title-row">
                  <h3>{item.name}</h3>
                  <span className="menu-price">₹{item.price}</span>
                </div>
                <span className="menu-category">{item.category}</span>
                <p className="menu-description">{item.description}</p>
                
                <div className="menu-actions">
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={item.isAvailable} 
                      onChange={() => toggleAvailability(item)}
                    />
                    <span className="slider round"></span>
                    <span className="toggle-label">{item.isAvailable ? 'Available' : 'Sold Out'}</span>
                  </label>
                  
                  <div className="action-buttons">
                    <button className="btn-edit" onClick={() => openEditModal(item)}>Edit</button>
                    <button className="btn-delete" onClick={() => handleDelete(item._id)}>Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && editingItem && (
        <div className="modal-overlay">
          <div className="modal-content animate-slide-up">
            <h3>{editingItem._id ? 'Edit Item' : 'New Menu Item'}</h3>
            <form onSubmit={handleSave} className="menu-form">
              <div className="form-group">
                <label>Item Name</label>
                <input 
                  type="text" 
                  value={editingItem.name || ''} 
                  onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Category</label>
                <select 
                  value={editingItem.category || ''} 
                  onChange={e => setEditingItem({...editingItem, category: e.target.value})}
                  required
                >
                  <option value="" disabled>Select Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))}
                  {categories.length === 0 && <option value="General">General (Default)</option>}
                </select>
              </div>

              <div className="form-group">
                <label>Price (₹)</label>
                <input 
                  type="number" 
                  value={editingItem.price || ''} 
                  onChange={e => setEditingItem({...editingItem, price: Number(e.target.value)})}
                  required 
                  min="0"
                />
              </div>

              <div className="form-group full-width">
                <label>Description</label>
                <textarea 
                  value={editingItem.description || ''} 
                  onChange={e => setEditingItem({...editingItem, description: e.target.value})}
                  required
                  rows={3}
                />
              </div>

              <div className="form-group full-width">
                <label>Image URL (Recommended for Vercel)</label>
                <input 
                  type="text" 
                  placeholder="https://example.com/food-image.jpg"
                  value={editingItem.imageUrl || ''} 
                  onChange={e => setEditingItem({...editingItem, imageUrl: e.target.value})}
                />
              </div>

              <div className="form-group full-width">
                <label>Image Upload (Local Only)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  disabled={uploading}
                />
                {uploading && <span className="upload-status">Uploading...</span>}
                {editingItem.imageUrl && (
                  <div className="image-preview">
                    <img src={editingItem.imageUrl} alt="Preview" />
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

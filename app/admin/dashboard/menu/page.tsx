'use client';

import { useState, useEffect } from 'react';
import './menu-management.css';

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
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchItems();
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

  const openNewModal = () => {
    setEditingItem({
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      category: 'Biryani',
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
                  value={editingItem.category || 'Biryani'} 
                  onChange={e => setEditingItem({...editingItem, category: e.target.value})}
                >
                  <option value="Biryani">Biryani</option>
                  <option value="Meals">Meals</option>
                  <option value="Drinks">Drinks</option>
                  <option value="Starters">Starters</option>
                  <option value="Desserts">Desserts</option>
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
                <label>Image Upload</label>
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

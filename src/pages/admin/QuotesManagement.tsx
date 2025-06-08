import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from '../../layouts/AdminLayout';
import FileImageUpload from '../../components/FileImageUpload';

interface Quote {
  id: number;
  quote_text: string;
  quote_author: string;
  quote_category: 'love' | 'marriage' | 'blessing' | 'general';
  quote_image_url: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const QuotesManagement = () => {
  const { token } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  const [newQuote, setNewQuote] = useState({
    quote_text: '',
    quote_author: '',
    quote_category: 'general' as const,
    quote_image_url: '',
    display_order: 0
  });

  // Load quotes from MySQL
  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/quotes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setQuotes(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading quotes:', error);
      setMessage('❌ Gagal memuat data quotes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewQuoteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewQuote(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditQuoteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editingQuote) return;
    
    const { name, value } = e.target;
    setEditingQuote(prev => prev ? ({
      ...prev,
      [name]: value
    }) : null);
  };

  const addQuote = async () => {
    if (!newQuote.quote_text.trim()) {
      setMessage('❌ Teks quote wajib diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/quotes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteText: newQuote.quote_text,
          quoteAuthor: newQuote.quote_author,
          quoteCategory: newQuote.quote_category,
          quoteImage: newQuote.quote_image_url,
          displayOrder: newQuote.display_order
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessage('✅ Quote berhasil ditambahkan!');
          setNewQuote({
            quote_text: '',
            quote_author: '',
            quote_category: 'general',
            quote_image_url: '',
            display_order: 0
          });
          setShowAddForm(false);
          loadQuotes();
        }
      } else {
        throw new Error('Failed to add quote');
      }
    } catch (error) {
      console.error('Error adding quote:', error);
      setMessage('❌ Gagal menambahkan quote');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const updateQuote = async () => {
    if (!editingQuote || !editingQuote.quote_text.trim()) {
      setMessage('❌ Teks quote wajib diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/quotes/${editingQuote.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteText: editingQuote.quote_text,
          quoteAuthor: editingQuote.quote_author,
          quoteCategory: editingQuote.quote_category,
          quoteImage: editingQuote.quote_image_url,
          displayOrder: editingQuote.display_order,
          isActive: editingQuote.is_active
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessage('✅ Quote berhasil diupdate!');
          setEditingQuote(null);
          loadQuotes();
        }
      } else {
        throw new Error('Failed to update quote');
      }
    } catch (error) {
      console.error('Error updating quote:', error);
      setMessage('❌ Gagal mengupdate quote');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const deleteQuote = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus quote ini?')) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/quotes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessage('✅ Quote berhasil dihapus!');
          loadQuotes();
        }
      } else {
        throw new Error('Failed to delete quote');
      }
    } catch (error) {
      console.error('Error deleting quote:', error);
      setMessage('❌ Gagal menghapus quote');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const toggleQuoteStatus = async (id: number, newStatus: boolean) => {
    setIsSubmitting(true);
    try {
      // Find the quote to get current data
      const currentQuote = quotes.find(q => q.id === id);
      if (!currentQuote) {
        throw new Error('Quote not found');
      }

      const response = await fetch(`${API_BASE_URL}/quotes/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteText: currentQuote.quote_text,
          quoteAuthor: currentQuote.quote_author,
          quoteCategory: currentQuote.quote_category,
          quoteImage: currentQuote.quote_image_url,
          displayOrder: currentQuote.display_order,
          isActive: newStatus
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessage(`✅ Quote ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}!`);
          loadQuotes();
        }
      } else {
        throw new Error('Failed to toggle quote status');
      }
    } catch (error) {
      console.error('Error toggling quote status:', error);
      setMessage('❌ Gagal mengubah status quote');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const bulkToggleStatus = async (newStatus: boolean) => {
    const action = newStatus ? 'mengaktifkan' : 'menonaktifkan';
    if (!window.confirm(`Apakah Anda yakin ingin ${action} semua quotes?`)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const promises = quotes.map(quote =>
        fetch(`${API_BASE_URL}/quotes/${quote.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quoteText: quote.quote_text,
            quoteAuthor: quote.quote_author,
            quoteCategory: quote.quote_category,
            quoteImage: quote.quote_image_url,
            displayOrder: quote.display_order,
            isActive: newStatus
          }),
        })
      );

      await Promise.all(promises);
      setMessage(`✅ Semua quotes berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}!`);
      loadQuotes();
    } catch (error) {
      console.error('Error bulk toggling quotes:', error);
      setMessage('❌ Gagal mengubah status quotes');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Memuat data quotes dari MySQL...</p>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto" style={{ fontFamily: 'Ovo, serif' }}>
        <div className="bg-gradient-to-br from-white via-amber-50 to-orange-50 rounded-2xl shadow-xl border border-amber-200">
          <div className="border-b border-amber-200 px-8 py-6 bg-gradient-to-r from-amber-100 to-orange-100 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <i className="fas fa-quote-left text-amber-600 text-3xl mr-4"></i>
                <div>
                  <h1 className="text-3xl font-bold text-amber-800">Quotes Management</h1>
                  <p className="text-amber-700 mt-1">Manage wedding quotes with photo uploads</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  🗄️ MySQL Database
                </span>
                <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  {quotes.length} Total
                </span>
                <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  {quotes.filter(q => q.is_active).length} Active
                </span>
                <span className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
                  {quotes.filter(q => !q.is_active).length} Inactive
                </span>
              </div>
            </div>
          </div>

          <div className="p-8">
            {message && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.includes('berhasil') || message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {message}
              </div>
            )}

            {/* Add New Quote Button */}
            <div className="mb-6">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center"
              >
                <i className="fas fa-plus mr-2"></i>
                {showAddForm ? 'Cancel' : 'Add New Quote'}
              </button>
            </div>

            {/* Add New Quote Form */}
            {showAddForm && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-amber-100 mb-6">
                <h2 className="text-xl font-semibold text-amber-800 mb-6 flex items-center">
                  <i className="fas fa-plus text-amber-600 mr-3"></i>
                  Add New Quote
                </h2>
                {/* Debug Info */}
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <i className="fas fa-info-circle mr-2"></i>
                    <strong>Debug:</strong> Add New Quote form is visible. ImageUpload should appear below.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quote Text *
                    </label>
                    <textarea
                      name="quote_text"
                      value={newQuote.quote_text}
                      onChange={handleNewQuoteChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Cinta sejati tidak pernah berakhir..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Author
                    </label>
                    <input
                      type="text"
                      name="quote_author"
                      value={newQuote.quote_author}
                      onChange={handleNewQuoteChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Paulo Coelho"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      name="quote_category"
                      value={newQuote.quote_category}
                      onChange={handleNewQuoteChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="general">General</option>
                      <option value="love">Love</option>
                      <option value="marriage">Marriage</option>
                      <option value="blessing">Blessing</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      name="display_order"
                      value={newQuote.display_order}
                      onChange={handleNewQuoteChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-xs text-yellow-800">
                        <strong>Debug:</strong> ImageUpload component should render here. Current image: {newQuote.quote_image_url || 'None'}
                      </p>
                    </div>
                    {/* File Upload for Quote Image */}
                    <FileImageUpload
                      currentImage={newQuote.quote_image_url}
                      onImageChange={(url) => {
                        console.log('🖼️ Image uploaded:', url);
                        setNewQuote(prev => ({ ...prev, quote_image_url: url }));
                      }}
                      label="Quote Image"
                      placeholder="Click 'Choose File' to select an image for this quote"
                      maxSizeKB={2048}
                    />
                  </div>
                  <div className="md:col-span-2 flex space-x-3">
                    <button
                      type="button"
                      onClick={addQuote}
                      disabled={isSubmitting}
                      className={`px-6 py-2 rounded-md font-medium text-white ${
                        isSubmitting
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700'
                      } transition-colors duration-200`}
                    >
                      {isSubmitting ? 'Adding...' : 'Add Quote'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quotes List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-amber-800 flex items-center">
                  <i className="fas fa-list text-amber-600 mr-3"></i>
                  Existing Quotes
                </h2>

                {/* Status Filter & Bulk Actions */}
                <div className="flex items-center space-x-4">
                  {/* Quick Actions */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Quick:</span>
                    <button
                      onClick={() => bulkToggleStatus(true)}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200 transition-colors"
                      title="Activate all quotes"
                    >
                      <i className="fas fa-check mr-1"></i>
                      All Active
                    </button>
                    <button
                      onClick={() => bulkToggleStatus(false)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200 transition-colors"
                      title="Deactivate all quotes"
                    >
                      <i className="fas fa-times mr-1"></i>
                      All Inactive
                    </button>
                  </div>

                  {/* Status Filter */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Filter:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="all">All Quotes ({quotes.length})</option>
                      <option value="active">Active Only ({quotes.filter(q => q.is_active).length})</option>
                      <option value="inactive">Inactive Only ({quotes.filter(q => !q.is_active).length})</option>
                    </select>
                  </div>
                </div>
              </div>

              {(() => {
                // Filter quotes based on status
                const filteredQuotes = quotes.filter(quote => {
                  if (statusFilter === 'active') return quote.is_active;
                  if (statusFilter === 'inactive') return !quote.is_active;
                  return true; // 'all'
                });

                if (filteredQuotes.length === 0) {
                  return (
                    <div className="bg-white rounded-lg p-8 text-center border border-amber-100">
                      <i className="fas fa-quote-left text-gray-400 text-4xl mb-4"></i>
                      <p className="text-gray-600">
                        {quotes.length === 0
                          ? 'No quotes found. Add your first quote!'
                          : `No ${statusFilter} quotes found.`
                        }
                      </p>
                      {statusFilter !== 'all' && (
                        <button
                          onClick={() => setStatusFilter('all')}
                          className="mt-3 text-amber-600 hover:text-amber-700 text-sm underline"
                        >
                          Show all quotes
                        </button>
                      )}
                    </div>
                  );
                }

                return filteredQuotes.map((quote) => (
                  <div key={quote.id} className="bg-white rounded-lg p-6 shadow-sm border border-amber-100">
                    {editingQuote?.id === quote.id ? (
                      // Edit Form
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quote Text *
                          </label>
                          <textarea
                            name="quote_text"
                            value={editingQuote.quote_text}
                            onChange={handleEditQuoteChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Author
                          </label>
                          <input
                            type="text"
                            name="quote_author"
                            value={editingQuote.quote_author}
                            onChange={handleEditQuoteChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category
                          </label>
                          <select
                            name="quote_category"
                            value={editingQuote.quote_category}
                            onChange={handleEditQuoteChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="general">General</option>
                            <option value="love">Love</option>
                            <option value="marriage">Marriage</option>
                            <option value="blessing">Blessing</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Display Order
                          </label>
                          <input
                            type="number"
                            name="display_order"
                            value={editingQuote.display_order}
                            onChange={handleEditQuoteChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <FileImageUpload
                            currentImage={editingQuote.quote_image_url}
                            onImageChange={(url) => setEditingQuote(prev => prev ? ({ ...prev, quote_image_url: url }) : null)}
                            label="Quote Image"
                            placeholder="Click 'Choose File' to select a new image for this quote"
                            maxSizeKB={2048}
                          />
                        </div>
                        <div className="md:col-span-2 flex space-x-3">
                          <button
                            type="button"
                            onClick={updateQuote}
                            disabled={isSubmitting}
                            className={`px-6 py-2 rounded-md font-medium text-white ${
                              isSubmitting
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                            } transition-colors duration-200`}
                          >
                            {isSubmitting ? 'Updating...' : 'Update Quote'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingQuote(null)}
                            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Display Mode
                      <div className="flex items-start space-x-4">
                        {quote.quote_image_url && (
                          <div className="flex-shrink-0">
                            <img
                              src={quote.quote_image_url}
                              alt="Quote"
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          </div>
                        )}
                        <div className="flex-grow">
                          <blockquote className="text-lg italic mb-2 text-gray-800">
                            "{quote.quote_text}"
                          </blockquote>
                          <cite className="text-sm font-medium text-gray-600">
                            — {quote.quote_author || 'Unknown'}
                          </cite>
                          <div className="flex items-center space-x-4 mt-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              quote.quote_category === 'love' ? 'bg-red-100 text-red-800' :
                              quote.quote_category === 'marriage' ? 'bg-blue-100 text-blue-800' :
                              quote.quote_category === 'blessing' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {quote.quote_category}
                            </span>
                            <span className="text-xs text-gray-500">
                              Order: {quote.display_order}
                            </span>

                            {/* Toggle Active/Inactive */}
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-600">Status:</span>
                              <button
                                onClick={() => toggleQuoteStatus(quote.id, !quote.is_active)}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
                                  quote.is_active ? 'bg-green-500' : 'bg-gray-300'
                                }`}
                                title={quote.is_active ? 'Click to deactivate' : 'Click to activate'}
                              >
                                <span
                                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${
                                    quote.is_active ? 'translate-x-5' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                              <span className={`text-xs font-medium ${
                                quote.is_active ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {quote.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0 flex space-x-2">
                          <button
                            onClick={() => setEditingQuote(quote)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="Edit Quote"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => deleteQuote(quote.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="Delete Quote"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default QuotesManagement;

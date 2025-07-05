import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Edit2, Trash2, Package, MapPin, User, Calendar, FileText, Filter, X } from 'lucide-react';
import { Delivery } from '../types';

const Deliveries: React.FC = () => {
  const { deliveries, partners, addDelivery, updateDelivery, deleteDelivery, getPartnerById, checkDeliveryExists } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateDelivery, setDuplicateDelivery] = useState<Delivery | null>(null);
  const [pendingDelivery, setPendingDelivery] = useState<Omit<Delivery, 'id' | 'createdAt'> | null>(null);

  const [formData, setFormData] = useState({
    date: '',
    quantity: '',
    boxes: '',
    destination: '',
    recipientId: '',
    notes: '',
  });

  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    recipientId: '',
    destination: '',
  });

  const resetForm = () => {
    setFormData({
      date: '',
      quantity: '',
      boxes: '',
      destination: '',
      recipientId: '',
      notes: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const deliveryData = {
      date: formData.date,
      quantity: parseFloat(formData.quantity),
      boxes: parseInt(formData.boxes),
      destination: formData.destination,
      recipientId: formData.recipientId,
      notes: formData.notes,
    };

    // Check for duplicate date
    if (!editingDelivery) {
      const existingDelivery = checkDeliveryExists(formData.date);
      if (existingDelivery) {
        setDuplicateDelivery(existingDelivery);
        setPendingDelivery(deliveryData);
        setShowDuplicateModal(true);
        return;
      }
    }

    if (editingDelivery) {
      updateDelivery(editingDelivery.id, deliveryData);
      setEditingDelivery(null);
    } else {
      addDelivery(deliveryData);
    }

    resetForm();
    setShowForm(false);
  };

  const handleEdit = (delivery: Delivery) => {
    setEditingDelivery(delivery);
    setFormData({
      date: delivery.date,
      quantity: delivery.quantity.toString(),
      boxes: delivery.boxes.toString(),
      destination: delivery.destination,
      recipientId: delivery.recipientId,
      notes: delivery.notes || '',
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this delivery?')) {
      deleteDelivery(id);
    }
  };

  const handleDuplicateResponse = (replace: boolean) => {
    if (pendingDelivery) {
      if (replace && duplicateDelivery) {
        updateDelivery(duplicateDelivery.id, pendingDelivery);
      } else {
        addDelivery(pendingDelivery);
      }
      resetForm();
      setShowForm(false);
    }
    setShowDuplicateModal(false);
    setDuplicateDelivery(null);
    setPendingDelivery(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Filter deliveries
  const filteredDeliveries = deliveries.filter(delivery => {
    if (filters.dateFrom && delivery.date < filters.dateFrom) return false;
    if (filters.dateTo && delivery.date > filters.dateTo) return false;
    if (filters.recipientId && delivery.recipientId !== filters.recipientId) return false;
    if (filters.destination && !delivery.destination.toLowerCase().includes(filters.destination.toLowerCase())) return false;
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const hasActiveFilters = filters.dateFrom || filters.dateTo || filters.recipientId || filters.destination;

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl lg:text-4xl font-light text-gray-900 mb-2">Deliveries</h1>
        <p className="text-gray-500 text-sm lg:text-base">Manage your daily cucumber deliveries</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ${
            showFilters || hasActiveFilters
              ? 'bg-gray-900 text-white shadow-md' 
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm'
          }`}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs">
              Active
            </span>
          )}
        </button>
        <button
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 rounded-2xl text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-all duration-300 shadow-sm hover:shadow-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Delivery
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Filter Deliveries</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recipient</label>
                <select
                  value={filters.recipientId}
                  onChange={(e) => setFilters({ ...filters, recipientId: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                >
                  <option value="">All Recipients</option>
                  {partners.map(partner => (
                    <option key={partner.id} value={partner.id}>{partner.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                <input
                  type="text"
                  value={filters.destination}
                  onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
                  placeholder="Search destination..."
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setFilters({
                  dateFrom: '',
                  dateTo: '',
                  recipientId: '',
                  destination: '',
                })}
                className="px-6 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-light text-gray-900 mb-6 lg:mb-8 text-center">
              {editingDelivery ? 'Edit Delivery' : 'Add New Delivery'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="w-full p-3 lg:p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                    min="0"
                    className="w-full p-3 lg:p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Boxes/Cartons</label>
                  <input
                    type="number"
                    value={formData.boxes}
                    onChange={(e) => setFormData({ ...formData, boxes: e.target.value })}
                    required
                    min="0"
                    className="w-full p-3 lg:p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recipient</label>
                  <select
                    value={formData.recipientId}
                    onChange={(e) => setFormData({ ...formData, recipientId: e.target.value })}
                    required
                    className="w-full p-3 lg:p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                  >
                    <option value="">Select recipient...</option>
                    {partners.map(partner => (
                      <option key={partner.id} value={partner.id}>{partner.name}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    required
                    placeholder="Enter destination address..."
                    className="w-full p-3 lg:p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    placeholder="Additional notes..."
                    className="w-full p-3 lg:p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingDelivery(null);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors"
                >
                  {editingDelivery ? 'Update' : 'Add'} Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deliveries Grid */}
      {filteredDeliveries.length === 0 ? (
        <div className="text-center py-12 lg:py-16">
          <div className="p-6 bg-gray-50 rounded-3xl w-20 h-20 lg:w-24 lg:h-24 mx-auto mb-6 flex items-center justify-center">
            <Package className="h-10 w-10 lg:h-12 lg:w-12 text-gray-400" />
          </div>
          <p className="text-lg lg:text-xl text-gray-500 mb-2">
            {deliveries.length === 0 ? 'No deliveries yet' : 'No deliveries found'}
          </p>
          <p className="text-gray-400 text-sm lg:text-base">
            {deliveries.length === 0 ? 'Add your first delivery to get started' : 'Try adjusting your filters'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 max-w-6xl mx-auto">
          {filteredDeliveries.map(delivery => (
            <div key={delivery.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="flex justify-between items-start mb-4 lg:mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-50 rounded-xl">
                    <Package className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm lg:text-base">{formatDate(delivery.date)}</p>
                    <p className="text-xs lg:text-sm text-gray-500">{delivery.quantity} kg • {delivery.boxes} boxes</p>
                  </div>
                </div>
                <div className="flex space-x-1 lg:space-x-2">
                  <button
                    onClick={() => handleEdit(delivery)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(delivery.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3 lg:space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-1 bg-gray-50 rounded-lg">
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                  <span className="text-xs lg:text-sm text-gray-600 break-words">
                    {getPartnerById(delivery.recipientId)?.name}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-1 bg-gray-50 rounded-lg">
                    <MapPin className="h-4 w-4 text-gray-500" />
                  </div>
                  <span className="text-xs lg:text-sm text-gray-600 break-words">
                    {delivery.destination}
                  </span>
                </div>
                {delivery.notes && (
                  <div className="flex items-start space-x-3">
                    <div className="p-1 bg-gray-50 rounded-lg">
                      <FileText className="h-4 w-4 text-gray-500" />
                    </div>
                    <span className="text-xs lg:text-sm text-gray-600 break-words">
                      {delivery.notes}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Duplicate Delivery Modal */}
      {showDuplicateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 lg:p-8 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
              Delivery Already Exists
            </h3>
            <p className="text-gray-600 mb-6 lg:mb-8 text-center text-sm lg:text-base">
              A delivery already exists for {formatDate(formData.date)}. What would you like to do?
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setShowDuplicateModal(false)}
                className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDuplicateResponse(false)}
                className="flex-1 px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Add Anyway
              </button>
              <button
                onClick={() => handleDuplicateResponse(true)}
                className="flex-1 px-4 py-3 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors"
              >
                Replace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deliveries;
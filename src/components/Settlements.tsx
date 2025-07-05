import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Edit2, Trash2, DollarSign, Eye, EyeOff, User, Calendar, FileText, Filter, Package, X } from 'lucide-react';
import { Settlement } from '../types';

const Settlements: React.FC = () => {
  const { settlements, partners, addSettlement, updateSettlement, deleteSettlement, getPartnerById, getDeliveriesByPartner } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingSettlement, setEditingSettlement] = useState<Settlement | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showAmounts, setShowAmounts] = useState(false);
  const [viewDeliveriesModal, setViewDeliveriesModal] = useState<Settlement | null>(null);

  const [formData, setFormData] = useState({
    fromDate: '',
    toDate: '',
    recipientId: '',
    quantity: '',
    amountPaid: '',
    notes: '',
  });

  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    recipientId: '',
    amountMin: '',
    amountMax: '',
  });

  const resetForm = () => {
    setFormData({
      fromDate: '',
      toDate: '',
      recipientId: '',
      quantity: '',
      amountPaid: '',
      notes: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const settlementData = {
      fromDate: formData.fromDate,
      toDate: formData.toDate,
      recipientId: formData.recipientId,
      quantity: parseFloat(formData.quantity),
      amountPaid: parseFloat(formData.amountPaid),
      notes: formData.notes,
    };

    if (editingSettlement) {
      updateSettlement(editingSettlement.id, settlementData);
      setEditingSettlement(null);
    } else {
      addSettlement(settlementData);
    }

    resetForm();
    setShowForm(false);
  };

  const handleEdit = (settlement: Settlement) => {
    setEditingSettlement(settlement);
    setFormData({
      fromDate: settlement.fromDate,
      toDate: settlement.toDate,
      recipientId: settlement.recipientId,
      quantity: settlement.quantity.toString(),
      amountPaid: settlement.amountPaid.toString(),
      notes: settlement.notes || '',
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this settlement?')) {
      deleteSettlement(id);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Filter settlements
  const filteredSettlements = settlements.filter(settlement => {
    if (filters.dateFrom && settlement.fromDate < filters.dateFrom) return false;
    if (filters.dateTo && settlement.toDate > filters.dateTo) return false;
    if (filters.recipientId && settlement.recipientId !== filters.recipientId) return false;
    if (filters.amountMin && settlement.amountPaid < parseFloat(filters.amountMin)) return false;
    if (filters.amountMax && settlement.amountPaid > parseFloat(filters.amountMax)) return false;
    return true;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const hasActiveFilters = filters.dateFrom || filters.dateTo || filters.recipientId || filters.amountMin || filters.amountMax;

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl lg:text-4xl font-light text-gray-900 mb-2">Settlements</h1>
        <p className="text-gray-500 text-sm lg:text-base">Manage your account settlements</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4">
        <button
          onClick={() => setShowAmounts(!showAmounts)}
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-2xl text-sm font-medium bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-all duration-300 shadow-sm"
        >
          {showAmounts ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {showAmounts ? 'Hide' : 'Show'} Amounts
        </button>
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
          Add Settlement
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Filter Settlements</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={filters.amountMin}
                  onChange={(e) => setFilters({ ...filters, amountMin: e.target.value })}
                  placeholder="Min amount..."
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={filters.amountMax}
                  onChange={(e) => setFilters({ ...filters, amountMax: e.target.value })}
                  placeholder="Max amount..."
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
                  amountMin: '',
                  amountMax: '',
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
              {editingSettlement ? 'Edit Settlement' : 'Add New Settlement'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                  <input
                    type="date"
                    value={formData.fromDate}
                    onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                    required
                    className="w-full p-3 lg:p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                  <input
                    type="date"
                    value={formData.toDate}
                    onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                    required
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount Paid</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amountPaid}
                    onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                    required
                    min="0"
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
                    setEditingSettlement(null);
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
                  {editingSettlement ? 'Update' : 'Add'} Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settlements Grid */}
      {filteredSettlements.length === 0 ? (
        <div className="text-center py-12 lg:py-16">
          <div className="p-6 bg-gray-50 rounded-3xl w-20 h-20 lg:w-24 lg:h-24 mx-auto mb-6 flex items-center justify-center">
            <DollarSign className="h-10 w-10 lg:h-12 lg:w-12 text-gray-400" />
          </div>
          <p className="text-lg lg:text-xl text-gray-500 mb-2">
            {settlements.length === 0 ? 'No settlements yet' : 'No settlements found'}
          </p>
          <p className="text-gray-400 text-sm lg:text-base">
            {settlements.length === 0 ? 'Add your first settlement to get started' : 'Try adjusting your filters'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 max-w-6xl mx-auto">
          {filteredSettlements.map(settlement => (
            <div key={settlement.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="flex justify-between items-start mb-4 lg:mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-50 rounded-xl">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm lg:text-base">
                      {formatDate(settlement.fromDate)} - {formatDate(settlement.toDate)}
                    </p>
                    <p className="text-xs lg:text-sm text-gray-500">{settlement.quantity} kg</p>
                  </div>
                </div>
                <div className="flex space-x-1 lg:space-x-2">
                  <button
                    onClick={() => handleEdit(settlement)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(settlement.id)}
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
                    {getPartnerById(settlement.recipientId)?.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-1 bg-gray-50 rounded-lg">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                    </div>
                    <span className="text-xs lg:text-sm text-gray-600">
                      {showAmounts ? formatCurrency(settlement.amountPaid) : '••••••'}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowAmounts(!showAmounts)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showAmounts ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {settlement.notes && (
                  <div className="flex items-start space-x-3">
                    <div className="p-1 bg-gray-50 rounded-lg">
                      <FileText className="h-4 w-4 text-gray-500" />
                    </div>
                    <span className="text-xs lg:text-sm text-gray-600 break-words">
                      {settlement.notes}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-100">
                  <button
                    onClick={() => setViewDeliveriesModal(settlement)}
                    className="text-xs lg:text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
                  >
                    View Related Deliveries
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Deliveries Modal */}
      {viewDeliveriesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 lg:p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                Related Deliveries for {getPartnerById(viewDeliveriesModal.recipientId)?.name}
              </h3>
              <button
                onClick={() => setViewDeliveriesModal(null)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Period: {formatDate(viewDeliveriesModal.fromDate)} - {formatDate(viewDeliveriesModal.toDate)}
            </p>
            
            <div className="space-y-4">
              {getDeliveriesByPartner(
                viewDeliveriesModal.recipientId,
                viewDeliveriesModal.fromDate,
                viewDeliveriesModal.toDate
              ).map(delivery => (
                <div key={delivery.id} className="border border-gray-200 rounded-xl p-4 lg:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Date:</span>
                      <p className="text-sm text-gray-600">{formatDate(delivery.date)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Quantity:</span>
                      <p className="text-sm text-gray-600">{delivery.quantity} kg</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Boxes:</span>
                      <p className="text-sm text-gray-600">{delivery.boxes}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Destination:</span>
                      <p className="text-sm text-gray-600 break-words">{delivery.destination}</p>
                    </div>
                    {delivery.notes && (
                      <div className="sm:col-span-2 lg:col-span-4">
                        <span className="text-sm font-medium text-gray-700">Notes:</span>
                        <p className="text-sm text-gray-600 break-words">{delivery.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settlements;
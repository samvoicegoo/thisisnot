import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Edit2, Trash2, User, AlertTriangle } from 'lucide-react';
import { Partner } from '../types';

const Settings: React.FC = () => {
  const { partners, addPartner, updatePartner, deletePartner, deliveries, settlements } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [formData, setFormData] = useState({ name: '' });

  const resetForm = () => {
    setFormData({ name: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPartner) {
      updatePartner(editingPartner.id, { name: formData.name });
      setEditingPartner(null);
    } else {
      addPartner({ name: formData.name });
    }

    resetForm();
    setShowForm(false);
  };

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setFormData({ name: partner.name });
    setShowForm(true);
  };

  const handleDelete = (partner: Partner) => {
    const usedInDeliveries = deliveries.some(d => d.recipientId === partner.id);
    const usedInSettlements = settlements.some(s => s.recipientId === partner.id);
    
    if (usedInDeliveries || usedInSettlements) {
      const message = `This partner is used in ${usedInDeliveries ? 'deliveries' : ''}${usedInDeliveries && usedInSettlements ? ' and ' : ''}${usedInSettlements ? 'settlements' : ''}. Are you sure you want to delete it?`;
      if (!window.confirm(message)) return;
    }

    deletePartner(partner.id);
  };

  const getPartnerUsage = (partnerId: string) => {
    const deliveryCount = deliveries.filter(d => d.recipientId === partnerId).length;
    const settlementCount = settlements.filter(s => s.recipientId === partnerId).length;
    return { deliveryCount, settlementCount };
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl lg:text-4xl font-light text-gray-900 mb-2">Partners</h1>
        <p className="text-gray-500 text-sm lg:text-base">Manage your delivery and settlement partners</p>
      </div>

      {/* Add Partner Button */}
      <div className="text-center">
        <button
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 rounded-2xl text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-all duration-300 shadow-sm hover:shadow-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Partner
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-light text-gray-900 mb-6 text-center">
              {editingPartner ? 'Edit Partner' : 'Add New Partner'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Partner Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  required
                  placeholder="Enter partner name..."
                  className="w-full p-3 lg:p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                />
              </div>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPartner(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors"
                >
                  {editingPartner ? 'Update' : 'Add'} Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Partners Grid */}
      {partners.length === 0 ? (
        <div className="text-center py-12 lg:py-16">
          <div className="p-6 bg-gray-50 rounded-3xl w-20 h-20 lg:w-24 lg:h-24 mx-auto mb-6 flex items-center justify-center">
            <User className="h-10 w-10 lg:h-12 lg:w-12 text-gray-400" />
          </div>
          <p className="text-lg lg:text-xl text-gray-500 mb-2">No partners yet</p>
          <p className="text-gray-400 mb-6 lg:mb-8 text-sm lg:text-base">Add your first partner to get started</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-8 py-3 rounded-2xl text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-all duration-300"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Partner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 max-w-6xl mx-auto">
          {partners.map((partner) => {
            const usage = getPartnerUsage(partner.id);
            const hasUsage = usage.deliveryCount > 0 || usage.settlementCount > 0;
            
            return (
              <div key={partner.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                {/* Partner Avatar */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white text-xl font-medium">
                      {partner.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1 break-words">{partner.name}</h3>
                  <p className="text-xs lg:text-sm text-gray-500">Added {formatDate(partner.createdAt)}</p>
                </div>

                {/* Usage Stats */}
                <div className="space-y-3 mb-6">
                  {usage.deliveryCount > 0 && (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                      <span className="text-sm text-green-700">Deliveries</span>
                      <span className="text-sm font-medium text-green-800">{usage.deliveryCount}</span>
                    </div>
                  )}
                  {usage.settlementCount > 0 && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                      <span className="text-sm text-blue-700">Settlements</span>
                      <span className="text-sm font-medium text-blue-800">{usage.settlementCount}</span>
                    </div>
                  )}
                  {!hasUsage && (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-400">No activity yet</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(partner)}
                    className="flex-1 flex items-center justify-center p-3 text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    <span className="text-sm">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(partner)}
                    className="flex-1 flex items-center justify-center p-3 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                  >
                    {hasUsage && <AlertTriangle className="h-4 w-4 mr-1" />}
                    <Trash2 className="h-4 w-4 mr-2" />
                    <span className="text-sm">Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Settings;
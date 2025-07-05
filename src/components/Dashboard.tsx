import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff, Package, DollarSign, Calendar, MapPin, User, FileText, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { deliveries, settlements, getPartnerById } = useApp();
  const [showAmounts, setShowAmounts] = useState(false);

  // Calculate last 7 days stats for deliveries
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

  // Calculate last 30 days stats for settlements
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

  const recentDeliveries = deliveries.filter(d => d.date >= sevenDaysAgoStr);
  const recentSettlements = settlements.filter(s => s.fromDate >= thirtyDaysAgoStr);

  const totalQuantity = recentDeliveries.reduce((sum, d) => sum + d.quantity, 0);
  const totalBoxes = recentDeliveries.reduce((sum, d) => sum + d.boxes, 0);
  const totalSettlementAmount = recentSettlements.reduce((sum, s) => sum + s.amountPaid, 0);

  // Get latest records
  const latestDelivery = deliveries
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const latestSettlement = settlements
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl lg:text-4xl font-light text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-500 text-sm lg:text-base">Overview of your greenhouse operations</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <div className="p-3 bg-green-50 rounded-xl">
              <Package className="h-5 w-5 lg:h-6 lg:w-6 text-green-600" />
            </div>
            <div className="text-right">
              <p className="text-xs lg:text-sm text-gray-500 mb-1">Delivery Stats (Last 7 Days)</p>
              <p className="text-2xl lg:text-3xl font-light text-gray-900">{totalQuantity}</p>
              <p className="text-xs lg:text-sm text-gray-400">kg • {totalBoxes} boxes</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <div className="p-3 bg-green-50 rounded-xl">
              <DollarSign className="h-5 w-5 lg:h-6 lg:w-6 text-green-600" />
            </div>
            <div className="text-right">
              <p className="text-xs lg:text-sm text-gray-500 mb-1">Settlement Stats (Last 30 Days)</p>
              <div className="flex items-center justify-end space-x-2 lg:space-x-3">
                <p className="text-2xl lg:text-3xl font-light text-gray-900">
                  {showAmounts ? formatCurrency(totalSettlementAmount) : '••••••'}
                </p>
                <button
                  onClick={() => setShowAmounts(!showAmounts)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showAmounts ? <EyeOff className="h-4 w-4 lg:h-5 lg:w-5" /> : <Eye className="h-4 w-4 lg:h-5 lg:w-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Records */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
        {/* Latest Delivery */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 lg:mb-8 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-lg lg:text-xl font-light text-gray-900">Latest Delivery</h2>
            </div>
            <div className="flex space-x-2">
              <Link
                to="/deliveries"
                className="inline-flex items-center px-3 lg:px-4 py-2 rounded-xl text-xs lg:text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <ArrowRight className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                View All
              </Link>
              <Link
                to="/deliveries"
                className="inline-flex items-center px-3 lg:px-4 py-2 rounded-xl text-xs lg:text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                <Plus className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                Add New
              </Link>
            </div>
          </div>
          
          {latestDelivery ? (
            <div className="space-y-4 lg:space-y-6">
              <div className="flex items-center space-x-3 lg:space-x-4">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <Calendar className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs lg:text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-900 text-sm lg:text-base">{formatDate(latestDelivery.date)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 lg:space-x-4">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <Package className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs lg:text-sm text-gray-500">Quantity</p>
                  <p className="font-medium text-gray-900 text-sm lg:text-base">{latestDelivery.quantity} kg • {latestDelivery.boxes} boxes</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 lg:space-x-4">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <User className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs lg:text-sm text-gray-500">Recipient</p>
                  <p className="font-medium text-gray-900 text-sm lg:text-base">{getPartnerById(latestDelivery.recipientId)?.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 lg:space-x-4">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <MapPin className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs lg:text-sm text-gray-500">Destination</p>
                  <p className="font-medium text-gray-900 text-sm lg:text-base break-words">{latestDelivery.destination}</p>
                </div>
              </div>

              {latestDelivery.notes && (
                <div className="flex items-start space-x-3 lg:space-x-4">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <FileText className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs lg:text-sm text-gray-500">Notes</p>
                    <p className="font-medium text-gray-900 text-sm lg:text-base break-words">{latestDelivery.notes}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 lg:py-12">
              <div className="p-4 bg-gray-50 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2">No deliveries yet</p>
              <p className="text-sm text-gray-400 mb-6">Add your first delivery to get started</p>
              <Link
                to="/deliveries"
                className="inline-flex items-center px-6 py-3 rounded-xl text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Delivery
              </Link>
            </div>
          )}
        </div>

        {/* Latest Settlement */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 lg:mb-8 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-lg lg:text-xl font-light text-gray-900">Latest Settlement</h2>
            </div>
            <div className="flex space-x-2">
              <Link
                to="/settlements"
                className="inline-flex items-center px-3 lg:px-4 py-2 rounded-xl text-xs lg:text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <ArrowRight className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                View All
              </Link>
              <Link
                to="/settlements"
                className="inline-flex items-center px-3 lg:px-4 py-2 rounded-xl text-xs lg:text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                <Plus className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                Add New
              </Link>
            </div>
          </div>
          
          {latestSettlement ? (
            <div className="space-y-4 lg:space-y-6">
              <div className="flex items-center space-x-3 lg:space-x-4">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <Calendar className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs lg:text-sm text-gray-500">Period</p>
                  <p className="font-medium text-gray-900 text-sm lg:text-base">
                    {formatDate(latestSettlement.fromDate)} - {formatDate(latestSettlement.toDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 lg:space-x-4">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <User className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs lg:text-sm text-gray-500">Recipient</p>
                  <p className="font-medium text-gray-900 text-sm lg:text-base">{getPartnerById(latestSettlement.recipientId)?.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 lg:space-x-4">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <Package className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs lg:text-sm text-gray-500">Quantity</p>
                  <p className="font-medium text-gray-900 text-sm lg:text-base">{latestSettlement.quantity} kg</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 lg:space-x-4">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs lg:text-sm text-gray-500">Amount</p>
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 text-sm lg:text-base">
                      {showAmounts ? formatCurrency(latestSettlement.amountPaid) : '••••••'}
                    </p>
                    <button
                      onClick={() => setShowAmounts(!showAmounts)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showAmounts ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {latestSettlement.notes && (
                <div className="flex items-start space-x-3 lg:space-x-4">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <FileText className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs lg:text-sm text-gray-500">Notes</p>
                    <p className="font-medium text-gray-900 text-sm lg:text-base break-words">{latestSettlement.notes}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 lg:py-12">
              <div className="p-4 bg-gray-50 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <DollarSign className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2">No settlements yet</p>
              <p className="text-sm text-gray-400 mb-6">Add your first settlement to get started</p>
              <Link
                to="/settlements"
                className="inline-flex items-center px-6 py-3 rounded-xl text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Settlement
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
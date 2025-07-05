import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Download, Filter, X } from 'lucide-react';
import jsPDF from 'jspdf';

const Report: React.FC = () => {
  const { deliveries, settlements, getPartnerById } = useApp();
  
  const [reportType, setReportType] = useState<'deliveries' | 'settlements' | 'both'>('both');
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    recipientId: '',
  });
  
  const [deliveryFields, setDeliveryFields] = useState({
    date: true,
    quantity: true,
    boxes: true,
    recipient: true,
    destination: true,
    notes: true,
  });

  const [settlementFields, setSettlementFields] = useState({
    dateRange: true,
    recipient: true,
    quantity: true,
    amountPaid: true,
    notes: true,
  });

  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const filterData = () => {
    let filteredDeliveries = deliveries;
    let filteredSettlements = settlements;

    // Apply filters
    if (filters.dateFrom) {
      filteredDeliveries = filteredDeliveries.filter(d => d.date >= filters.dateFrom);
      filteredSettlements = filteredSettlements.filter(s => s.fromDate >= filters.dateFrom);
    }
    if (filters.dateTo) {
      filteredDeliveries = filteredDeliveries.filter(d => d.date <= filters.dateTo);
      filteredSettlements = filteredSettlements.filter(s => s.toDate <= filters.dateTo);
    }
    if (filters.recipientId) {
      filteredDeliveries = filteredDeliveries.filter(d => d.recipientId === filters.recipientId);
      filteredSettlements = filteredSettlements.filter(s => s.recipientId === filters.recipientId);
    }

    // Sort data
    if (sortBy === 'date') {
      filteredDeliveries.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
      filteredSettlements.sort((a, b) => {
        const dateA = new Date(a.fromDate).getTime();
        const dateB = new Date(b.fromDate).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    } else if (sortBy === 'quantity') {
      filteredDeliveries.sort((a, b) => {
        return sortOrder === 'asc' ? a.quantity - b.quantity : b.quantity - a.quantity;
      });
      filteredSettlements.sort((a, b) => {
        return sortOrder === 'asc' ? a.quantity - b.quantity : b.quantity - a.quantity;
      });
    } else if (sortBy === 'amount' && reportType !== 'deliveries') {
      filteredSettlements.sort((a, b) => {
        return sortOrder === 'asc' ? a.amountPaid - b.amountPaid : b.amountPaid - a.amountPaid;
      });
    }

    return { filteredDeliveries, filteredSettlements };
  };

  const generatePDF = () => {
    const { filteredDeliveries, filteredSettlements } = filterData();
    
    const doc = new jsPDF();
    let yPosition = 30;
    
    // Title
    doc.setFontSize(24);
    doc.setFont('helvetica', 'normal');
    doc.text('Greenhouse Report', 20, yPosition);
    yPosition += 15;
    
    // Date range
    doc.setFontSize(12);
    doc.setTextColor(100);
    if (filters.dateFrom || filters.dateTo) {
      const fromDate = filters.dateFrom ? formatDate(filters.dateFrom) : 'All time';
      const toDate = filters.dateTo ? formatDate(filters.dateTo) : 'Present';
      doc.text(`Period: ${fromDate} - ${toDate}`, 20, yPosition);
      yPosition += 8;
    }
    
    // Recipient filter
    if (filters.recipientId) {
      const recipient = getPartnerById(filters.recipientId);
      doc.text(`Recipient: ${recipient?.name || 'Unknown'}`, 20, yPosition);
      yPosition += 8;
    }
    
    yPosition += 10;
    
    // Deliveries section
    if (reportType === 'deliveries' || reportType === 'both') {
      doc.setFontSize(18);
      doc.setTextColor(0);
      doc.text('DELIVERIES', 20, yPosition);
      yPosition += 15;
      
      doc.setFontSize(10);
      doc.setTextColor(60);
      
      filteredDeliveries.forEach((delivery, index) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        
        let line = `${index + 1}. `;
        if (deliveryFields.date) line += `Date: ${formatDate(delivery.date)} | `;
        if (deliveryFields.quantity) line += `Qty: ${delivery.quantity}kg | `;
        if (deliveryFields.boxes) line += `Boxes: ${delivery.boxes} | `;
        if (deliveryFields.recipient) line += `Recipient: ${getPartnerById(delivery.recipientId)?.name || 'Unknown'} | `;
        if (deliveryFields.destination) line += `Destination: ${delivery.destination} | `;
        
        doc.text(line, 20, yPosition);
        yPosition += 6;
        
        if (deliveryFields.notes && delivery.notes) {
          doc.text(`   Notes: ${delivery.notes}`, 20, yPosition);
          yPosition += 6;
        }
        
        yPosition += 3;
      });
      
      yPosition += 15;
    }
    
    // Settlements section
    if (reportType === 'settlements' || reportType === 'both') {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(18);
      doc.setTextColor(0);
      doc.text('SETTLEMENTS', 20, yPosition);
      yPosition += 15;
      
      doc.setFontSize(10);
      doc.setTextColor(60);
      
      filteredSettlements.forEach((settlement, index) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        
        let line = `${index + 1}. `;
        if (settlementFields.dateRange) line += `Period: ${formatDate(settlement.fromDate)} - ${formatDate(settlement.toDate)} | `;
        if (settlementFields.recipient) line += `Recipient: ${getPartnerById(settlement.recipientId)?.name || 'Unknown'} | `;
        if (settlementFields.quantity) line += `Qty: ${settlement.quantity}kg | `;
        if (settlementFields.amountPaid) line += `Amount: ${formatCurrency(settlement.amountPaid)} | `;
        
        doc.text(line, 20, yPosition);
        yPosition += 6;
        
        if (settlementFields.notes && settlement.notes) {
          doc.text(`   Notes: ${settlement.notes}`, 20, yPosition);
          yPosition += 6;
        }
        
        yPosition += 3;
      });
    }
    
    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `greenhouse-report-${timestamp}.pdf`;
    
    doc.save(filename);
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl lg:text-4xl font-light text-gray-900 mb-2">Report Generator</h1>
        <p className="text-gray-500 text-sm lg:text-base">Export custom PDF reports</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
          <div className="space-y-6 lg:space-y-8">
            {/* Content Type Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Report Content</label>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="reportType"
                    value="deliveries"
                    checked={reportType === 'deliveries'}
                    onChange={(e) => setReportType(e.target.value as 'deliveries')}
                    className="mr-3 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm">Deliveries Only</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="reportType"
                    value="settlements"
                    checked={reportType === 'settlements'}
                    onChange={(e) => setReportType(e.target.value as 'settlements')}
                    className="mr-3 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm">Settlements Only</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="reportType"
                    value="both"
                    checked={reportType === 'both'}
                    onChange={(e) => setReportType(e.target.value as 'both')}
                    className="mr-3 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm">Both</span>
                </label>
              </div>
            </div>

            {/* Filters */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-6">Filter Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
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
                    {useApp().partners.map(partner => (
                      <option key={partner.id} value={partner.id}>{partner.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Fields to Include */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-6">Fields to Include</h3>
              
              {(reportType === 'deliveries' || reportType === 'both') && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-800 mb-4">Delivery Fields</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(deliveryFields).map(([field, checked]) => (
                      <label key={field} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => setDeliveryFields({
                            ...deliveryFields,
                            [field]: e.target.checked
                          })}
                          className="mr-3 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm capitalize">{field.replace(/([A-Z])/g, ' $1')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {(reportType === 'settlements' || reportType === 'both') && (
                <div>
                  <h4 className="text-md font-medium text-gray-800 mb-4">Settlement Fields</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(settlementFields).map(([field, checked]) => (
                      <label key={field} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => setSettlementFields({
                            ...settlementFields,
                            [field]: e.target.checked
                          })}
                          className="mr-3 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm capitalize">{field.replace(/([A-Z])/g, ' $1')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sorting */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-6">Sorting</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                  >
                    <option value="date">Date</option>
                    <option value="quantity">Quantity</option>
                    {reportType !== 'deliveries' && <option value="amount">Amount</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="pt-6 border-t border-gray-200 text-center">
              <button
                onClick={generatePDF}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-2xl text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <Download className="h-5 w-5 mr-3" />
                Generate PDF Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

function OrdersPage() {
  const { orders = [] } = useAppContext(); // default to empty array
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('all');

  const statusConfig = {
    'Pending': { color: 'bg-gray-100 text-gray-800 border-gray-300', icon: 'P', progress: 0 },
    'Processing': { color: 'bg-amber-100 text-amber-800 border-amber-300', icon: 'R', progress: 25 },
    'Shipped': { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: 'S', progress: 75 },
    'Delivered': { color: 'bg-green-100 text-green-800 border-green-300', icon: 'D', progress: 100 },
    'Cancelled': { color: 'bg-red-100 text-red-800 border-red-300', icon: 'C', progress: 0 }
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const getStatusBadge = (status) => (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusConfig[status]?.color || ''}`}>
      <span className="mr-1">{statusConfig[status]?.icon || ''}</span>
      {status || 'Unknown'}
    </span>
  );

  const getProgressBar = (status) => (
    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
      <div
        className="h-2 rounded-full transition-all duration-500 ease-in-out"
        style={{ 
          width: `${statusConfig[status]?.progress || 0}%`,
          backgroundColor: status === 'Delivered' ? '#10B981' : 
                          status === 'Shipped' ? '#3B82F6' :
                          status === 'Processing' ? '#F59E0B' : '#6B7280'
        }}
      ></div>
    </div>
  );

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto h-24 w-24 text-gray-400 mb-4">📦</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
          <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
          <button 
            onClick={() => navigate('/shop')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-transform"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Your Orders</h1>
          <p className="text-gray-600 text-lg">Track and manage your purchases</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              filterStatus === 'all'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            All Orders ({orders.length})
          </button>
          {Object.keys(statusConfig).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                filterStatus === status
                  ? `${statusConfig[status].color.split(' ')[0].replace('bg-', 'bg-')} ${statusConfig[status].color.split(' ')[1]} border shadow-lg`
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {status} ({orders.filter(order => order.status === status).length})
            </button>
          ))}
        </div>

        {/* Orders Grid */}
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200">
              {/* Order Header */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <span className="text-2xl">📦</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Order #{order.id}</h3>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.date).toLocaleDateString('en-US', { 
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 lg:mt-0">
                    {getStatusBadge(order.status)}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="px-6 pt-4">
                {getProgressBar(order.status)}
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>Order Placed</span>
                  <span>Processing</span>
                  <span>Shipped</span>
                  <span>Delivered</span>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Order Items */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Items</h4>
                    <div className="space-y-3">
                      {order.items?.map((item, index) => (
                        <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                            <span className="text-lg">👕</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{item.name}</p>
                            <p className="text-sm text-gray-600">
                              Size: {item.size} • Qty: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">KES {item.price.toLocaleString()}</p>
                            <p className="text-sm text-gray-600">
                              KES {(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )) || <p className="text-gray-500">No items</p>}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="space-y-6">
                    {/* Shipping Address */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Shipping Address</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-medium text-gray-900">{order.shippingAddress?.fullName || 'N/A'}</p>
                        <p className="text-gray-600">{order.shippingAddress?.addressLine1 || ''}</p>
                        <p className="text-gray-600">
                          {order.shippingAddress?.city || ''}, {order.shippingAddress?.county || ''}
                        </p>
                        {order.shippingAddress?.phone && (
                          <p className="text-gray-600 mt-1">📞 {order.shippingAddress.phone}</p>
                        )}
                      </div>
                    </div>

                    {/* Order Total */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-gray-900">KES {order.subtotal?.toLocaleString() || order.total?.toLocaleString() || '0'}</span>
                      </div>
                      {order.shipping && (
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Shipping</span>
                          <span className="text-gray-900">KES {order.shipping.toLocaleString()}</span>
                        </div>
                      )}
                      {order.discount && (
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Discount</span>
                          <span className="text-green-600">-KES {order.discount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <span className="font-semibold text-gray-900">Total Amount</span>
                        <span className="text-xl font-bold text-gray-900">KES {order.total?.toLocaleString() || '0'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
                  <button 
                    onClick={() => navigate('/shop')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-transform"
                  >
                    Order Again
                  </button>
                  <button className="bg-white text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium border border-gray-300">
                    Track Order
                  </button>
                  <button className="bg-white text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium border border-gray-300">
                    View Invoice
                  </button>
                  {order.status === 'Processing' && (
                    <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium ml-auto">
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty Filter State */}
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-20 w-20 text-gray-400 mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">No orders match the selected filter</p>
            <button
              onClick={() => setFilterStatus('all')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View All Orders
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdersPage;

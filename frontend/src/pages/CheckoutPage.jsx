import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

function CheckoutPage() {
  const { cart, user, clearCart, placeOrder, userAddresses } = useAppContext(); 
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState({
    full_name: '',
    phone_number: '',
    address_line1: '',
    address_line2: '',
    city: '',
    county: '',
    postal_code: ''
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const subtotal = cart.reduce((sum, item) => {
    const price = item.current_price || item.price;
    return sum + (price * item.quantity);
  }, 0);
  const shipping = 200;
  const total = subtotal + shipping;

  const formatPhoneNumber = (phone) => {
    let cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    }
    
    if (cleaned.startsWith('+254')) {
      cleaned = '254' + cleaned.substring(4);
    }
    
    return cleaned;
  };

  // const initiatePayment = async (orderData) => {
  //   try {
  //     const token = localStorage.getItem('access_token');
  //     const formattedPhone = formatPhoneNumber(phoneNumber);
      
  //     const paymentPayload = {
  //       order_id: orderData.id,
  //       phone_number: formattedPhone, // This is required by payments endpoint
  //       amount: total,
  //       // Check if payments endpoint also needs items
  //       items: orderData.items?.map(item => ({
  //         product_id: item.product_id || item.product?.id,
  //         quantity: item.quantity
  //       }))
  //     };

  //     console.log('Initiating payment with payload:', paymentPayload);

  //     const response = await fetch('http://localhost:8000/api/payments/initiate/', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${token}`,
  //       },
  //       body: JSON.stringify(paymentPayload)
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       console.error('Payment initiation error:', errorData);
  //       throw new Error(errorData.error || 'Payment initiation failed');
  //     }

  //     const paymentData = await response.json();
  //     return paymentData;
  //   } catch (error) {
  //     console.error('Payment initiation error:', error);
  //     throw new Error(error.message || 'Failed to initiate payment. Please try again.');
  //   }
  // };

  const initiatePayment = async (orderData) => {
  try {
    const token = localStorage.getItem('access_token');
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    const paymentPayload = {
      order_id: orderData.id, // Send the existing order ID
      phone_number: formattedPhone, // Phone number for M-PESA
      // Remove items and shipping_address - they're not needed
    };

    console.log('Initiating payment with payload:', paymentPayload);

    const response = await fetch('http://localhost:8000/api/payments/initiate/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(paymentPayload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Payment initiation error:', errorData);
      throw new Error(errorData.error || 'Payment initiation failed');
    }

    const paymentData = await response.json();
    return paymentData;
  } catch (error) {
    console.error('Payment initiation error:', error);
    throw new Error(error.message || 'Failed to initiate payment. Please try again.');
  }
};
  const checkPaymentStatus = async (orderId, maxAttempts = 30) => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`http://localhost:8000/api/payments/status/${orderId}/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        if (response.ok) {
          const statusData = await response.json();
          
          if (statusData.status === 'completed') {
            return { success: true, data: statusData };
          } else if (statusData.status === 'failed') {
            return { success: false, error: 'Payment failed or was cancelled' };
          }
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }

    return { success: false, error: 'Payment timeout. Please check your M-PESA messages.' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      alert('Please login to continue');
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    // Validate phone number
    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (formattedPhone.length !== 12 || !formattedPhone.startsWith('254')) {
      setError('Please enter a valid Kenyan phone number (e.g., 0712345678)');
      return;
    }

    setProcessing(true);

    try {
      // 1. Prepare order items
      const orderItems = cart.map(item => {
        if (!item.id || typeof item.id !== 'number') {
          throw new Error(`Invalid product ID for ${item.name}`);
        }

        return {
          product_id: item.id,
          quantity: item.quantity,
        };
      });

      console.log('Order items being sent:', orderItems);

      // 2. Prepare order data
      const orderData = {
        address: {
          full_name: address.full_name,
          phone_number: formattedPhone,
          address_line1: address.address_line1,
          address_line2: address.address_line2 || '',
          city: address.city,
          county: address.county,
          postal_code: address.postal_code || '',
          is_default: false
        },
        items: orderItems,
        notes: ''
      };

      console.log('Full order data being sent to placeOrder:', orderData);

      // 3. This will create address first, then order with address_id
      const order = await placeOrder(orderData);
      
      if (!order || !order.id) {
        throw new Error('Failed to create order');
      }

      console.log('✅ Order created successfully:', order);
      console.log('Initiating payment for order:', order.id);

      // 4. Initiate M-PESA payment
      const paymentResponse = await initiatePayment(order);
      
      if (paymentResponse && paymentResponse.success) {
        alert('M-PESA payment initiated! Please check your phone to complete the payment.');
        
        // 5. Poll for payment status
        const statusResult = await checkPaymentStatus(order.id);
        
        if (statusResult.success) {
          alert(`Order #${order.order_number} placed successfully! Payment confirmed.`);
          navigate('/orders');
        } else {
          setError(statusResult.error || 'Payment verification failed. Please check your order status.');
        }
      } else {
        throw new Error('Failed to initiate M-PESA payment');
      }

    } catch (error) {
      console.error('Checkout error:', error);
      setError(error.message || 'An error occurred during checkout. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Render existing addresses if available
  const renderExistingAddresses = () => {
    if (userAddresses.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Saved Addresses</h3>
        <div className="space-y-2">
          {userAddresses.map((addr) => (
            <div 
              key={addr.id} 
              className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50"
              onClick={() => {
                setAddress({
                  full_name: addr.full_name,
                  phone_number: addr.phone_number,
                  address_line1: addr.address_line1,
                  address_line2: addr.address_line2 || '',
                  city: addr.city,
                  county: addr.county,
                  postal_code: addr.postal_code || ''
                });
                setPhoneNumber(addr.phone_number);
              }}
            >
              <p className="font-medium">{addr.full_name}</p>
              <p className="text-sm text-gray-600">{addr.address_line1}, {addr.city}, {addr.county}</p>
              <p className="text-sm text-gray-600">{addr.phone_number}</p>
              <p className="text-xs text-blue-600 mt-1">Click to use this address</p>
            </div>
          ))}
        </div>
        <div className="text-center my-4">
          <span className="text-gray-500">OR</span>
        </div>
        <h3 className="text-lg font-semibold mb-3">New Shipping Address</h3>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Shipping Information */}
          <div>
            <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
            
            {renderExistingAddresses()}
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={address.full_name}
                onChange={(e) => setAddress({...address, full_name: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={address.phone_number}
                onChange={(e) => setAddress({...address, phone_number: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
              <input
                type="text"
                placeholder="Address Line 1"
                value={address.address_line1}
                onChange={(e) => setAddress({...address, address_line1: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
              <input
                type="text"
                placeholder="Address Line 2 (Optional)"
                value={address.address_line2}
                onChange={(e) => setAddress({...address, address_line2: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <input
                type="text"
                placeholder="City"
                value={address.city}
                onChange={(e) => setAddress({...address, city: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
              <input
                type="text"
                placeholder="County"
                value={address.county}
                onChange={(e) => setAddress({...address, county: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
              <input
                type="text"
                placeholder="Postal Code (Optional)"
                value={address.postal_code}
                onChange={(e) => setAddress({...address, postal_code: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <h2 className="text-xl font-bold mt-8 mb-4">M-PESA Payment</h2>
            <input
              type="tel"
              placeholder="M-PESA Phone Number (e.g., 0712345678)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
            <p className="text-sm text-gray-600 mt-2">
              You will receive an M-PESA prompt on this number to complete payment.
            </p>
          </div>

          {/* Order Summary */}
          <div>
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="space-y-3 mb-4">
                {cart.map((item) => {
                  const price = item.current_price || item.price;
                  return (
                    <div key={`${item.id}-${item.selectedSize}`} className="flex justify-between text-sm">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <br />
                        <span className="text-gray-600">
                          {item.selectedSize && `Size: ${item.selectedSize} × `}{item.quantity}
                        </span>
                      </div>
                      <span>KES {(price * item.quantity).toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>KES {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>KES {shipping.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>KES {total.toLocaleString()}</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={processing || cart.length === 0}
                className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {processing ? 'Processing Payment...' : 'Place Order & Pay with M-PESA'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CheckoutPage;
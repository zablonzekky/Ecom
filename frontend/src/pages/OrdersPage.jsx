import React, { useEffect } from "react";
import { useAppContext } from "../context/AppContext";

const statusStyles = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-purple-50 text-purple-700 border-purple-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function OrdersPage() {
  const { orders, fetchUserOrders } = useAppContext();
  useEffect(() => { fetchUserOrders(); }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white border rounded-xl p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <p className="text-sm text-gray-500">Order #{order.order_number}</p>
                <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs border font-semibold ${statusStyles[order.status] || statusStyles.pending}`}>{order.status}</span>
            </div>
            <div className="divide-y">{(order.items || []).map((item) => <div key={item.id} className="py-2 flex justify-between text-sm"><span>{item.product_name} × {item.quantity}</span><span>KES {Number(item.price).toLocaleString()}</span></div>)}</div>
            <div className="mt-3 text-right font-semibold">Total: KES {Number(order.total).toLocaleString()}</div>
          </div>
        ))}
        {orders.length === 0 && <div className="bg-white border rounded-xl p-6 text-gray-600">No orders yet.</div>}
      </div>
    </div>
  );
}

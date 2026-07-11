"use client";

import React, { useState } from "react";

type OrderItem = {
  id: string;
  variantId: string;
  quantity: number;
  unitPrice: string;
  personalization: any;
  variant: {
    sku: string;
    optionValues: any;
    product: {
      name: string;
      images: Array<{ url: string }>;
    };
  };
};

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: string;
  taxTotal: string;
  shippingTotal: string;
  discountTotal: string;
  grandTotal: string;
  fulfillmentMethod: string;
  placedAt: string;
  createdAt: string;
  shippingAddress: any;
  billingAddress: any;
  items: OrderItem[];
  returnRequests?: Array<{ id: string; reason: string; status: string; createdAt: string }>;
};

interface OrdersTabProps {
  initialOrders: Order[];
  onReorder: (orderId: string) => Promise<void>;
}

export function OrdersTab({ initialOrders, onReorder }: OrdersTabProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Return request states
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnReason, setReturnReason] = useState("Defective/Damaged");
  const [photoUrl, setPhotoUrl] = useState("");
  const [returnMsg, setReturnMsg] = useState<string | null>(null);
  const [reorderLoading, setReorderLoading] = useState<string | null>(null);

  const viewOrderDetails = async (orderId: string) => {
    try {
      const res = await fetch(`/api/v1/account/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedOrder(data.order);
        setShowReturnForm(false);
        setReturnMsg(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReturnRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setReturnMsg(null);

    try {
      const res = await fetch(`/api/v1/account/orders/${selectedOrder.id}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: returnReason, photoUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit return request");

      setReturnMsg("Return request submitted successfully.");
      // Refresh order details to update status list
      await viewOrderDetails(selectedOrder.id);
    } catch (err: any) {
      setReturnMsg(err.message);
    }
  };

  const handleReorderClick = async (orderId: string) => {
    setReorderLoading(orderId);
    try {
      await onReorder(orderId);
    } catch (err) {
      console.error(err);
    } finally {
      setReorderLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "shipped":
        return "bg-sky-500/10 text-sky-400 border-sky-500/20";
      case "in_production":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "paid":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case "pending_payment":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-neutral-500/10 text-neutral-400 border-neutral-500/20";
    }
  };

  const getFulfillmentLabel = (method: string) => {
    return method === "pickup" ? "Local Pickup (Orange, CT)" : "Shipping";
  };

  const triggerInvoiceDownload = (order: Order) => {
    const invoiceContent = `
=============================================
             MIDNIGHT CREATIONS USA          
                  INVOICE / RECEIPT          
=============================================
Order: ${order.orderNumber}
Date: ${new Date(order.placedAt).toLocaleDateString()}
Fulfillment: ${order.fulfillmentMethod.toUpperCase()}

SHIPPING ADDRESS:
${order.shippingAddress?.fullName}
${order.shippingAddress?.line1} ${order.shippingAddress?.line2 || ""}
${order.shippingAddress?.city}, ${order.shippingAddress?.state} ${order.shippingAddress?.postalCode}

ITEMS PURCHASED:
${order.items
  .map(
    (item) =>
      `- ${item.variant.product.name} (QTY: ${item.quantity}) - $${Number(item.unitPrice).toFixed(2)} ea
   SKU: ${item.variant.sku}
   Details: ${JSON.stringify(item.personalization)}`,
  )
  .join("\n")}

PRICING BREAKDOWN:
Subtotal:        $${Number(order.subtotal).toFixed(2)}
Tax (6.35%):     $${Number(order.taxTotal).toFixed(2)}
Shipping:        $${Number(order.shippingTotal).toFixed(2)}
Discount:       -$${Number(order.discountTotal).toFixed(2)}
---------------------------------------------
Grand Total:     $${Number(order.grandTotal).toFixed(2)}
=============================================
   Thank you for shopping local in Connecticut!
=============================================
    `;

    const blob = new Blob([invoiceContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${order.orderNumber}.txt`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-fadeIn text-white">
      <h2 className="text-xl font-semibold">Order History</h2>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Orders List */}
        <div className="md:col-span-2 space-y-4">
          {orders.length === 0 ? (
            <p className="text-sm text-neutral-400">No past orders found.</p>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:border-indigo-400/50"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
                  <div>
                    <p className="text-sm font-semibold text-white">{order.orderNumber}</p>
                    <p className="text-xs text-neutral-400">
                      Placed on {new Date(order.placedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider border ${getStatusColor(
                        order.status,
                      )}`}
                    >
                      {order.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <div className="flex -space-x-4 overflow-hidden">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <div
                        key={item.id}
                        className="h-12 w-12 rounded-lg border border-neutral-800 bg-neutral-900 overflow-hidden relative"
                      >
                        <img
                          src={item.variant.product.images[0]?.url || "/placeholder.jpg"}
                          alt="Product thumbnail"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950 text-xs font-semibold text-neutral-400">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-neutral-400 truncate">
                      {order.items.map((i) => i.variant.product.name).join(", ")}
                    </p>
                    <p className="text-sm font-bold mt-1 text-white">
                      ${Number(order.grandTotal).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => viewOrderDetails(order.id)}
                    className="rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-semibold hover:bg-neutral-700 cursor-pointer"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleReorderClick(order.id)}
                    disabled={reorderLoading === order.id}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold hover:bg-indigo-500 disabled:opacity-50 cursor-pointer"
                  >
                    {reorderLoading === order.id ? "Adding..." : "Buy Again"}
                  </button>
                  {order.status.toLowerCase() === "shipped" && (
                    <a
                      href="https://www.ups.com/track"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-400 hover:bg-indigo-500/20"
                    >
                      Track Package
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Details Panel */}
        <div className="md:col-span-1">
          {selectedOrder ? (
            <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 backdrop-blur space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h3 className="font-semibold text-white">{selectedOrder.orderNumber}</h3>
                  <button
                    onClick={() => triggerInvoiceDownload(selectedOrder)}
                    className="text-xs text-indigo-400 hover:underline text-left mt-1 cursor-pointer"
                  >
                    Download Invoice (TXT)
                  </button>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-xs text-neutral-400 hover:text-white cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Order Items</h4>
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded bg-neutral-800 shrink-0">
                      <img
                        src={item.variant.product.images[0]?.url || "/placeholder.jpg"}
                        alt="Product"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-white truncate">{item.variant.product.name}</p>
                      <p className="text-[10px] text-neutral-400">
                        QTY: {item.quantity} × ${Number(item.unitPrice).toFixed(2)}
                      </p>
                      {item.personalization && Object.keys(item.personalization).length > 0 && (
                        <div className="mt-1 rounded bg-white/5 p-1 text-[9px] text-indigo-300">
                          {Object.entries(item.personalization).map(([k, v]) => (
                            <div key={k}>{k}: {String(v)}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div className="border-t border-white/5 pt-4 space-y-1.5 text-xs text-neutral-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white">${Number(selectedOrder.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Connecticut Tax (6.35%)</span>
                  <span className="text-white">${Number(selectedOrder.taxTotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-white">${Number(selectedOrder.shippingTotal).toFixed(2)}</span>
                </div>
                {Number(selectedOrder.discountTotal) > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span>-${Number(selectedOrder.discountTotal).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-white/5 pt-2 text-sm font-bold text-white">
                  <span>Total</span>
                  <span>${Number(selectedOrder.grandTotal).toFixed(2)}</span>
                </div>
              </div>

              {/* Shipping Details */}
              <div className="border-t border-white/5 pt-4 space-y-2 text-xs">
                <h4 className="font-bold uppercase tracking-wider text-neutral-400 text-[10px]">Fulfillment</h4>
                <p className="text-white">{getFulfillmentLabel(selectedOrder.fulfillmentMethod)}</p>
                {selectedOrder.shippingAddress && (
                  <div>
                    <p className="font-semibold text-neutral-300">Shipping To:</p>
                    <p className="text-neutral-400">{selectedOrder.shippingAddress.fullName}</p>
                    <p className="text-neutral-400">{selectedOrder.shippingAddress.line1}</p>
                    <p className="text-neutral-400">
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                    </p>
                  </div>
                )}
              </div>

              {/* Returns Request Section */}
              <div className="border-t border-white/5 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold uppercase tracking-wider text-neutral-400 text-[10px]">Returns / Exchanges</h4>
                  {!showReturnForm && !selectedOrder.returnRequests?.length && (
                    <button
                      onClick={() => setShowReturnForm(true)}
                      className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                    >
                      Request Return
                    </button>
                  )}
                </div>

                {selectedOrder.returnRequests && selectedOrder.returnRequests.length > 0 && (
                  <div className="rounded bg-white/5 p-3 text-xs space-y-1">
                    {selectedOrder.returnRequests.map((req) => (
                      <div key={req.id}>
                        <p className="font-semibold text-neutral-300">Status: <span className="text-indigo-300 capitalize">{req.status}</span></p>
                        <p className="text-[10px] text-neutral-500">Reason: {req.reason}</p>
                        <p className="text-[9px] text-neutral-500">Submitted: {new Date(req.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}

                {showReturnForm && (
                  <form onSubmit={handleReturnRequest} className="space-y-3">
                    <select
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      className="w-full rounded border border-white/10 bg-neutral-950 px-2 py-1.5 text-xs text-white"
                    >
                      <option value="Defective/Damaged">Defective/Damaged</option>
                      <option value="Wrong Item Received">Wrong Item Received</option>
                      <option value="Incorrect Personalization">Incorrect Personalization</option>
                      <option value="Changed Mind">Changed Mind</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Photo Link (e.g. defect proof)"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      className="w-full rounded border border-white/10 bg-neutral-950 px-2 py-1.5 text-xs text-white"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="rounded bg-indigo-600 px-3 py-1.5 text-[10px] font-semibold transition hover:bg-indigo-500 cursor-pointer"
                      >
                        Submit Request
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowReturnForm(false)}
                        className="rounded border border-white/10 px-3 py-1.5 text-[10px] transition hover:bg-white/5 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {returnMsg && <p className="text-xs text-indigo-300">{returnMsg}</p>}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/5 bg-neutral-950/20 p-6 text-center text-sm text-neutral-500">
              Select an order to view its invoice details and request exchanges.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

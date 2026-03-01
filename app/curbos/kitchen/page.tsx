'use client'

import { ChefHat, Clock } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { QRCodeSVG as QRCode } from 'qrcode.react'
import { KitchenOrderCard } from './components/KitchenOrderCard'
import { useKitchenOrders } from './hooks/useKitchenOrders'
import { Transaction } from './types'

/**
 * Kitchen Display System (KDS) page.
 * Displays real-time orders and allows kitchen staff to update status.
 */
export default function KitchenKDS() {
    const { orders, isLoading, updateStatus } = useKitchenOrders()
    const [selectedOrder, setSelectedOrder] = useState<Transaction | null>(null)

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#C0FF02]"></div>
            </div>
        )
    }

    return (
        <div className="p-4 tablet:p-6 font-sans">
            <div className="flex flex-col tablet:flex-row tablet:justify-between tablet:items-center gap-4 tablet:gap-0 mb-8 tablet:mb-12">
                <div>
                     <h2 className="text-2xl tablet:text-3xl desktop:text-4xl font-bold text-white mb-2">Kitchen Display</h2>
                     <p className="text-neutral-400 text-sm tablet:text-base flex items-center gap-2">
                        <Clock size={14} /> Realtime Orders
                     </p>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="h-[60vh] flex flex-col items-center justify-center text-neutral-600 gap-4">
                    <ChefHat size={64} className="text-[#C0FF02]" />
                    <p className="text-xl font-medium tracking-wide">NO ACTIVE ORDERS</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 tablet:grid-cols-3 desktop:grid-cols-4 large-desktop:grid-cols-5 gap-4 tablet:gap-6">
                    {orders.map((order) => (
                        <KitchenOrderCard
                            key={order.id}
                            order={order}
                            onSelect={setSelectedOrder}
                            onUpdateStatus={updateStatus}
                        />
                    ))}
                </div>
            )}

            {/* Order Detail Modal with QR Code */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                     onClick={() => setSelectedOrder(null)}>
                    <div className="bg-neutral-900 rounded-2xl p-8 max-w-lg w-full border border-neutral-800 shadow-2xl space-y-8"
                         onClick={(e) => e.stopPropagation()}>

                        <div className="text-center">
                             <h2 className="text-4xl font-black text-white mb-2">Order #{selectedOrder.order_number}</h2>
                             {selectedOrder.customer_name && (
                                <p className="text-xl text-neutral-400">{selectedOrder.customer_name}</p>
                             )}
                        </div>

                        <div className="bg-white p-6 rounded-xl mx-auto w-fit">
                            <QRCode
                                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/curbos/order/${selectedOrder.id}`}
                                size={256}
                            />
                        </div>

                        <div className="text-center space-y-2">
                             <p className="text-sm font-bold text-[#C0FF02] uppercase tracking-widest">
                                Status: {selectedOrder.fulfillment_status}
                             </p>
                             <p className="text-neutral-500 text-xs">Scan to track order on mobile</p>
                        </div>

                        <button
                            onClick={() => setSelectedOrder(null)}
                            className="w-full py-4 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            <footer className="mt-12 text-center">
                <Link href="/curbos" className="text-neutral-700 hover:text-white text-xs font-bold transition-colors">
                    BACK TO ADMIN PANEL
                </Link>
            </footer>
        </div>
    )
}

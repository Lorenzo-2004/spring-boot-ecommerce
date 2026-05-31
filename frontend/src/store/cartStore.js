import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],

            addItem: (product) => set(state => {
                const exists = state.items.find(i => i.id === product.id);
                if (exists) {
                    return { items: state.items.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i) };
                }
                return { items: [...state.items, { ...product, qty: 1 }] };
            }),

            removeItem: async (id) => {
                const user = JSON.parse(localStorage.getItem('user'));
                if (user) {
                    try {
                        const res = await fetch(`http://localhost:8080/api/orders/user/${user.id}/pending`);
                        if (res.ok) {
                            const pendingOrder = await res.json();
                            if (pendingOrder?.id) {
                                await fetch(`http://localhost:8080/api/orders/${pendingOrder.id}/cancel`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' }
                                });
                            }
                        }
                    } catch (e) {
                        console.log('No pending order to cancel');
                    }
                }
                set(state => ({ items: state.items.filter(i => i.id !== id) }));
            },

            updateQty: (id, qty) => set(state => ({
                items: state.items.map(i => i.id === id ? { ...i, qty } : i)
            })),

            setItems: (items) => set({ items }),

            getTotal: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),

            // Vide le panier et annule la commande PENDING (asynchrone)
            clearCart: async () => {
                const user = JSON.parse(localStorage.getItem('user'));
                if (user) {
                    try {
                        const res = await fetch(`http://localhost:8080/api/orders/user/${user.id}/pending`);
                        if (res.ok) {
                            const pendingOrder = await res.json();
                            if (pendingOrder?.id) {
                                await fetch(`http://localhost:8080/api/orders/${pendingOrder.id}/cancel`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' }
                                });
                            }
                        }
                    } catch (e) {
                        console.log('No pending order to cancel');
                    }
                }
                set({ items: [] });
            },

            clearCartOnly: () => set({ items: [] }),
        }),
        {
            name: 'cart-storage',
            getStorage: () => localStorage,
        }
    )
);

import { create } from "zustand"
import type { ProductoResponse } from "@/shared/types"

export interface CartItem {
  producto: ProductoResponse
  cantidad: number
}

interface CartStore {
  items: CartItem[]
  addItem: (producto: ProductoResponse, cantidad?: number) => void
  removeItem: (productoId: number) => void
  updateCantidad: (productoId: number, cantidad: number) => void
  clearCart: () => void
  total: () => number
  totalItems: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (producto, cantidad = 1) => {
    set((state) => {
      const existing = state.items.find((i) => i.producto.id === producto.id)
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.producto.id === producto.id
              ? { ...i, cantidad: Math.min(i.cantidad + cantidad, i.producto.stock) }
              : i
          ),
        }
      }
      return { items: [...state.items, { producto, cantidad: Math.min(cantidad, producto.stock) }] }
    })
  },

  removeItem: (productoId) => {
    set((state) => ({ items: state.items.filter((i) => i.producto.id !== productoId) }))
  },

  updateCantidad: (productoId, cantidad) => {
    if (cantidad <= 0) {
      get().removeItem(productoId)
      return
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.producto.id === productoId
          ? { ...i, cantidad: Math.min(cantidad, i.producto.stock) }
          : i
      ),
    }))
  },

  clearCart: () => set({ items: [] }),

  total: () => get().items.reduce((sum, i) => sum + i.producto.precio * i.cantidad, 0),

  totalItems: () => get().items.reduce((sum, i) => sum + i.cantidad, 0),
}))

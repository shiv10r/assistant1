import { useState } from 'react'

export type CommerceCartLine = {
  readonly productId: string
  readonly variantId: string
  readonly quantity: number
}

const CART_KEY = 'vsr-commerce-cart'
const WISHLIST_KEY = 'vsr-commerce-wishlist'

type CartLine = { readonly productId: string; readonly variantId: string; readonly quantity: number }

function readCart(): readonly CartLine[] {
  const raw = localStorage.getItem(CART_KEY)
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is CartLine => {
      if (typeof item !== 'object' || item === null) return false
      const candidate = item as Record<string, unknown>
      return typeof candidate.productId === 'string' && typeof candidate.variantId === 'string' && typeof candidate.quantity === 'number'
    })
  } catch (error) {
    if (error instanceof SyntaxError) return []
    throw error
  }
}

function readWishlist(): readonly string[] {
  const raw = localStorage.getItem(WISHLIST_KEY)
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : []
  } catch (error) {
    if (error instanceof SyntaxError) return []
    throw error
  }
}

export function useCommerceStore() {
  const [cart, setCart] = useState<readonly CartLine[]>(readCart)
  const [wishlist, setWishlist] = useState<readonly string[]>(readWishlist)

  function persistCart(next: readonly CartLine[]) {
    localStorage.setItem(CART_KEY, JSON.stringify(next))
    setCart(next)
  }

  function addToCart(productId: string, variantId: string, quantity: number) {
    const existing = cart.find((line) => line.productId === productId && line.variantId === variantId)
    const next = existing
      ? cart.map((line) => line === existing ? { ...line, quantity: line.quantity + quantity } : line)
      : [...cart, { productId, variantId, quantity }]
    persistCart(next)
  }

  function updateQuantity(productId: string, variantId: string, quantity: number) {
    if (quantity <= 0) {
      persistCart(cart.filter((line) => !(line.productId === productId && line.variantId === variantId)))
      return
    }
    persistCart(cart.map((line) => line.productId === productId && line.variantId === variantId ? { ...line, quantity } : line))
  }

  function removeLine(productId: string, variantId: string) {
    persistCart(cart.filter((line) => !(line.productId === productId && line.variantId === variantId)))
  }

  function clearCart() {
    persistCart([])
  }

  const cartCount = cart.reduce((total, line) => total + line.quantity, 0)

  function toggleWishlist(productId: string) {
    const next = wishlist.includes(productId) ? wishlist.filter((id) => id !== productId) : [...wishlist, productId]
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(next))
    setWishlist(next)
  }

  return { cart, cartCount, addToCart, updateQuantity, removeLine, clearCart, wishlist, wishlistCount: wishlist.length, toggleWishlist }
}
import axiosInstance from './axiosInstance'
import type { CartItem } from '@/types'

const sessionStorageKey = 'techshop-cart-session'

function getSessionId(): string {
    let sessionId = localStorage.getItem(sessionStorageKey)
    if (!sessionId) {
        sessionId = crypto.randomUUID()
        localStorage.setItem(sessionStorageKey, sessionId)
    }
    return sessionId
}

function sessionConfig() {
    return {
        headers: {
            'x-cart-session-id': getSessionId(),
        },
    }
}

export async function getCart(): Promise<CartItem[]> {
    const response = await axiosInstance.get('/cart', sessionConfig())
    return response.data
}

export async function addToCartApi(item: CartItem): Promise<CartItem> {
    const response = await axiosInstance.post('/cart', item, sessionConfig())
    return response.data
}

export async function updateCartItem(id: string, item: CartItem): Promise<CartItem> {
    const response = await axiosInstance.put(`/cart/${id}`, item, sessionConfig())
    return response.data
}

export async function removeFromCartApi(id: string): Promise<void> {
    await axiosInstance.delete(`/cart/${id}`, sessionConfig())
}

export async function clearCartApi(): Promise<void> {
    const currentCart = await getCart()
    await Promise.all(currentCart.map(item => removeFromCartApi(item.id!)))
}

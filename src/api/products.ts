import axiosInstance from './axiosInstance'
import type { Product, Category } from '../types/product'

export interface ProductResponse {
  data: Product[]
  total: number
}

export async function getCategories(): Promise<Category[]> {
  const response = await axiosInstance.get('/categories')
  return response.data
}

export async function getAllProducts(params?: {
  _page?: number
  _limit?: number
  _sort?: string
  _order?: 'asc' | 'desc'
  categoryId?: string
  q?: string
  featured?: boolean
}): Promise<Product[]> {
  const response = await axiosInstance.get('/products', { params })
  return response.data
}

export async function getProductById(id: string): Promise<Product> {
  const response = await axiosInstance.get(`/products/${id}`)
  return response.data
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const response = await axiosInstance.get('/products', {
    params: {
      featured: true,
    },
  })

  return response.data
}

export async function searchProducts(query: string): Promise<Product[]> {
  const response = await axiosInstance.get('/products', {
    params: {
      q: query,
    },
  })

  return response.data
}

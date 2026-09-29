import type { VercelRequest, VercelResponse } from '@vercel/node'
import fs from 'node:fs'
import path from 'node:path'

interface Product {
    id: string
    name: string
    description: string
    categoryId: string
    price: number
    featured?: boolean
}

interface Database {
    products: Product[]
}

export default function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const filePath = path.join(process.cwd(), 'db.json')
        const db: Database = JSON.parse(
            fs.readFileSync(filePath, 'utf-8')
        )

        let products = [...db.products]

        if (req.query.categoryId) {
            products = products.filter(
                product => product.categoryId === String(req.query.categoryId)
            )
        }

        if (req.query.featured === 'true') {
            products = products.filter(
                product => product.featured === true
            )
        }

        if (req.query.q) {
            const query = String(req.query.q).toLowerCase()

            products = products.filter(product =>
                product.name.toLowerCase().includes(query) ||
                product.description.toLowerCase().includes(query)
            )
        }

        if (req.query._sort) {
            const sort = String(req.query._sort)
            const order = req.query._order === 'desc' ? -1 : 1

            products.sort((a, b) => {
                const aValue = a[sort as keyof Product]
                const bValue = b[sort as keyof Product]

                if (aValue === undefined || bValue === undefined) {
                    return 0
                }

                if (aValue < bValue) return -1 * order
                if (aValue > bValue) return 1 * order

                return 0
            })
        }

        const page = Number(req.query._page) || 1
        const limit = Number(req.query._limit) || products.length

        const start = (page - 1) * limit

        products = products.slice(start, start + limit)

        res.status(200).json(products)
    } catch (error) {
        console.error(error)
        res.status(500).json({
            error: 'Ошибка загрузки товаров'
        })
    }
}

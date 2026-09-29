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

        const id = String(req.query.id)

        const product = db.products.find(
            product => product.id === id
        )

        if (!product) {
            return res.status(404).json({
                error: 'Товар не найден'
            })
        }

        return res.status(200).json(product)
    } catch (error) {
        console.error(error)

        return res.status(500).json({
            error: 'Ошибка загрузки товара'
        })
    }
}

import type { VercelRequest, VercelResponse } from '@vercel/node'
import fs from 'node:fs'
import path from 'node:path'

interface Category {
    id: string
    name: string
    slug: string
    icon: string
}

interface Database {
    categories: Category[]
}

export default function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const filePath = path.join(process.cwd(), 'db.json')
        const db: Database = JSON.parse(
            fs.readFileSync(filePath, 'utf-8')
        )

        res.status(200).json(db.categories)
    } catch (error) {
        console.error(error)
        res.status(500).json({
            error: 'Ошибка загрузки категорий'
        })
    }
}

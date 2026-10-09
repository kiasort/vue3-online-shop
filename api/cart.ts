import type { VercelRequest, VercelResponse } from '@vercel/node'
import { randomUUID } from 'node:crypto'
import { sql } from './_db.js'

function mapCartRow(row: any) {
  return {
    id: row.id,
    quantity: row.quantity,
    product: {
      id: row.productId,
      name: row.name,
      description: row.description,
      shortDescription: row.shortDescription,
      price: Number(row.price),
      compareAtPrice: row.compareAtPrice === null ? undefined : Number(row.compareAtPrice),
      images: row.images,
      categoryId: row.categoryId,
      tags: row.tags,
      rating: Number(row.rating),
      reviewCount: Number(row.reviewCount),
      stock: row.stock,
      featured: row.featured,
      isNew: row.isNew,
      discount: row.discount,
      specifications: row.specifications,
      createdAt: row.createdAt,
    },
  }
}

async function getCartRows() {
  return sql`
    SELECT
      c.id,
      c.quantity,
      p.id AS "productId",
      p.name,
      p.description,
      p.short_description AS "shortDescription",
      p.price,
      p.compare_at_price AS "compareAtPrice",
      p.images,
      p.category_id AS "categoryId",
      p.tags,
      p.rating,
      p.review_count AS "reviewCount",
      p.stock,
      p.featured,
      p.is_new AS "isNew",
      p.discount,
      p.specifications,
      p.created_at AS "createdAt"
    FROM cart c
    JOIN products p ON p.id = c.product_id
    ORDER BY c.id
  `
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const rows = await getCartRows()
      return res.status(200).json(rows.map(mapCartRow))
    }

    if (req.method === 'POST') {
      const productId = String(req.body?.product?.id ?? '')
      const quantity = Number(req.body?.quantity ?? 1)

      if (!productId || !Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ error: 'Invalid cart item' })
      }

      const [product] = await sql`SELECT id FROM products WHERE id = ${productId}`
      if (!product) {
        return res.status(404).json({ error: 'Product not found' })
      }

      const [existing] = await sql`SELECT id, quantity FROM cart WHERE product_id = ${productId} LIMIT 1`

      if (existing) {
        await sql`
          UPDATE cart
          SET quantity = ${Number(existing.quantity) + quantity}
          WHERE id = ${existing.id}
        `
      } else {
        await sql`
          INSERT INTO cart (id, product_id, quantity)
          VALUES (${randomUUID()}, ${productId}, ${quantity})
        `
      }

      const rows = await getCartRows()
      const item = rows.find((row: any) => row.productId === productId)
      return res.status(200).json(mapCartRow(item))
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

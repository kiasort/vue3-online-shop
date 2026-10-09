import type { VercelRequest, VercelResponse } from '@vercel/node'
import { randomUUID } from 'node:crypto'
import { sql } from './_db.js'

function getSessionId(req: VercelRequest): string {
  const value = req.headers['x-cart-session-id']
  return typeof value === 'string' ? value.trim() : ''
}

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

async function getCartRows(sessionId: string) {
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
    WHERE c.session_id = ${sessionId}
    ORDER BY c.id
  `
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sessionId = getSessionId(req)
  if (!sessionId) {
    return res.status(400).json({ error: 'Cart session is required' })
  }

  try {
    if (req.method === 'GET') {
      const rows = await getCartRows(sessionId)
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

      const [existing] = await sql`
        SELECT id, quantity
        FROM cart
        WHERE product_id = ${productId} AND session_id = ${sessionId}
        LIMIT 1
      `

      if (existing) {
        await sql`
          UPDATE cart
          SET quantity = ${Number(existing.quantity) + quantity}
          WHERE id = ${existing.id} AND session_id = ${sessionId}
        `
      } else {
        await sql`
          INSERT INTO cart (id, product_id, quantity, session_id)
          VALUES (${randomUUID()}, ${productId}, ${quantity}, ${sessionId})
        `
      }

      const rows = await getCartRows(sessionId)
      const item = rows.find((row: any) => row.productId === productId)
      return res.status(200).json(mapCartRow(item))
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

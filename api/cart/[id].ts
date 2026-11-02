import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from '../_db.js'

function getSessionId(req: VercelRequest): string {
  const value = req.headers['x-cart-session-id']
  return typeof value === 'string' ? value.trim() : ''
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = typeof req.query.id === 'string' ? req.query.id : ''
  const sessionId = getSessionId(req)

  if (!id) {
    return res.status(400).json({ error: 'Invalid cart item id' })
  }

  if (!sessionId) {
    return res.status(400).json({ error: 'Cart session is required' })
  }

  try {
    if (req.method === 'PUT') {
      const quantity = Number(req.body?.quantity)

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ error: 'Quantity must be a positive integer' })
      }

      const [updated] = await sql`
        UPDATE cart
        SET quantity = ${quantity}
        WHERE id = ${id} AND session_id = ${sessionId}
        RETURNING id
      `

      if (!updated) {
        return res.status(404).json({ error: 'Cart item not found' })
      }

      const [row] = await sql`
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
        WHERE c.id = ${id} AND c.session_id = ${sessionId}
      `

      return res.status(200).json({
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
      })
    }

    if (req.method === 'DELETE') {
      const [deleted] = await sql`
        DELETE FROM cart
        WHERE id = ${id} AND session_id = ${sessionId}
        RETURNING id
      `
      if (!deleted) {
        return res.status(404).json({ error: 'Cart item not found' })
      }
      return res.status(204).end()
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

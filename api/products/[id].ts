import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from './_db.js'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  const id = String(req.query.id)

  if (!id) {
    return res.status(400).json({ error: 'Invalid product id' })
  }

  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const [product] = await sql`
      SELECT
        id,
        name,
        description,
        short_description AS "shortDescription",
        price,
        compare_at_price AS "compareAtPrice",
        images,
        category_id AS "categoryId",
        tags,
        rating,
        review_count AS "reviewCount",
        stock,
        featured,
        is_new AS "isNew",
        discount,
        specifications,
        created_at AS "createdAt"
      FROM products
      WHERE id = ${id}
    `

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    return res.status(200).json(product)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

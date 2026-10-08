import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from './_db'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const q = typeof req.query.q === 'string' ? req.query.q : ''
    const categoryId =
      typeof req.query.categoryId === 'string' ? req.query.categoryId : ''
    const featured = req.query.featured === 'true'

    let products

    if (q) {
      products = await sql`
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
        WHERE
          name ILIKE ${'%' + q + '%'}
          OR description ILIKE ${'%' + q + '%'}
        ORDER BY created_at DESC
      `
    } else if (categoryId) {
      products = await sql`
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
        WHERE category_id = ${categoryId}
        ORDER BY created_at DESC
      `
    } else if (featured) {
      products = await sql`
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
        WHERE featured = true
        ORDER BY created_at DESC
      `
    } else {
      products = await sql`
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
        ORDER BY created_at DESC
      `
    }

    return res.status(200).json(products)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

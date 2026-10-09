import type { VercelRequest, VercelResponse } from '@vercel/node'
import { randomUUID } from 'node:crypto'
import { sql } from './_db.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { customer, items, total } = req.body ?? {}

    if (!customer || typeof customer !== 'object' || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Customer and order items are required' })
    }

    const orderTotal = Number(total)
    if (!Number.isFinite(orderTotal) || orderTotal < 0) {
      return res.status(400).json({ error: 'Invalid order total' })
    }

    const id = randomUUID()
    const [order] = await sql`
      INSERT INTO orders (id, items, total, status, customer)
      VALUES (
        ${id},
        ${JSON.stringify(items)}::jsonb,
        ${orderTotal},
        'pending',
        ${JSON.stringify(customer)}::jsonb
      )
      RETURNING id, items, total, status, customer, created_at AS "createdAt"
    `

    return res.status(201).json({
      ...order,
      total: Number(order.total),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

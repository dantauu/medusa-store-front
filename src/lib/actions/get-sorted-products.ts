"use server"

import { HttpTypes } from "@medusajs/types"
import type { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!
if (!PUBLISHABLE_KEY) {
  throw new Error("NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY env var is not set")
}

export async function getSortedProducts(
  regionId: string | undefined,
  sortBy: SortOptions = "created_at",
  page: number = 1,
  perPage: number = 12
): Promise<{
  products: HttpTypes.StoreProduct[]
  total: number
}> {
  const offset = (Math.max(page, 1) - 1) * perPage

  const params = new URLSearchParams({
    limit: String(perPage),
    offset: String(offset),
    order: sortBy,
  })

  if (regionId) {
    params.set("region_id", regionId)
  }

  const url = `${MEDUSA_BACKEND_URL}/store/meilisearch-products?${params.toString()}`

  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": PUBLISHABLE_KEY,
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(
      `Не удалось получить продукты: ${res.status} ${res.statusText}\n${body}`
    )
  }

  const { products, count } = await res.json()

  return {
    products,
    total: count,
  }
}

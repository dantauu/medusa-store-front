"use server"

import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getRegion, retrieveRegion } from "./regions"

const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
if (!PUBLISHABLE_KEY) {
  throw new Error("NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY env var is not set")
}

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
  sortBy = "created_at",
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  countryCode?: string
  regionId?: string
  sortBy?: SortOptions
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit

  let region: HttpTypes.StoreRegion | undefined | null

  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  // region_id=${region.id}&limit=${limit}&offset=${offset}&order=${sortBy}

  try {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
      order: sortBy,
    })
    const response = await fetch(
      `${MEDUSA_BACKEND_URL}/store/meilisearch-products?${params.toString()}`,
      {
        method: "GET",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": PUBLISHABLE_KEY,
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error response:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      })
      throw new Error(
        `Failed to fetch products: ${response.status} ${response.statusText}`
      )
    }

    const data = await response.json()
    const nextPage = data.count > offset + limit ? pageParam + 1 : null
    return {
      response: {
        products: data.products,
        count: data.count,
      },
      nextPage,
      queryParams,
    }
  } catch (error) {
    console.error("Error fetching products from Meilisearch:", error)
    return {
      response: { products: [], count: 0 },
      nextPage: null,
      queryParams,
    }
  }
}

export const listProductsWithSort = listProducts

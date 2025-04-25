import { getSortedProducts } from "@lib/actions/get-sorted-products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import type { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const PRODUCT_LIMIT = 12

type PaginatedProductsProps = {
  sortBy?: SortOptions
  page: number
  countryCode: string
}

export default async function PaginatedProducts({
  sortBy = "created_at",
  page,
  countryCode,
}: PaginatedProductsProps) {
  const region = await getRegion(countryCode)
  if (!region) {
    return null
  }

  const { products, total } = await getSortedProducts(
    region.id,
    sortBy,
    page,
    PRODUCT_LIMIT
  )

  const totalPages = Math.ceil(total / PRODUCT_LIMIT)

  return (
    <>
      <ul
        className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8"
        data-testid="products-list"
      >
        {products.map((p) => (
          <li key={p.id}>
            <ProductPreview product={p} region={region} />
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  )
}

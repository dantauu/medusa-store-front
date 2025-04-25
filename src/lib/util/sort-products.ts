// for history remember

// import { HttpTypes } from "@medusajs/types"
// import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

// interface PricedProduct extends HttpTypes.StoreProduct {
//   minPrice?: number
// }

// export function sortProducts(
//   products: HttpTypes.StoreProduct[],
//   sortBy: SortOptions
// ): HttpTypes.StoreProduct[] {
//   const sortedProducts = [...products] as PricedProduct[]

//   if (sortBy === "price_asc" || sortBy === "price_desc") {
//     sortedProducts.sort((a, b) => {
//       const priceA = typeof a.minPrice === "number" ? a.minPrice : Infinity
//       const priceB = typeof b.minPrice === "number" ? b.minPrice : Infinity
//       return sortBy === "price_asc" ? priceA - priceB : priceB - priceA
//     })
//   } else if (sortBy === "created_at") {
//     sortedProducts.sort((a, b) => {
//       return (
//         new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
//       )
//     })
//   }
//   return sortedProducts
// }

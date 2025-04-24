import { getPercentageDiff } from "./get-precentage-diff"
import { convertToLocale } from "./money"

export const getPricesForVariant = (variant: any) => {
  const rawPrice =
    variant?.calculated_price?.calculated_amount ?? variant?.calculated_price

  if (rawPrice == null) {
    return null
  }
  const currency =
    variant?.calculated_price?.currency_code ?? variant?.currency_code ?? "USD"

  const calculated_number = rawPrice
  const original_number = variant?.calculated_price?.original_amount ?? rawPrice

  return {
    calculated_price_number: calculated_number,
    calculated_price: convertToLocale({
      amount: calculated_number,
      currency_code: currency,
    }),
    original_price_number: original_number,
    original_price: convertToLocale({
      amount: original_number,
      currency_code: currency,
    }),
    currency_code: currency,
    price_type:
      variant?.calculated_price?.calculated_price?.price_list_type ?? null,
    percentage_diff: getPercentageDiff(original_number, calculated_number),
  }
}

export function getProductPrice({
  product,
  variantId,
}: {
  product: any
  variantId?: string
}) {
  if (!product) {
    throw new Error("No product provided")
  }
  if (variantId && product.variants?.length) {
    const variant = product.variants.find(
      (v: any) => v.id === variantId || v.sku === variantId
    )
    if (variant) {
      return {
        product,
        cheapestPrice: null,
        variantPrice: getPricesForVariant(variant),
      }
    }
  }

  if (typeof product.minPrice === "number") {
    const min = product.minPrice
    const currency = product.currency_code ?? "USD"
    return {
      product,
      cheapestPrice: {
        calculated_price_number: min,
        calculated_price: convertToLocale({
          amount: min,
          currency_code: currency,
        }),
        currency_code: currency,
      },
      variantPrice: null,
    }
  }

  const sorted = (product.variants || [])
    .filter((v: any) => v.calculated_price)
    .sort((a: any, b: any) => {
      const aVal =
        a.calculated_price.calculated_amount ?? a.calculated_price ?? 0
      const bVal =
        b.calculated_price.calculated_amount ?? b.calculated_price ?? 0
      return aVal - bVal
    })

  const cheapest = sorted[0]
  return {
    product,
    cheapestPrice: cheapest ? getPricesForVariant(cheapest) : null,
    variantPrice: null,
  }
}

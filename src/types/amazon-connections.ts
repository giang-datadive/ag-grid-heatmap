export const AMZ_INTEGRATION_MARKETPLACES = [
  "US",
  "CA",
  "AU",
  "UK",
  "DE",
  "MX",
  "IN",
  "FR",
  "ES",
  "IT",
  "JP",
  "NL",
] as const

export type AmzIntegrationMarketplace =
  typeof AMZ_INTEGRATION_MARKETPLACES[number]

export interface Marketplace {
  countryCode: AmzIntegrationMarketplace
  sellerConsentPageUrl: string
}

export interface AmzLinkedAccount {
  id: number | string
  name: string
}

export type Advertiser = AmzLinkedAccount & {
  marketplace: AmzIntegrationMarketplace
  connectionId: number
}

export interface AmzConnection {
  id: number
  marketplace: AmzIntegrationMarketplace
  sellerAccount?: AmzLinkedAccount
  advertiserAccount?: AmzLinkedAccount
  advertiserConsentUrl?: string
  sellerConsentUrl?: string
  status: "READY" | "ADVERTISER_REQUIRED"
}

export interface Portfolio {
  portfolioId: number
  name: string
}

// lib/gtm.ts
export const GTM_ID = 'GTM-NQLGTS2H'

// Initialize dataLayer properly
export const initializeDataLayer = (): void => {
  ;(window as any).dataLayer = (window as any).dataLayer || []
}

// Log page view event to dataLayer
export const pageview = (url: string): void => {
  if (typeof window.dataLayer !== 'undefined') {
    window.dataLayer.push({
      event: 'pageview',
      page: url,
    })
  } else {
    console.log({
      event: 'pageview',
      page: url,
    })
  }
}

// Push custom event to dataLayer
export const event = ({ action, category, label, value }: Record<string, string>): void => {
  if (typeof window.dataLayer !== 'undefined') {
    window.dataLayer.push({
      event: 'customEvent',
      eventAction: action,
      eventCategory: category,
      eventLabel: label,
      eventValue: value,
    })
  } else {
    console.log({
      event: 'customEvent',
      eventAction: action,
      eventCategory: category,
      eventLabel: label,
      eventValue: value,
    })
  }
}

// Add TypeScript declarations for the dataLayer
declare global {
  interface Window {
    dataLayer: any[]
  }
} 
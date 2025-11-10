/**
 * Custom axios adapter for mocking API responses in development
 * Intercepts requests and routes them to mock handlers
 */

import type { AxiosRequestConfig } from "axios"
import { mockHandlers } from "./handlers"

interface MockRequest extends AxiosRequestConfig {
  url?: string
}

export const createMockAdapter = () => {
  return async (config: MockRequest) => {
    const url = config.url || ""
    const method = (config.method || "get").toLowerCase()

    try {
      if (method === "get") {
        if (url === "/products") {
          const response = await mockHandlers.getProducts()
          return Promise.resolve({ data: response.data, status: 200, config, headers: {}, statusText: "OK" })
        }

        if (url.match(/^\/products\/\d+$/)) {
          const id = Number.parseInt(url.split("/")[2])
          const response = await mockHandlers.getProduct(id)
          return Promise.resolve({ data: response.data, status: 200, config, headers: {}, statusText: "OK" })
        }

        if (url === "/categories") {
          const response = await mockHandlers.getCategories()
          return Promise.resolve({ data: response.data, status: 200, config, headers: {}, statusText: "OK" })
        }

        if (url.match(/^\/categories\/.+$/)) {
          const slug = url.split("/")[2]
          const response = await mockHandlers.getCategory(slug)
          return Promise.resolve({ data: response.data, status: 200, config, headers: {}, statusText: "OK" })
        }

        if (url === "/cart") {
          const response = await mockHandlers.getCart()
          return Promise.resolve({ data: response.data, status: 200, config, headers: {}, statusText: "OK" })
        }

        if (url === "/favorites") {
          const response = await mockHandlers.getFavorites()
          return Promise.resolve({ data: response.data, status: 200, config, headers: {}, statusText: "OK" })
        }

        if (url === "/orders") {
          const response = await mockHandlers.getOrders()
          return Promise.resolve({ data: response.data, status: 200, config, headers: {}, statusText: "OK" })
        }

        if (url.match(/^\/orders\/\d+$/)) {
          const id = Number.parseInt(url.split("/")[2])
          const response = await mockHandlers.getOrder(id)
          return Promise.resolve({ data: response.data, status: 200, config, headers: {}, statusText: "OK" })
        }

        if (url.match(/^\/search/)) {
          const params = new URLSearchParams(url.split("?")[1] || "")
          const query = params.get("q") || ""
          const response = await mockHandlers.search(query, {
            category: params.get("category") || undefined,
            priceFrom: params.get("priceFrom") ? Number.parseInt(params.get("priceFrom")!) : undefined,
            priceTo: params.get("priceTo") ? Number.parseInt(params.get("priceTo")!) : undefined,
          })
          return Promise.resolve({ data: response.data, status: 200, config, headers: {}, statusText: "OK" })
        }
      }

      if (method === "post") {
        if (url === "/cart/items") {
          const { productId, quantity } = config.data
          const response = await mockHandlers.addToCart(productId, quantity)
          return Promise.resolve({ data: response.data, status: 201, config, headers: {}, statusText: "Created" })
        }

        if (url === "/favorites") {
          const { productId } = config.data
          const response = await mockHandlers.addToFavorites(productId)
          return Promise.resolve({ data: response.data, status: 201, config, headers: {}, statusText: "Created" })
        }

        if (url.match(/^\/orders\/\d+\/cancel$/)) {
          const orderId = Number.parseInt(url.split("/")[2])
          const response = await mockHandlers.cancelOrder(orderId)
          return Promise.resolve({ data: response.data, status: 200, config, headers: {}, statusText: "OK" })
        }
      }

      if (method === "patch") {
        if (url.match(/^\/cart\/items\/\d+$/)) {
          const itemId = Number.parseInt(url.split("/")[3])
          const { quantity } = config.data
          const response = await mockHandlers.updateCartItemQuantity(itemId, quantity)
          return Promise.resolve({ data: response.data, status: 200, config, headers: {}, statusText: "OK" })
        }
      }

      if (method === "delete") {
        if (url.match(/^\/cart\/items\/\d+$/)) {
          const itemId = Number.parseInt(url.split("/")[3])
          const response = await mockHandlers.removeFromCart(itemId)
          return Promise.resolve({ data: response.data, status: 200, config, headers: {}, statusText: "OK" })
        }

        if (url.match(/^\/favorites\/\d+$/)) {
          const productId = Number.parseInt(url.split("/")[2])
          const response = await mockHandlers.removeFromFavorites(productId)
          return Promise.resolve({ data: response.data, status: 200, config, headers: {}, statusText: "OK" })
        }
      }

      // Fallback - endpoint not mocked
      return Promise.reject({
        response: { status: 404, data: { message: "Endpoint not found" }, config },
      })
    } catch (error: any) {
      return Promise.reject({
        response: {
          status: 400,
          data: { message: error.message },
          config,
        },
      })
    }
  }
}

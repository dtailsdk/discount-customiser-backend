import { ShopifyToken as baseShopifyToken } from '@dtails/toolbox-backend'
import { Api } from '@dtails/shopify-api'
import { getEnvironment } from '@dtails/toolbox-backend'

class ShopifyToken extends baseShopifyToken {
  static tableName = 'shopify_tokens'

  api() {
    return new Api({
      accessToken: this.token,
      apiVersion: getEnvironment('SHOPIFY_API_VERSION'),
      shopName: `${this.shop}.myshopify.com`
    })
  }
}

export default ShopifyToken
import { ShopifyToken } from 'models'

export async function deleteShopData(shop) {
  if (shop != null) {
    console.log('Shop exists in DB - going to delete all related data for shop', shop)
    await ShopifyToken.q.where({ id: shop.id }).del()
  } else {
    console.log('Shop does not exist in DB - data has previously been deleted')
  }
}

export function getAppScopes() {
  return [
    'read_products',
  ]
}

export async function getInstalledShop(dbShopName) {
  const shop = await ShopifyToken.q.findOne({ shop: dbShopName })
  const scopesUpdated = shop.scope == getAppScopes().join(',')
  if (!scopesUpdated) {
    log(`Scopes are NOT up to date for shop ${dbShopName} - going to request confirmation of new scopes`)
  }
  return {
    shop: {
      name: dbShopName
    },
    appInstalled: (shop && scopesUpdated) ? true : false
  }
}
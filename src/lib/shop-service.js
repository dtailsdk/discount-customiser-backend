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
    'write_discounts',
    'read_discounts'
  ]
}

export async function getInstalledShop(dbShopName) {
  const dbShop = await ShopifyToken.q.findOne({ shop: dbShopName })
  const scopesUpdated = dbShop && dbShop.scope == getAppScopes().join(',')
  if (!scopesUpdated) {
    console.log(`Scopes are NOT up to date for shop ${dbShopName} - going to request confirmation of new scopes`)
  }
  const shop = getShopForApp(dbShop, dbShopName)
  shop.appInstalled = dbShop && scopesUpdated
  return shop
}

export async function updateShop(dbShop, showSetupInstructions) {
  const dbUpdatedShop = await ShopifyToken.q.updateAndFetchById(dbShop.id, { showSetupInstructions })
  return getShopForApp(dbUpdatedShop, dbUpdatedShop.shop)
}

function getShopForApp(dbShop, dbShopName) {
  return {
    shop: {
      name: dbShopName
    },
    showSetupInstructions: dbShop ? dbShop.showSetupInstructions : false,
    isValidPayment: dbShop ? dbShop.isValidPayment : false,
  }
}
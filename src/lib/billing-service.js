import { getEnvironment } from '@dtails/toolbox-backend'
import { ShopifyToken, VipMerchant } from 'models'
import { getShopDetails } from '../lib/shopify-api/shop'
import { getActiveSubscriptions, createSubscription } from './shopify-api/billing'
import { getAppRootUrl } from '../lib/app'

export async function validatePaymentSubscription(dbShop) {
  console.log('Going to validate payment subscription for shop: ' + dbShop.shop)
  const activeSubscriptions = await getActiveSubscriptions(dbShop.api())
  const vipMerchant = await getVipMerchant(dbShop)
  let isValidSubscription = null
  //Subscription not approved yet
  if (activeSubscriptions.length == 0) {
    if (vipMerchant == null) {
      isValidSubscription = false
      console.log('Shop ' + dbShop.shop + ' has no Shopify subscription, and is not VIP or partner development')
    } else {
      isValidSubscription = true
    }
  } else if (activeSubscriptions.length === 1 && dbShop.shopifySubscriptionId === activeSubscriptions[0].id && activeSubscriptions[0].status === 'ACTIVE') {
    console.log('Shop ' + dbShop.shop + ' has an active subscription with the expected id')
    isValidSubscription = true
  } else {
    console.log('Shop ' + dbShop.shop + ' has an invalid subscription - either too many active subscriptions, a non-active subscription or an unexpected subscription id')
    isValidSubscription = false
    console.log(activeSubscriptions)
  }
  await ShopifyToken.q.updateAndFetchById(dbShop.id, { isValidPayment: isValidSubscription })
}

export async function createShopifySubscription(dbShop) {
  let redirectUrl = getAppRootUrl(dbShop.shop)
  const subscription = await createShopifySubscriptionRequest(dbShop, { displayName: 'D.TAILS Discount Customiser app subscription', price: 25 })
  if (subscription.confirmationUrl) {
    redirectUrl = subscription.confirmationUrl
  }
  return redirectUrl
}

async function getSubscriptionFromShopify(shopifyApi) {
  const subscriptions = await getActiveSubscriptions(shopifyApi)
  let currentSubscription = null
  if (subscriptions.length === 1) {
    currentSubscription = subscriptions[0]
  } else if (subscriptions.length > 1) {
    throw new Error('More than one subscription has been registered for store and app ' + subscriptions)
  }
  return currentSubscription
}

async function getVipMerchant(dbShop) {
  const vipMerchants = await VipMerchant.q
  for (let i = 0; i < vipMerchants.length; i++) {
    if (vipMerchants[i].dbShop === dbShop.shop) {
      return vipMerchants[i]
    }
  }
  return null
}

async function createShopifySubscriptionRequest(dbShop, requestedPlan) {
  const shopDetails = await getShopDetails(dbShop.api())
  const approvalRedirectUrl = getEnvironment('SERVER_URL') + '/app/billing/approve'
  const lineItems = [{
    plan: {
      appRecurringPricingDetails: {
        price: {
          amount: requestedPlan.price,
          currencyCode: 'USD'
        }
      }
    }
  }]
  const isTestEnvironment = getEnvironment('IS_PRODUCTION') !== 'true' || shopDetails.plan.partnerDevelopment || shopDetails.plan.displayName == 'staff'
  const result = await createSubscription(dbShop.api(), requestedPlan.displayName, lineItems, approvalRedirectUrl, isTestEnvironment)
  console.log('result', result)
  await ShopifyToken.q.updateAndFetchById(dbShop.id, { shopifySubscriptionId: result.appSubscription.id, isValidPayment: false })
  return result
}

export async function approveSubscription(chargeId) {
  console.log('Approve subscription was triggered for charge id: ' + chargeId)
  const subscriptionId = 'gid://shopify/AppSubscription/' + chargeId
  const dbShop = await ShopifyToken.q.where({ shopifySubscriptionId: subscriptionId }).first()
  const activeSubscription = await getSubscriptionFromShopify(dbShop.api())
  if (activeSubscription === null || (activeSubscription.id == subscriptionId && activeSubscription.status == 'ACTIVE')) {
    await ShopifyToken.q.updateAndFetchById(dbShop.id, { isValidPayment: true })
  } else {
    throw new Error('The active subscription for shop ' + dbShop.shop + ' is not valid: ' + activeSubscription)
  }
  return getAppRootUrl(dbShop.shop)
}

/**
 * Validates Shopify billing for all installed shops
 */
export async function validateAllPaymentSubscriptions() {
  const dbShops = await ShopifyToken.q
  for (const dbShop of dbShops) {
    await validatePaymentSubscription(dbShop)
  }
}
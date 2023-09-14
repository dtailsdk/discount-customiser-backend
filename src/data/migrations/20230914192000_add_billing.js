exports.up = async (knex) => {
  await knex.schema.table('shopify_tokens', t => {
    t.text('shopify_subscription_id')
    t.boolean('is_valid_payment').defaultTo(false)
  })
}

exports.down = async (knex) => {
  await knex.schema.table('shopify_tokens', t => {
    t.dropColumn('shopify_subscription_id')
    t.dropColumn('is_valid_payment')
  })
}
exports.up = async (knex) => {
  await knex.schema.table('shopify_tokens', t => {
    t.text('discount_id')
  })
}

exports.down = async (knex) => {
  await knex.schema.table('shopify_tokens', t => {
    t.dropColumn('discount_id')
  })
}
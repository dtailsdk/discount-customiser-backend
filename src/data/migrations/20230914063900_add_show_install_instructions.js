exports.up = async (knex) => {
  await knex.schema.table('shopify_tokens', t => {
    t.boolean('show_setup_instructions').defaultTo(true)
  })
}

exports.down = async (knex) => {
  await knex.schema.table('shopify_tokens', t => {
    t.dropColumn('show_setup_instructions')
  })
}
exports.up = function (knex, Promise) {
  return knex.schema.createTable('settings', table => {
    table.increments('id').primary()
    table.integer('shopify_token_id').references('shopify_tokens.id').notNull().onDelete('CASCADE')
    table.integer('cart_minimum')
    table.integer('discount_percentage')
    table.string('shopify_discount_id')
    table.timestamps()
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('settings')
}
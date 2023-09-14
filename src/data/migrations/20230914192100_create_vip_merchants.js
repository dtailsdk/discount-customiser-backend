exports.up = function(knex, Promise) {
  return knex.schema.createTable('vip_merchants', table => {
    table.increments('id').primary()
    table.string('shop')
    table.string('approved_by_dtailer')
    table.timestamps()
    table.unique('shop')
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('vip_merchants')
}

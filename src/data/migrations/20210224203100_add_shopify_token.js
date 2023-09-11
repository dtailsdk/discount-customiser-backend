import { ShopifyToken } from 'models'

exports.up = async function (knex) {
  await knex.schema.createTable(ShopifyToken.tableName, (table) => {
    ShopifyToken.migrations.v1.up(table)
  })
};

exports.down = async function (knex) {
  await knex.schema.dropTable(ShopifyToken.tableName)
};

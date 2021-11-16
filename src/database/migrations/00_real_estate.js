async function up(knex) {
  return knex.schema.createTable('real_estate', table => {
    table.increments('id').primary();
    table.string('url').notNullable();
    table.string('contact');
    table.string('title').notNullable();
    table.integer('price').notNullable();
  });
}

async function down(knex) {
  return knex.schema.dropTable('real_estate');
}

module.exports = { up, down };

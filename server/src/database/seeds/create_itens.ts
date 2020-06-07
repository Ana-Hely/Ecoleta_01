import Knex from 'knex';
export async function seed(knex: Knex) {
    await knex('itens').insert([
        { title: 'Lâmpadas', image: 'lampadas.svg'},
        { title: 'Pilhas e baterias', image: 'baterias.svg'},
        { title: 'Papéis e Papelão', image: 'papeis-pepalao.svg'},
        { title: 'Residuos Eletrônicos', image: 'eletronicos.svg'},
        { title: 'Residuos Orgânicos', image: 'organicos.svg'},
        { title: 'Óleo de Cozinha', image: 'oleo.svg'},
    ]);
}
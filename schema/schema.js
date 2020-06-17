const { join } = require('path');
const { loadSchemaSync } = require('@graphql-tools/load');
const { GraphQLFileLoader } = require('@graphql-tools/graphql-file-loader');
const { addResolversToSchema } = require('@graphql-tools/schema');
const QueryResolver = require('./resolvers/Query');


const users = [
    { id: 1, username: "karudo", email: "karudokun@gmail.com", password: "lolno" },
    { id: 2, username: "bloop", email: "ihavenofriends@gmail.com", password: "fuckthis" },
    { id: 3, username: "bleep", email: "asisaid@gmail.com", password: "yeet" },
];

const schema = loadSchemaSync(join(__dirname, 'typedefs','Query.graphql'), { loaders: [new GraphQLFileLoader()] });
const resolvers = {
    Query: QueryResolver(users)
};

const schemaWithResolvers = addResolversToSchema({
  schema,
  resolvers,
});

module.exports = schemaWithResolvers;
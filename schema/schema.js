const { join } = require('path');
const { loadSchemaSync } = require('@graphql-tools/load');
const { GraphQLFileLoader } = require('@graphql-tools/graphql-file-loader');
const { addResolversToSchema } = require('@graphql-tools/schema');
const QueryResolver = require('./resolvers/Query');
const MutationResolver = require('./resolvers/Mutation');



const schema = loadSchemaSync(
    join(__dirname, 'typedefs','Query.graphql'),
    { loaders: [new GraphQLFileLoader()] }
);



const resolvers = {
    Query: QueryResolver,
    Mutation: MutationResolver
};

const schemaWithResolvers = addResolversToSchema({
  schema,
  resolvers,
});

module.exports = schemaWithResolvers;
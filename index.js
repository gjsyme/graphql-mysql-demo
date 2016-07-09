var graphql = require('graphql');
var graphqlHTTP = require('express-graphql');
var express = require('express');
var mysql = require('mysql');

// mysql database connection - added by gjsyme
//format of json file:
/* {
  'host': 'hostname',
  'user': 'username',
  'password': 'password',
  'database': 'database name'
}*/
// for more on mysql see https://github.com/mysqljs/mysql or search it on npm
const connectionConfig = require('./database-config.json');
var connection = mysql.createConnection(connectionConfig);

// Define the User type with two string fields: `id` and `name`.
// The type of User is GraphQLObjectType, which has child fields
// with their own types (in this case, GraphQLString).
var userType = new graphql.GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: graphql.GraphQLString },
    name: { type: graphql.GraphQLString },
  }
});

// Define the schema with one top-level field, `user`, that
// takes an `id` argument and returns the User with that ID.
// Note that the `query` is a GraphQLObjectType, just like User.
// The `user` field, however, is a userType, which we defined above.
var schema = new graphql.GraphQLSchema({
  query: new graphql.GraphQLObjectType({
    name: 'Query',
    fields: {
      user: {
        type: userType,
        args: {
          id: {type: graphql.GraphQLString}
        },
        resolve: function(_, args){
          let promise = new Promise(function(resolve, reject){
            connection.query("select * from user where user_id = "+args.id, (err, rows, fields)=>{
              if(err){
                reject(Error("Error in querying"));
              }else{
                resolve(rows[0]);
              }
            });
          });
          return promise.then(function(result){
            return result;
          }, function(err){
            console.log('err',err);
          });
        }
      }
    }
  })
});

express()
  .use('/graphql', graphqlHTTP({ schema: schema, pretty: true }))
  .listen(3000);

console.log('GraphQL server running on http://localhost:3000/graphql');

import {
  GraphQLID,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";


export const userType = new GraphQLObjectType({
  name: "userType",
  description: "object of user ",
  fields:{
    _id: { type: GraphQLID },
    phone:{ type: GraphQLString },
    email: { type: GraphQLString },
    age: { type: GraphQLInt },
    username: { type: GraphQLString },
  },
});

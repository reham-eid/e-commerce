import { GraphQLID, GraphQLObjectType, GraphQLString } from "graphql";

export const imgType = (name) => {
    return new GraphQLObjectType({
      name: name || "image",
      fields: () => ({
        id: { type: GraphQLID },
        url: { type: GraphQLString },
      }),
    });
  };
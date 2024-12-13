import { GraphQLID, GraphQLObjectType, GraphQLString } from "graphql";
import { imgType } from "../../../services/graphQL/types.js";
import { userType } from "../../auth/graphQL/userType.js";

export const categoryType = new GraphQLObjectType({
  name: "categoryType",
  description: "object of category ",
  fields: {
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    slug: { type: GraphQLString },
    image: { type: imgType("CategoryImage") },
    createdBy: { type: GraphQLID },
    userData: {
      type: userType,
      resolve: async (parent, args) => {
        const user = await User.findById(parent.createdBy);
        return user;
      },
    },
  },
});

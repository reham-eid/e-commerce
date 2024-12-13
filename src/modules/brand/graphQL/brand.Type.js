import { GraphQLID, GraphQLObjectType, GraphQLString } from "graphql";
import { imgType } from "../../../services/graphQL/types.js";
import { userType } from "../../auth/graphQL/userType.js";

export const brandType = new GraphQLObjectType({
  description: "object of brand ",
  name: "brandType",
  fields: {
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    slug: { type: GraphQLString },
    logo: { type: imgType("brandLogo") },
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

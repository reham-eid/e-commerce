import { GraphQLID, GraphQLObjectType, GraphQLString } from "graphql";
import { userType } from "../../auth/graphQL/userType.js";
import { imgType } from "../../../services/graphQL/types.js";
import User from "../../../../DB/models/user.model.js";
import { categoryType } from "../../category/graphQL/categoryType.js";
import Category from "../../../../DB/models/category.model.js";

export const subCategoryType = new GraphQLObjectType({
  description: "object of subCategory ",
  name: "subCategoryType",
  fields: () => ({
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    slug: { type: GraphQLString },
    image: { type: imgType("subCategoryImage") },
    createdBy: { type: GraphQLID },
    userData: {
      type: userType,
      resolve: async (parent, args) => {
        const user = await User.findById(parent.createdBy);
        return user;
      },
    },
    categoryId: { type: GraphQLID },
    categoryData: {
      type: categoryType,
      resolve: async (parent, args) => {
        const category = await Category.findById(parent.categoryId);
        return category;
      },
    },
  }),
});

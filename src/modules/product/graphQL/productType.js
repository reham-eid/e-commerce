import {
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import { userType } from "../../auth/graphQL/userType.js";
import { imgType } from "../../../services/graphQL/types.js";
import { categoryType } from "../../category/graphQL/categoryType.js";

export const productType = new GraphQLObjectType({
  name: "productType",
  description: "object of product",
  fields: {
    _id: { type: GraphQLID },
    title: { type: GraphQLString },
    slug: { type: GraphQLString },
    description: { type: GraphQLString },
    cloudFolder: { type: GraphQLString },
    imgCover: { type: imgType("productCover") },
    images: { type: new GraphQLList(imgType("productImages")) },
    price: { type: GraphQLFloat },
    discount: { type: GraphQLInt },
    quantity: { type: GraphQLInt },
    sold: { type: GraphQLInt },
    rateAvg: { type: GraphQLInt },
    rateCount: { type: GraphQLInt },
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
    subcategoryId: { type: GraphQLID },
    brandId: { type: GraphQLID },
  },
});

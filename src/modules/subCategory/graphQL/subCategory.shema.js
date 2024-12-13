import {
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import SubCategory from "../../../../DB/models/subCategory.model.js";
import { subCategoryType } from "./subCategoryType.js";

export const getOneSubCategory = {
  type: new GraphQLObjectType({
    name: "singleSubCategory",
    description: "Get-One-SubCategory ",
    fields: {
      message: { type: GraphQLString },
      status: { type: GraphQLInt },
      data: {
        type: subCategoryType,
      },
    },
  }),
  args: {
    _id: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: async (parent, args) => {
    const subCategory = await SubCategory.findById({ _id: args._id });
    return {
      message: "subCategory fetched successfully",
      status: 200,
      data: subCategory,
    };
  },
};

export const getAllSubCategories = {
  type: new GraphQLObjectType({
    name: "SubCategories",
    description: "Get-All-SubCategories ",
    fields: {
      message: { type: GraphQLString },
      status: { type: GraphQLInt },
      data: {
        type: new GraphQLList(subCategoryType),
      },
    },
  }),
  resolve: async () => {
    let subCategories = await SubCategory.find();
    return {
      message: "SubCategories fetched successfully",
      status: 200,
      data: subCategories,
    };
  },
};
export const subCategorySchema = {
  AllSubCategories: getAllSubCategories,
  OneSubCategory: getOneSubCategory,
};

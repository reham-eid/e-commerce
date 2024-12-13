import {
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import Category from "../../../../DB/models/category.model.js";
import { categoryType } from "./categoryType.js";

export const getCategories = {
  type: new GraphQLObjectType({
    name: "AllCategory",
    description: "Get-All-Categories ",
    fields: {
      message: { type: GraphQLString },
      status: { type: GraphQLInt },
      data: {
        type: new GraphQLList(categoryType),
      },
    },
  }),
  resolve: async () => {
    let categories = await Category.find();
    return {
      message: "categories fetched successfully",
      status: 200,
      data: categories,
    };
  },
};

export const getOnecategory = {
  type: new GraphQLObjectType({
    name: "singleCategory",
    description: "Get-One-Category ",
    fields: {
      message: { type: GraphQLString },
      status: { type: GraphQLInt },
      data: {
        type: categoryType,
      },
    },
  }),
  args: {
    _id: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: async (parent, args) => {
    const category = await Category.findById({ _id: args._id });
    return {
      message: "category fetched successfully",
      status: 200,
      data: category,
    };
  },
};
export const categorySchema = {
  Onecategory: getOnecategory,
  categories: getCategories,
};

import {
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import Brand from "../../../../DB/models/brand.model.js";
import { brandType } from "./brand.Type.js";

export const getBrands = {
  type: new GraphQLObjectType({
    name: "AllBrands",
    description: "Get-All-Brands ",
    fields: {
      message: { type: GraphQLString },
      status: { type: GraphQLInt },
      data: {
        type: new GraphQLList(brandType),
      },
    },
  }),
  resolve: async () => {
    let brands = await Brand.find();
    return {
      message: "Brands fetched successfully",
      status: 200,
      data: brands,
    };
  },
};

export const getOneBrand = {
  type: new GraphQLObjectType({
    name: "singleBrands",
    description: "Get-One-Brand ",
    fields: {
      message: { type: GraphQLString },
      status: { type: GraphQLInt },
      data: {
        type: brandType,
      },
    },
  }),
  args: {
    _id: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: async (parent, args) => {
    const brand = await Brand.findById({ _id: args._id });
    return {
      message: "Brand fetched successfully",
      status: 200,
      data: brand,
    };
  },
};
export const brandSchema = {
  Brands: getBrands,
  OneBrand: getOneBrand,
};

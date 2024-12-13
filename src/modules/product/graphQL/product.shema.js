import {
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import Product from "../../../../DB/models/product.model.js";
import { productType } from "./productType.js";

export const getOneProduct = {
  type: new GraphQLObjectType({
    name: "singleProduct",
    description: "Get-One-Product ",
    fields: {
      message: { type: GraphQLString },
      status: { type: GraphQLInt },
      data: {
        type: productType,
      },
    },
  }),
  args: {
    _id: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: async (parent, args) => {
    const product = await Product.findById({ _id: args._id });
    return {
      message: "product fetched successfully",
      status: 200,
      data: product,
    };
  },
};

export const getAllProducts = {
  type: new GraphQLObjectType({
    name: "products",
    description: "Get-All-Products ",
    fields: {
      message: { type: GraphQLString },
      status: { type: GraphQLInt },
      data: {
        type: new GraphQLList(productType),
      },
    },
  }),
  resolve: async () => {
    let products = await Product.find();
    return {
      message: "products fetched successfully",
      status: 200,
      data: products,
    };
  },
};
export const productSchema = {
  AllProducts: getAllProducts,
  OneProduct: getOneProduct,
};

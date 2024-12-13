import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";
import { Cart } from "../../../../DB/models/cart.model.js";
import { cartType } from "./cartType.js";

const rootQuery = new GraphQLObjectType({
  description: " cart schema describtion ",
  name: "cartSchema",
  fields: () => ({
    Onecart: {
      name: "singleCart",
      description: "Get-One-Cart ",
      type: cartType,
      args: {
        _id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args) => {
        const cart = await Cart.findById({ _id: args._id });
        return cart;
      },
    },

    carts: {
      name: "AllCart",
      description: "Get-All-Carts ",
      type: new GraphQLList(cartType),
      resolve: async () => {
        const carts = await Cart.find();
        return carts;
      },
    },

  }),
});

export const cartSchema = new GraphQLSchema({
  query: rootQuery,
});

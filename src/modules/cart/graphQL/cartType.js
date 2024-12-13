import {
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";

const cartItemType = new GraphQLObjectType({
  description: "object of cart ",
  name: "cartItemType",
  fields: () => ({
    productId: { type: GraphQLID },
    quantity: { type: GraphQLString },
    price: { type: GraphQLInt },
  }),
});

export const cartType = new GraphQLObjectType({
  description: "object of category ",
  name: "cartType",
  fields: () => ({
    _id: { type: GraphQLID },
    cartItems: { type: new GraphQLList(cartItemType) },
    totalPrice: { type: GraphQLFloat },
    totalPriceAfterDiscount: { type: GraphQLFloat },
    user: { type: GraphQLID },
  }),
});

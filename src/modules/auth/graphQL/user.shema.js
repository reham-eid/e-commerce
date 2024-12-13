import {
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import User from "../../../../DB/models/user.model.js";
import { userType } from "./userType.js";

export const getUsers = {
  type: new GraphQLObjectType({
    name: "AllUsers",
    description: "Get-All-Users ",
    fields: {
      message: { type: GraphQLString },
      status: { type: GraphQLInt },
      data: {
        type: new GraphQLList(userType),
      },
    },
  }),
  resolve: async () => {
    let users = await User.find();
    return {
      message: "Users fetched successfully",
      status: 200,
      data: users,
    };
  },
};

export const getOneUser = {
  type: new GraphQLObjectType({
    name: "singleUser",
    description: "Get-One-User ",
    fields: {
      message: { type: GraphQLString },
      status: { type: GraphQLInt },
      data: {
        type: userType,
      },
    },
  }),
  args: {
    _id: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: async (parent, args) => {
    const user = await User.findById({ _id: args._id });
    return {
      message: "User fetched successfully",
      status: 200,
      data: user,
    };
  },
};
export const userSchema = {
  OneUser: getOneUser,
  Users: getUsers,
};

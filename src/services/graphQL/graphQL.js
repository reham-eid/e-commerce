import { GraphQLObjectType, GraphQLSchema } from "graphql";
import { userSchema } from "../../modules/auth/graphQL/user.shema.js";
import { brandSchema } from "../../modules/brand/graphQL/brand.shema.js";
import { categorySchema } from "../../modules/category/graphQL/category.shema.js";
import { productSchema } from "../../modules/product/graphQL/product.shema.js";
import {subCategorySchema} from "../../modules/subCategory/graphQL/subCategory.shema.js"
export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "QuerySchema",
    description: "Root Query",
    fields: {
      ...userSchema,
      ...categorySchema,
      ...subCategorySchema,
      ...productSchema,
      ...brandSchema,
    },
  }),
});

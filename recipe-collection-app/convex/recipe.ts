import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addRecipe = mutation({
    args: {
        title: v.string(),
        ingredients: v.array(v.string()),
        instructions: v.array(v.string()),
        imageID: v.optional(v.string()),
        rating: v.number(),
    },
    handler: async (ctx, args) => {

        await ctx.db.insert("recipes", {
            title: args.title,
            ingredients: args.ingredients,
            instructions: args.instructions,
            imageID: args.imageID || null, // Allow imageID to be optional
            rating: args.rating,
        });
    }
})

export const generateUploadUrl = mutation({
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
}});

export const queryRecipes = query({
    handler: async (ctx) => {
        return await ctx.db.query("recipes").collect();
    }
});

export const recipeById = query({
    args: { id: v.id("recipes") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    }
});

export const getRecipeImage = query({
    args: { id: v.string() },
    handler: async (ctx, args) => {
        return await ctx.storage.getUrl(args.id);
        }
    });

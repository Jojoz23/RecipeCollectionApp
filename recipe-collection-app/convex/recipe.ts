import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addRecipe = mutation({
    args: {
        title: v.string(),
        ingredients: v.array(v.string()),
        instructions: v.array(v.string()),
        imageID: v.optional(v.string()),
        rating: v.number(),
        deletable: v.optional(v.boolean())
    },
    handler: async (ctx, args) => {

        await ctx.db.insert("recipes", {
            title: args.title,
            ingredients: args.ingredients,
            instructions: args.instructions,
            imageID: args.imageID || null, // Allow imageID to be optional
            rating: args.rating,
            deletable: args.deletable ?? true
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

export const getRecipeImage = query({
    args: { id: v.string() },
    handler: async (ctx, args) => {
        return await ctx.storage.getUrl(args.id);
        }
    });

export const deleteRecipe = mutation({
    args: { id: v.id("recipes") },
    handler: async (ctx, args) => {
        const recipe = await ctx.db.get(args.id);
        
        if (recipe.imageID && recipe.deletable) {
            await ctx.storage.delete(recipe.imageID);
        }
        await ctx.db.delete(args.id);

    }
});



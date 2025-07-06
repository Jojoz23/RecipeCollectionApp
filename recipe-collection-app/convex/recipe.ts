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
            imageID: args.imageID || null,
            rating: args.rating,
            deletable: args.deletable ?? true
        });
    }
})

// Generate an url for images to be uploaded to
export const generateUploadUrl = mutation({
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
}});

export const queryRecipes = query({
    handler: async (ctx) => {
        return await ctx.db.query("recipes").collect();
    }
});

// Use the image id of the provided recipe and file storage, to get the recipe's image url
export const getRecipeImage = query({
    args: { id: v.string() },
    handler: async (ctx, args) => {
        return await ctx.storage.getUrl(args.id);
        }
    });

// Use a recipe's id to retrieve it's information, so that any associated image can be deleted,
// before deleting the recipe.
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

// Get the recipe id and update the associated recipe with only the updated fields.
// Delete the old image, if the image is updated.
export const editRecipe = mutation({
    args: {
        id: v.id("recipes"),
        title: v.optional(v.string()),
        ingredients: v.optional(v.array(v.string())),
        instructions: v.optional(v.array(v.string())),
        imageID: v.optional(v.string()),
        rating: v.optional(v.number()),
        deletable: v.optional(v.boolean())
    },
    handler: async (ctx , args) => {
        const recipe = await ctx.db.get(args.id);
        const { id, ...fields } = args;
        const updateFields: Record<string, any> = {};
        for (const key of Object.keys(fields)) {            
            if ((fields as Record<string, any>)[key] !== undefined) {
                updateFields[key] = (fields as Record<string, any>)[key];
            }
            
            if (key == "imageID" && recipe.imageID && recipe.deletable){
                await ctx.storage.delete(recipe.imageID);
            }

        }
        await ctx.db.patch(id, updateFields);
    }
}
)

export const recipeById = query({
    args: { id: v.optional(v.id("recipes")) },
    handler: async (ctx, args) => {
        return args.id? await ctx.db.get(args.id): null;
    }
})
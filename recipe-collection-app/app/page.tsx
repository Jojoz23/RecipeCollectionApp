"use client";
import Image from "next/image";
import { Plus, X, Star } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { api } from "../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import Card from "@/components/display";
import Detail from "@/components/detail";
import { Id } from "@/convex/_generated/dataModel";

export default function Home() {
  interface Recipe {
    _id?: Id<"recipes">;
    title: string;
    ingredients: string[];
    instructions: string[];
    imageID?: string;
    rating: number;
    deletable?: boolean;
  }

  const [recipeForm, setRecipeForm] = useState<boolean>(false);
  const [image, setImage] = useState<File | null>(null);
  const [placeholderId, setPlaceholderId] = useState<string | null>(null);

  const addRecipe = useMutation(api.recipe.addRecipe);
  const generateUploadUrl = useMutation(api.recipe.generateUploadUrl);

  const recipes = useQuery(api.recipe.queryRecipes) ?? [];
  const currentRecipeId = useRef<string | null>(null);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);

  // Toggle so that the recipe form opens
  const handleAddRecipe = () => {
    setRecipeForm(!recipeForm);
    setCurrentRecipe(null);
    currentRecipeId.current = null;
  }

  // When user submit, post the given image to an url and store only the 
  // associated storage id in the entry to the recipes table.
  // If no image upload a placeholder image or the placeholder image's storage id.
  // Submit all the other info provided in the form to the mutation.
  // Split the ingredients by (,) and instructions by (.).
  const handleSubmitRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const url = await generateUploadUrl();
    let deletable = true;

    let id = null;
    if (image) {
      const result = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": image?.type,
        },
        body: image ? image : undefined,
      });

      const { storageId } = await result.json();
      id = storageId;

    }
    else {
      if (!placeholderId) {

        const placeholderResponse = await fetch("/placeholder.png");
        const placeholderBlob = await placeholderResponse.blob();

        const result = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "image/png",
          },
          body: placeholderBlob,
        });

        const { storageId } = await result.json();
        setPlaceholderId(storageId);
        id = storageId;

      }
      else {
        id = placeholderId;
      }

      deletable = false;

    }

    const newRecipe: Recipe = {
      title: formData.get("Title") as string,
      ingredients: (formData.get("Ingredients") as string).split(",").map(ing => ing.trim()),
      instructions: (formData.get("Instructions") as string).split(".").map(inst => inst.trim()),
      imageID: id,
      rating: Number(formData.get("Rating")),
      deletable: deletable,
    };

    await addRecipe(newRecipe);
    
    // Close the form once mutation complete
    setRecipeForm(false);
    setImage(null);
  }

  // Given a recipe id, get the recipe from the list gotten from the recipes table query.
  // Given nothing, null the current recipe and recipe id
  const setCurrentRecipeId = (id: string | null) => {
    currentRecipeId.current = id;
    if (id) {
      const recipe = recipes.find((recipe: Recipe) => recipe._id === currentRecipeId.current);
      if (recipe) {
        setCurrentRecipe(recipe);
      }
    }
    else {
      setCurrentRecipe(null);
      currentRecipeId.current = null;
    }
  }

  return (
    <main className="flex flex-col items-center justify-between p-16 overflow-y-auto bg-blue-300 min-h-screen w-full m-0 pt-3">
      <h1 className="text-blue-950 text-xl font-bold mb-2">Recipe Collection App</h1>
      {/*If user wants to add a recipe, show them the add recipe form*/}
      {recipeForm ? (
        <div className="bg-white p-4 rounded shadow-md w-full max-w-md inset-0 z-50">
          <h2 className="text-lg font-semibold mb-4 text-blue-950 flex justify-center">Add New Recipe</h2>
          <form onSubmit={handleSubmitRecipe} className="flex flex-col space-y-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input name="Title" type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black p-2" required />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Ingredients <span className="text-black text-xs">(Separate ingrediants by a comma)</span></label>
              <textarea name="Ingredients" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black p-2" required rows={2}></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Instructions <span className="text-black text-xs">(Separate ingrediants by a period)</span></label>
              <textarea name="Instructions" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black p-2" required rows={2}></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rating</label>
              <select name="Rating" id="Rating" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 mb-2 text-black p-2">
                <option value="1">★</option>
                <option value="2">★★</option>
                <option value="3">★★★</option>
                <option value="4">★★★★</option>
                <option value="5">★★★★★</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Image</label>
              <input type="file" accept="image/*" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black p-2" onChange={(event) => setImage(event.target.files![0])} />
              <img
                src={image ? URL.createObjectURL(image) : "/placeholder.png"}
                alt="Recipe Image"
                className="mt-2 w-full h-48 object-contain rounded-md"
              />
            </div>
            <button type="submit" className="bg-blue-950 text-white px-4 py-2 rounded hover:bg-blue-700">Save Recipe</button>
          </form>
        </div>
      ) : 
      (<div className="flex-grow w-full items-start">
        {/*When the add recipe form isnt active, show the user all the recipes available in Card format using the grid layout.
         If user selects a recipe show them only the detailed view of that recipe.*/}
        {!currentRecipeId.current ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recipes.map((recipe, index) => (
              <Card key={index} recipe={recipe} index={index} setCurrentRecipeId={setCurrentRecipeId} currentRecipeId={currentRecipeId.current} />
            )
            )}
          </div>
        ) : (
          <Detail recipe={currentRecipe!} setCurrentRecipeId={setCurrentRecipeId} />
        )}

      </div>)}
      {/*Button to toggle the add recipe form*/}
      <button className="bg-blue-950 text-white px-4 py-2 rounded hover:bg-blue-700 fixed bottom-4 right-4" onClick={handleAddRecipe}>
        {recipeForm ? <X /> : <Plus />}
      </button>
    </main>
  );
}

"use client";
import Image from "next/image";
import { Plus, X, Star } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { api } from "../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import Card from "@/components/display";
import Detail from "@/components/detail";

export default function Home() {

  interface Recipe {
    _id?: string;
    title: string;
    ingredients: string[];
    instructions: string[];
    imageID?: string;
    rating: number;
  }

  const [recipeForm, setRecipeForm] = useState<boolean>(false);
  const [image, setImage] = useState<File | null>(null);
  const [placeholderId, setPlaceholderId] = useState<string | null>(null);

  const addRecipe = useMutation(api.recipe.addRecipe);
  const generateUploadUrl = useMutation(api.recipe.generateUploadUrl);

  const recipes = useQuery(api.recipe.queryRecipes)?? [];
  const currentRecipeId = useRef<string | null>(null);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);

  const handleAddRecipe = () => {
    setRecipeForm(!recipeForm);
      setCurrentRecipe(null);
      currentRecipeId.current = null;
  }

  const handleSubmitRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const url = await generateUploadUrl();

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
      console.log("Image uploaded successfully:", storageId);
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
        console.log("Placeholder image uploaded successfully:", storageId);
        setPlaceholderId(storageId);
        id = storageId;

      }
      else {
        id = placeholderId;
      }

    }

    

    console.log(formData);
    console.log("Image ID:", id);

    const newRecipe: Recipe = {
      title: formData.get("Title") as string,
      ingredients: (formData.get("Ingredients") as string).split(",").map(ing => ing.trim()),
      instructions: (formData.get("Instructions") as string).split(".").map(inst => inst.trim()),
      imageID: id,
      rating: Number(formData.get("Rating")),
    };

    await addRecipe(newRecipe);
    setRecipeForm(false);
    setImage(null);
  }

  const setCurrentRecipeId = (id : string | null) => {
    currentRecipeId.current = id;
    console.log("Current Recipe ID set to:", currentRecipeId.current);
  
    if (id){
          const recipe = recipes.find((recipe: Recipe) => recipe._id === currentRecipeId.current);
          console.log("Recipe found:", recipe);
          if (recipe) {
            setCurrentRecipe(recipe);
            console.log("Current Recipe:", recipe.imageID);
          }
    }
    else {
      setCurrentRecipe(null);
      currentRecipeId.current = null;
      console.log("Current Recipe cleared");
    }
  }

  return (
    <main className="flex flex-col items-center justify-between p-16 overflow-y-auto bg-blue-300 min-h-screen w-full m-0 pt-3">
      <h1 className="text-blue-950 text-xl font-bold mb-2">Recipe Collection App</h1>
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
      ) : (<div className="flex-grow w-full items-start">

        {!currentRecipeId.current ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {  recipes.map( (recipe, index) => (
            <Card key={index} recipe={recipe} index={index} setCurrentRecipeId={setCurrentRecipeId} currentRecipeId={currentRecipeId.current}/>
        )
        )}
        </div>
      ): (
          console.log("Current Recipe:", currentRecipe),
          <Detail recipe={currentRecipe!} setCurrentRecipeId={setCurrentRecipeId} />
        )}

      </div>)}

      <button className="bg-blue-950 text-white px-4 py-2 rounded hover:bg-blue-700 fixed bottom-4 right-4" onClick={handleAddRecipe}>
        {recipeForm ? <X /> : <Plus />}
      </button>
    </main>
  );
}

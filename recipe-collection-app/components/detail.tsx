"use client";
import { api } from "../convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { X, Trash2, Edit } from "lucide-react";
import type { Id } from "../convex/_generated/dataModel";
import { useEffect, useState } from "react";

type DetailProps = {
  recipe: {
    _id?: Id<"recipes">;
    title: string;
    imageID?: string;
    rating: number;
    ingredients: string[];
    instructions: string[];
    deletable?: boolean;
  };
  setCurrentRecipeId: (id: string) => void;
};

export default function Detailied({ recipe, setCurrentRecipeId }: DetailProps) {
  const deleteRecipe = useMutation(api.recipe.deleteRecipe);
  const generateUploadUrl = useMutation(api.recipe.generateUploadUrl);
  const updateRecipe = useMutation(api.recipe.editRecipe);

  const [updateForm, setUpdateForm] = useState(false);
  const [updatedImage, setUpdatedImage] = useState<File | null>(null);
  const [current, setCurrent] = useState(recipe);

  const recipeIn = useQuery(api.recipe.recipeById, { id: recipe._id });
  const imageUrl = useQuery(
    api.recipe.getRecipeImage,
    current.imageID ? { id: current.imageID } : "skip"
  );

  // recipeIn updates whenever the recipe id query updates, so this keeps the current recipe being used always up to date
  useEffect(() => {
    if (recipeIn) {
      setCurrent(recipeIn);
    }
  }, [recipeIn]);

  // Toggles the update form
  const toggleForm = () => {
    setUpdateForm(!updateForm);
    setUpdatedImage(null);
  };

  // When the update form is submitted
  // If a image is provided, upload it to a url and get it's storage id
  // Patch the recipe with all the new info provided. 
  const handleSubmitRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    let newImageId = undefined;
    if (updatedImage) {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": updatedImage.type },
        body: updatedImage,
      });
      const { storageId } = await result.json();
      newImageId = storageId;
    }

    const newRecipe = {
      id: recipe._id as Id<"recipes">,
      title: formData.get("Title") as string,
      ingredients: (formData.get("Ingredients") as string)
        .split(",")
        .map((i) => i.trim()),
      instructions: (formData.get("Instructions") as string)
        .split(".")
        .map((i) => i.trim()),
      imageID: newImageId ?? undefined,
      rating: Number(formData.get("Rating")),
      deletable: recipe.deletable ?? true,
    };

    await updateRecipe(newRecipe);
    toggleForm();
  };

  // If the use effect hasnt taken place dont render yet.
  if (!current) return <p className="text-center">Loading...</p>;

  // If user wants to update information, show the update from otherwise display the current recipe's info.
  return (
    !updateForm ? (
      <div className="bg-white p-4 rounded shadow-md w-full flex flex-col justify-center items-center">
        <h2 className="text-lg font-semibold mb-2 text-blue-950">{current.title}</h2>
        {current?.imageID && (
          <img
            src={imageUrl ?? "/placeholder.png"}
            alt={current.title}
            width={200}
            height={200}
            className="w-full h-48 object-contain rounded-md mb-2"
          />
        )}
        <p className=" mb-2 text-blue-950 text-lg">{"★".repeat(current ? current.rating : 1)}</p>
        <h3 className="text-lg font-semibold mb-1 text-blue-950">Ingredients:</h3>
        <ul className="list-disc pl-5 mb-2">
          {current?.ingredients.map((ingredient, index) => (
            <li key={index} className="text-black text-sm">{ingredient}</li>
          ))}
        </ul>
        <h3 className="text-lg font-semibold mb-1 text-blue-950">Instructions:</h3>
        <ol className="list-decimal pl-5">
          {current?.instructions.map((instruction, index) => (
            <li key={index} className="text-black text-sm">{instruction}</li>
          ))}
        </ol>
        <div className="flex justify-around items-center w-full">
          <button className="mt-4 bg-blue-950 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors" onClick={() => {
            recipe._id ? deleteRecipe({ id: recipe._id }) : undefined;
            setCurrentRecipeId("");
          }}>
            <Trash2 />
          </button>
          <button
            onClick={() => setCurrentRecipeId("")}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            <X />
          </button>
          <button className="mt-4 bg-blue-950 text-white px-4 py-2 rounded hover:bg-blue-700 transition-color" onClick={toggleForm} >
            <Edit />
          </button>
        </div>
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center">
        <div className="bg-white p-4 rounded shadow-md w-full max-w-md inset-0 z-50">
          <h2 className="text-lg font-semibold mb-4 text-blue-950 flex justify-center">Update Recipe</h2>
          <form onSubmit={handleSubmitRecipe} className="flex flex-col space-y-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input name="Title" type="text" defaultValue={current.title} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black p-2" required />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Ingredients <span className="text-black text-xs">(Separate ingrediants by a comma)</span></label>
              <textarea name="Ingredients" defaultValue={current.ingredients.join(", ")} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black p-2" required rows={2}></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Instructions <span className="text-black text-xs">(Separate ingrediants by a period)</span></label>
              <textarea name="Instructions" defaultValue={current.instructions.join(". ")} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black p-2" required rows={2}></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rating</label>
              <select name="Rating" id="Rating" defaultValue={current.rating} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 mb-2 text-black p-2">
                <option value="1">★</option>
                <option value="2">★★</option>
                <option value="3">★★★</option>
                <option value="4">★★★★</option>
                <option value="5">★★★★★</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Image</label>
              <input type="file" accept="image/*" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black p-2" onChange={(event) => setUpdatedImage(event.target.files![0])} />
              <img
                src={updatedImage ? URL.createObjectURL(updatedImage) : (imageUrl ?? "/placeholder.png")}
                alt="Recipe Image"
                className="mt-2 w-full h-48 object-contain rounded-md"
              />
            </div>
            <button type="submit" className="bg-blue-950 text-white px-4 py-2 rounded hover:bg-blue-700">Save Recipe</button>
          </form>
        </div>
      </div>
    )
  )
}
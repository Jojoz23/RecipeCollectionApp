"use client";
import { api } from "../convex/_generated/api";
import { useQuery } from "convex/react";

type DetailProps = {
  recipe: {
    _id?: string;
    title: string;
    imageID?: string;
    rating: number;
    ingredients: string[];
    instructions: string[];
  };
  setCurrentRecipeId: (id: string) => void;
};

export default function Detailied({recipe, setCurrentRecipeId}: DetailProps) {
    const url = recipe.imageID
        ? useQuery(api.recipe.getRecipeImage, { id: recipe.imageID })
        : "/placeholder.png";
    


    return (
        <div className="bg-white p-4 rounded shadow-md w-full flex flex-col justify-center items-center">
            <h2 className="text-lg font-semibold mb-2 text-blue-950">{recipe.title}</h2>
            {recipe.imageID && (
                <img
                    src={url ?? "/placeholder.png"}
                    alt={recipe.title}
                    width={200}
                    height={200}
                    className="w-full h-48 object-contain rounded-md mb-2"
                />
            )}
            <p className=" mb-2 text-blue-950 text-lg">{"★".repeat(recipe.rating)}</p>
            <h3 className="text-lg font-semibold mb-1 text-blue-950">Ingredients:</h3>
            <ul className="list-disc pl-5 mb-2">
                {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="text-black text-sm">{ingredient}</li>
                ))}
            </ul>
            <h3 className="text-lg font-semibold mb-1 text-blue-950">Instructions:</h3>
            <ol className="list-decimal pl-5">
                {recipe.instructions.map((instruction, index) => (
                    <li key={index} className="text-black text-sm">{instruction}</li>
                ))}
            </ol>
            <button
                onClick={() => setCurrentRecipeId("")}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
                Close
            </button>
            </div>
    )
}
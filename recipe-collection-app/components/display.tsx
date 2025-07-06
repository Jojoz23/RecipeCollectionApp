"use client";
import { api } from "../convex/_generated/api";
import { useQuery } from "convex/react";

type CardProps = {
  recipe: {
    _id: string;
    title: string;
    imageID?: string;
    rating: number;
  };
  index: number;
  setCurrentRecipeId: (id: string) => void;
  currentRecipeId?: string | null;
};

export default function Card({ recipe, index, setCurrentRecipeId, currentRecipeId }: CardProps) {
  const url = recipe.imageID
    ? useQuery(api.recipe.getRecipeImage, { id: recipe.imageID })
    : "/placeholder.png";

  // Each recipe card shows the image, title and rating of the provided recipe.
  // Query the storage to get the recipe's associated images url.
  return (
    <div
      key={index}
      className="bg-white p-4 rounded shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={() => {
        setCurrentRecipeId(recipe._id)
      }}
    >
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
      <p className="text-gray-700 mb-2">{"★".repeat(recipe.rating)}</p>
    </div>
  );
}
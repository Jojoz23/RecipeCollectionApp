This is a Recipe Collecting App. Made for a Data on The Spot Assessment.

# Features
Create/Update/Delete/Read Recipes

Add info (title, rating, image, ingredients, instructions) to your recipes

View recipes on the site on a single page

Deployed at https://recipe-collection-app-eta.vercel.app/


# Setup

To run locally,

```
git clone https://github.com/Jojoz23/RecipeCollectionApp.git

cd recipe-collection-app

npm install
```

Then, on separate terminals, do

```
npx run dev
npx convex dev
```

Sign in to your Convex dashboard

Then follow the localhost link, provided by the npx run dev, to interact with the app

# Tech Stack

Frontend: Next.js

Backend: Convex

Styling: TailwindCSS

Deployment: Vercel

# Learning Reflections
This was my first time working with convex and convex file storage, so it took a bit of time to get used to, but getting used to the syntax and API was pretty intuitive.

Getting used to the hooks provided by Convex took a long time, and I had to spend a lot of time ensuring the hooks were rendered in the correct order. I finally extracted the display and detail sections to separate components so that the convex's hooks are called on the mount of these components, in the correct order and not nested in other hooks.

I learned about the Rule of Hooks and Convex. Convex is a pretty cool database, and its file storage system is something I found pretty handy and new. I also learned that useState doesn't provide instantaneous change, so I had to switch to useRef to keep the currentRecipeId always up to date. Deploying was pretty fast and easy.

I would say this assessment took me around 6-8 hours to complete, the hooks debugging took a long time. But I'm proud that I was able to complete and deploy this assessment in one sitting.


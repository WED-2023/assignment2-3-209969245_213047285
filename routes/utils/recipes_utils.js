const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";


/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: true,
            apiKey: process.env.spoonacular_apiKey || `77302a6fcaf14a5ba7a0bded3c3ec6e8`
        }
    });
}


async function getRecipeDetails(recipe_id) {
    try {
       
        const recipe_info = await getRecipeInformation(recipe_id);
        let {
            id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree,
            summary, analyzedInstructions, instructions, extendedIngredients, servings
        } = recipe_info.data;
        return {
            id: id,
            title: title,
            readyInMinutes: readyInMinutes,
            image: image,
            aggregateLikes: aggregateLikes,
            vegetarian: vegetarian,
            vegan: vegan,
            glutenFree: glutenFree,
            summary: summary,
            analyzedInstructions: analyzedInstructions,
            instructions: instructions,
            extendedIngredients: extendedIngredients,
            servings: servings
        };
    } catch (error) {
        console.error(`Error getting recipe details for ID ${recipe_id}:`, error);
        throw error;
    }

}

async function searchRecipe(recipeName, cuisine, diet, intolerance, number, username) {
    const response = await axios.get(`${api_domain}/complexSearch`, {
        params: {
            query: recipeName,
            cuisine: cuisine,
            diet: diet,
            intolerances: intolerance,
            number: number,
            apiKey: process.env.spoonacular_apiKey
        }
    });

    return getRecipesPreview(response.data.results.map((element) => element.id), username);
}


  /**
  Get random recipes from Spoonacular API
  @param {*} number
  @param {*} includeTags
  @param {*} excludeTags
  */
  async function getRandomRecipes(number, includeTags, excludeTags) {
      try {
          const response = await axios.get(`${api_domain}/random`, {
              params: {
                  number: number,
                  tags: includeTags.join(','),
                  excludeTags: excludeTags.join(','),
                  apiKey: process.env.spoonacular_apiKey || `77302a6fcaf14a5ba7a0bded3c3ec6e8`

              }
          });
  
          if (response && response.data && response.data.recipes) {
              const recipesDetails = response.data.recipes.map(recipe => {
                  const { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree, summary } = recipe;
                  return {
                      id,
                      title,
                      readyInMinutes,
                      aggregateLikes,
                      image,
                      vegan,
                      vegetarian,
                      glutenFree,
                      summary
                  };
              });
              return recipesDetails;
          } else {
              throw new Error('No recipes found');
          }
      } catch (error) {
          console.error('Error fetching random recipes:', error);
          throw error;
      }
  }

  async function getRecipesPreview(recipe_ids) {
    try {
        // Get all recipes information asynchronously
        const promises = recipe_ids.map(id => getRecipeInformation(id));
        const recipes = await Promise.all(promises);
        //const recipes = RecipeManager.getRecipesByIds(recipe_ids);

        // Map each recipe to its relevant details using the .data property
        const recipesDetails = recipes.map(recipeResponse => {
            const recipe = recipeResponse.data;  

            // Extract relevant details from the recipe
            const { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree, summary } = recipe;
            return {
                id,
                title,
                readyInMinutes,
                aggregateLikes,
                image,
                vegan,
                vegetarian,
                glutenFree,
                summary
            };
        });
        return recipesDetails
    } catch (error) {
        console.error('Error fetching recipes preview:', error);
        throw error;
    }
}







  

exports.getRecipeDetails = getRecipeDetails;
exports.searchRecipe = searchRecipe;
exports.getRandomRecipes = getRandomRecipes;
exports.getRecipesPreview = getRecipesPreview;


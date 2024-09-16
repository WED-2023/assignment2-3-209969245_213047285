const DButils = require("./DButils");

async function markAsFavorite(username, recipe_id){
    await DButils.execQuery(`insert into FavoriteRecipes values ('${username}',${recipe_id})`);
}

async function getFavoriteRecipes(username){
    const recipes_id = await DButils.execQuery(`select recipe_id from FavoriteRecipes where username='${username}'`);
    return recipes_id;
}

async function removeFromFavorites(username, recipe_id) {
    await DButils.execQuery(`DELETE FROM FavoriteRecipes WHERE username='${username}' AND recipe_id=${recipe_id}`);
}

async function isFavorite(username, recipe_id) {
    if(typeof recipe_id === 'undefined'){
        return false;
    }
    try {
        const result = await DButils.execQuery(`SELECT * FROM FavoriteRecipes WHERE username='${username}' AND recipe_id=${recipe_id}`);
        return result.length > 0;
    } catch (error) {
        console.error(`Error checking if recipe ${recipe_id} is favorite by user ${username}:`, error);
        throw error;
    }
}

async function likeRecipe(username, recipe_id) {
    try {
        await DButils.execQuery(`INSERT INTO likedRecipes (username, recipe_id) VALUES ('${username}', ${recipe_id})`);
    } catch (error) {
        throw error;
    }
  }
  
  async function unlikeRecipe(username, recipe_id) {
    try {
        await DButils.execQuery(`DELETE FROM likedRecipes WHERE username='${username}' AND recipe_id=${recipe_id}`);
    } catch (error) {
        throw error;
    }
  }
  
  async function isLiked(username, recipe_id) {
    try {
        const result = await DButils.execQuery(`SELECT * FROM likedRecipes WHERE username='${username}' AND recipe_id=${recipe_id}`);
        return result.length > 0;
    } catch (error) {
        throw error;
    }
  }

  async function markAsWatched(username, recipe_id) {
    await DButils.execQuery(`DELETE FROM recentRecipes WHERE username='${username}' AND recipe_id=${recipe_id}`);
    await DButils.execQuery(`INSERT INTO recentRecipes (username, recipe_id, seen_at) VALUES ('${username}', ${recipe_id}, CURRENT_TIMESTAMP)`);
}

async function getLastWatchedRecipes(username, limit = 5) {
    try {
        const recipes = await DButils.execQuery(
            `SELECT recipe_id FROM recentRecipes WHERE username='${username}' ORDER BY seen_at DESC LIMIT ${limit}`
        );
        return recipes;
    } catch (error) {
        console.error(`Error fetching last watched recipes for user ${username}:`, error);
        throw error;
    }
}

async function isWatched(username, recipe_id) {
    try {
        const result = await DButils.execQuery(`SELECT * FROM recentRecipes WHERE username='${username}' AND recipe_id=${recipe_id}`);
        return result.length > 0;
    } catch (error) {
        console.error(`Error checking if recipe ${recipe_id} is watched by user ${username}:`, error);
        throw error;
    }
}

async function getUserRecipes(username) {
    try {
        const recipes = await DButils.execQuery(
            `SELECT * FROM myRecipes WHERE username='${username}' `);
        return recipes;
    } catch (error) {
        console.error(`Error fetching user recipes for ${username}:`, error);
        throw error;
    }
}

async function getUserRecipeIds(username) {
    try {
      // Fetch only the recipe IDs (assuming 'id' is the column for recipe ID)
      const recipeIds = await DButils.execQuery(
        `SELECT id FROM myRecipes WHERE username='${username}'`
      );
      // Return an array of recipe IDs
      return recipeIds.map(recipe => recipe.id);
    } catch (error) {
      console.error(`Error fetching recipe IDs for ${username}:`, error);
      throw error;
    }
  }

async function createRecipe(custom_id, username, title, image,readyInMinutes, vegan, vegetarian, glutenFree, ingredients, instructions, servings,summary) {
    try {
        json_ingredients = JSON.stringify(ingredients);
        await DButils.execQuery(
            `INSERT INTO myRecipes (custom_id, username, title, image, readyInMinutes, vegan, vegetarian, glutenFree, ingredients, instructions, servings,summary) 
            VALUES ('${custom_id}','${username}', '${title}','${image}',${readyInMinutes},${vegan},${vegetarian},${glutenFree}, '${json_ingredients}','${instructions}',${servings},'${summary}')`);
    } catch (error) {
        console.error(`Error creating recipe:`, error);
        throw error;
    }
}

async function getUserRecipe(username, recipe_id) {
    try {
      const recipe = await DButils.execQuery(
        `SELECT * FROM myrecipes WHERE username ='${username}'  AND id =${recipe_id} `, 
      );
  
      if (recipe.length === 0) {
        throw new Error('Recipe not found');
      }
  
      return recipe[0]; 
    } catch (error) {
      console.error(`Error fetching recipe with id ${recipe_id} for user ${username}:`, error);
      throw error;
    }
  }

  async function getRecipeType(recipe_id) {
    try {
      const result = await DButils.execQuery(`SELECT custom_id FROM myrecipes WHERE id=${recipe_id}`);
      
      // Return the custom_id if found, otherwise return 'spoonacular'
      return result.length > 0 && result[0].custom_id ? result[0].custom_id : 'spoonacular';
    } catch (error) {
      console.error(`Error getting recipe type for recipe ${recipe_id}:`, error);
      throw error;
    }
  }

  
  






exports.removeFromFavorites = removeFromFavorites;
exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.isFavorite = isFavorite;

exports.likeRecipe = likeRecipe;
exports.unlikeRecipe = unlikeRecipe;
exports.isLiked = isLiked;

exports.markAsWatched = markAsWatched;
exports.getLastWatchedRecipes = getLastWatchedRecipes;
exports.isWatched = isWatched;

exports.getUserRecipes = getUserRecipes
exports.createRecipe = createRecipe;
exports.getUserRecipe = getUserRecipe;
exports.getUserRecipeIds = getUserRecipeIds;

exports.getRecipeType = getRecipeType;



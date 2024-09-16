var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.username) {
    DButils.execQuery("SELECT username FROM users").then((users) => {
      if (users.find((x) => x.username === req.session.username)) {
        req.username = req.session.username;
        next();
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
});


/**
 * This route gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/favorites', async (req,res,next) => {
  try{
    const username = req.session.username;
    const recipe_id = req.body.recipeId;
    await user_utils.markAsFavorite(username,recipe_id);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
  }
})

/**
 * This route returns the favorites recipes that were saved by the logged-in user
 */
router.post('/getFavorites', async (req, res, next) => {
  try {
    const username = req.session.username;

    // Fetch all favorite recipe IDs for the logged-in user
    const favoriteRecipes = await user_utils.getFavoriteRecipes(username); 
    const recipes_id_array = favoriteRecipes.map((element) => element.recipe_id);  // Extract recipe IDs from DB

    // Extract personalRecipeIds from the request body (sent from the client)
    const { personalRecipeIds } = req.body;
    let results = [];

    // Loop through each favorite recipe ID
    for (const id of recipes_id_array) {
      let recipe = null;

      // If the recipe ID is part of personalRecipeIds, use getUserRecipe()
      if (personalRecipeIds.includes(id)) {
        recipe = await user_utils.getUserRecipe(username, id);  // Fetch the recipe from the user's personal recipes
        console.log("tryrec",recipe);
      } else {
        // If not, fetch from the external source
        recipe = await recipe_utils.getRecipeDetails(id);  // Fetch from external API 
      }

      // Add the recipe to the results array if found
      if (recipe) {
        results.push(recipe);
      }
    }

    // Send the results back to the client
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});

/**
 * This route deletes a favorite recipe by username and recipe ID
 */
router.delete('/favorites', async (req, res, next) => {
  try {
    const username = req.session.username;
    const recipe_id = req.body.recipeId;
    await user_utils.removeFromFavorites(username, recipe_id);
    res.status(200).send("The Recipe successfully removed from favorites");
  } catch (error) {
    next(error);
  }
});

/**
 * This route checks if the recipe is favorite for the logged-in user
 */
router.post('/isFavorite', async (req, res, next) => {
  try {
    const username = req.session.username;
    const recipe_id = req.body.recipeId;
    const favorite = await user_utils.isFavorite(username, recipe_id);
    res.status(200).send({ favorite });
  } catch (error) {
    next(error);
  }
});


// Add a recipe to likedRecipes
router.post('/like', async (req, res, next) => {
  try {
    const username = req.session.username;
    const recipe_id = req.body.recipeId;
    await user_utils.likeRecipe(username, recipe_id);
    res.status(200).send({ message: "Recipe liked successfully" });
  } catch (error) {
    next(error);
  }
});

// Remove a recipe from likedRecipes
router.post('/unlike', async (req, res, next) => {
  try {
    const username = req.session.username;
    const recipe_id = req.body.recipeId;
    await user_utils.unlikeRecipe(username, recipe_id);
    res.status(200).send({ message: "Recipe unliked successfully" });
  } catch (error) {
    next(error);
  }
});

// Check if a recipe is liked
router.post('/isLiked', async (req, res, next) => {
  try {
    const username = req.session.username;
    const recipe_id = req.body.recipeId;
    const liked = await user_utils.isLiked(username, recipe_id);
    res.status(200).send({ liked });
  } catch (error) {
    next(error);
  }
});

/**
 * This path saves a recipe as "last seen" for the logged-in user
 */
router.post('/watched', async (req, res, next) => {
  try {
    const username = req.session.username;
    const recipe_id = req.body.recipeId;
    await user_utils.markAsWatched(username, recipe_id);
    res.status(200).send("The Recipe successfully marked as watched");
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns the last watched recipes that were saved by the logged-in user
 */
router.get('/lastWatchedRecipes', async (req, res, next) => {
  try {
    const username = req.session.username;
    const limit = req.query.limit;
    const recipes_id = await user_utils.getLastWatchedRecipes(username,limit);
    let recipes_id_array = recipes_id.map((element) => element.recipe_id); // extracting the recipe ids into an array
    const personalRecipeIds = JSON.parse(req.query.personalRecipeIds);   
     let results = [];

    // Loop through each favorite recipe ID
    for (const id of recipes_id_array) {
      let recipe = null;

      // If the recipe ID is part of personalRecipeIds, use getUserRecipe()
      if (personalRecipeIds.includes(id)) {
        recipe = await user_utils.getUserRecipe(username, id);  // Fetch the recipe from the user's personal recipes
        console.log("tryrec",recipe);
      } else {
        // If not, fetch from the external source
        recipe = await recipe_utils.getRecipeDetails(id);  // Fetch from external API 
      }

      // Add the recipe to the results array if found
      if (recipe) {
        results.push(recipe);
      }
    }

    // Send the results back to the client
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});

/**
 * This path checks if the recipe has been watched by the logged-in user
 */
router.post('/isWatched', async (req, res, next) => {
  try {
    const username = req.session.username;
    const recipe_id = req.body.recipeId;
    const watched = await user_utils.isWatched(username, recipe_id);
    res.status(200).send({ watched });
  } catch (error) {
    next(error);
  }
});

router.get('/userRecipes', async (req, res, next) => {
  try {
    const username = req.session.username;
    const userRecipes = await user_utils.getUserRecipes(username);
    res.status(200).send(userRecipes);
  } catch (error) {
    next(error);
  }
});

router.post('/createARecipe', async (req, res, next) => {
  try {
    const username = req.session.username;
    const {
      title,
      image,
      readyInMinutes,
      vegan,
      vegetarian,
      glutenFree,
      ingredients,
      instructions,
      servings,
      summary,
    } = req.body;


    await user_utils.createRecipe(
      'personal',
      username,
      title,
      image,
      readyInMinutes,
      vegan,
      vegetarian,
      glutenFree,
      ingredients,
      instructions,
      servings,
      summary,
  
    );
    res.status(201).send("The Recipe was successfully created");
  } catch (error) {
    next(error);
  }
});

router.post('/createFamilyRecipe', async (req, res, next) => {
  try {
    const username = req.session.username;
    const {
      title,
      image,
      readyInMinutes,
      vegan,
      vegetarian,
      glutenFree,
      ingredients,
      instructions,
      servings,
      summary,
    } = req.body;


    await user_utils.createRecipe(
      'family',
      username,
      title,
      image,
      readyInMinutes,
      vegan,
      vegetarian,
      glutenFree,
      ingredients,
      instructions,
      servings,
      summary,
  
    );
    res.status(201).send("The Recipe was successfully created");
  } catch (error) {
    next(error);
  }
});

router.get('/userRecipe', async (req, res, next) => {
  try {
    const username = req.session.username; 
    const recipe_id = req.query.recipe_id; 

    if (!recipe_id) {
      return res.status(400).send("Recipe ID is required");
    }

    const recipe = await user_utils.getUserRecipe(username, recipe_id);
    res.status(200).send(recipe);
  } catch (error) {
    next(error);
  }
});

router.get('/userRecipeIds', async (req, res, next) => {
  try {
    const username = req.session.username;
    const recipeIds = await user_utils.getUserRecipeIds(username);  // Use the new util method
    res.status(200).send(recipeIds);
  } catch (error) {
    next(error);
  }
});

router.get("/getRecipeType", async (req, res, next) => {
  try {
    const recipe_id = req.query.recipe_id;
    const recipeType = await user_utils.getRecipeType(recipe_id);
    console.log(recipeType);
    res.status(200).send({ recipeType });
  } catch (error) {
    next(error);
  }
});





module.exports = router;

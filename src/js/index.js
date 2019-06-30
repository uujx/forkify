import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as LikesView from './views/LikesView';
import { elements, renderLoader, clearLoader } from './views/base';

/** Global state of the app
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipes
 */
const state = {};
window.state = state;

/**
 * SEARCH CONTROLLER
 */
const controlSearch = async () => {
    // 1) Get query form view
    const query = searchView.getInput();

    if (query) {
        // 2) New search object and add to state
        state.search = new Search(query);

        // 3) Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchResults);

        try{
            // 4) Search for recipes
            await state.search.getRecipes();
    
            // 5) Render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (err) {
            console.log(`Error process search!  ${err}`);
            clearLoader();
        }
    }

};

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();  
});

elements.searchResPage.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});


/**
 * RECIPE CONTROLLER
 */
const controlRecipe = async () => {
    const id = window.location.hash.replace('#', '');

    if (id) {
        // 1) New recipe object and add to state
        state.recipe = new Recipe(id);
        
        // 2) Prepare UI for results
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Highlight selected search item
        if (state.search) searchView.highlightSelected(id);
        
        try{
            // 3) Get recipe details
            await state.recipe.getRecipe();
            
            // 4) Calculate time and servings
            state.recipe.calcTime();
            state.recipe.calcServings();
            
            // 5) Parse ingredients
            state.recipe.parseIngredients();

            // 6) Render result on UI
            clearLoader();
            recipeView.renderRecipe(
                state.recipe, 
                state.likes.isLiked(id)
            );
        } catch (err) {
            console.log(`Error processing recipe!  ${err}`);
        }
    }
};



['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));



/**
 * LIST CONTROLLER
 */
const controlList = () => {
    // 1) Create list object if there is no one 
    if (!state.list) state.list = new List();
    
    // 2) Add ingredients to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderList(item)
    });
    
};

// Handling delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;
    
    // Handle the delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);
        
        // Delete from UI
        listView.deleteItem(id);
        
    // Handle the count update
    } else if (e.target.matches('.shopping__item-value')) {
        const val = parseFloat(e.target.value);
        state.list.updateCount(id, val);
    }
});



/**
 * LIKES CONTROLLER
 */
const controlLikes = () => {
    const currentID = state.recipe.id;

    // Create Likes object if there is no one
    if (!state.likes) state.likes = new Likes();

    // The current recipe has NOT been liked
    if (!state.likes.isLiked(currentID)) {
        // Add the recipe to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );

        // Toggle the like button
        LikesView.toggleLikeBtn(true);

        // Render the recipe to UI
        LikesView.renderLike(newLike);

    // The current recipe HAS been liked
    } else {
        // Delete the recipe from the state
        state.likes.deleteLike(currentID);
        
        // Toggle the like button
        LikesView.toggleLikeBtn(false);

        // Delete the recipe from UI
        LikesView.deleteLike(currentID);
    }

    // Toggle the like menu 
    LikesView.toggleLikeMenu(state.likes.getLikesNum());
};

window.addEventListener('load', () => {
    // Create new likes object
    state.likes = new Likes();

    // Retrive data from local storage
    state.likes.readStorage();

    // Toggle the like menu
    LikesView.toggleLikeMenu(state.likes.getLikesNum());

    // Render likes to UI
    state.likes.likes.forEach(like => LikesView.renderLike(like));
});


// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        // Decrease servings and ingredients in the state and UI
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // Increase servings and ingredients in the state and UI
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn-add, .recipe__btn-add *')) {
        // Add ingredients to the shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // Add recipe to the likes
        controlLikes();
    }
});



/**
 * TODO:
 * • Implement button to delete all shopping list items; 
 * • Implement functionality to manually add items to shopping list; 
 * • Save shopping list data in local storage; 
 * • Improve the ingredient parsing algorithm; 
 * • Come up with an algorithm for calculating the amount of servings; 
 * • Improve error handling. 
 */
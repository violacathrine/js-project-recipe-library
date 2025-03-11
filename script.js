// DOM-element
const loadingIndicator = document.getElementById("loading");
const selectedFiltersText = document.getElementById("selected-filters");
const dietFilter = document.getElementById("diet-filter");
const cuisineFilter = document.getElementById("cuisine-filter");
const timeFilter = document.getElementById("time-filter");
const sortFilter = document.getElementById("sort-filter");
const ingredientFilter = document.getElementById("ingredient-filter");
const clearBtn = document.getElementById("clearBtn");
const randomBtn = document.getElementById("randomBtn");
const container = document.getElementById("recipe-container");
const recipeCountElement = document.getElementById("recipe-count");
const searchInput = document.getElementById("search-input");

let recipes = [];

// FUNCTIONS //

const toggleLoading = (show) => {
  loadingIndicator.style.display = show ? "block" : "none";
};

const fetchRecipes = async () => {
  toggleLoading(true); // Show loading indicator

  try {
    const apiKey = "29753ab3087c46f9ab04a6285b8c1ea0"; // My API-key
    const response = await fetch(`https://api.spoonacular.com/recipes/random?number=5&apiKey=${apiKey}`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.recipes || !Array.isArray(data.recipes)) {  // Check if the data is valid
      return [];
    } return data.recipes; // API returns an array of recipes
  } catch (error) {
    return []; // Return an empty array if something goes wrong 
  } finally {
    toggleLoading(false); // Hide loading indicator
  }
};

const showAllRecipes = () => {
  displayRecipes(recipes);
  updateSelectedFiltersText();
};

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const getRandomRecipe = () => {
  if (recipes.length === 0) {
    selectedFiltersText.textContent = "No recipes available. Try again later.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * recipes.length);
  displayRecipes([recipes[randomIndex]]);
};


const updateSelectedFiltersText = () => {
  let selectedFilters = [];
  let sortedText = "";

  if (dietFilter.value !== "all") {
    selectedFilters.push(`${capitalizeFirstLetter(dietFilter.value)}`);
  }
  if (cuisineFilter.value !== "all") {
    selectedFilters.push(`${capitalizeFirstLetter(cuisineFilter.value)}`);
  }
  if (timeFilter.value !== "all") {
    selectedFilters.push(`${capitalizeFirstLetter(timeFilter.options[timeFilter.selectedIndex].text)}`);
  }
  if (ingredientFilter && ingredientFilter.value !== "all") {
    selectedFilters.push(`${capitalizeFirstLetter(ingredientFilter.options[ingredientFilter.selectedIndex].text)}`);
  }

  // Start with standard text
  let filterText = selectedFilters.length > 0 ?
    `Selected filters: ${selectedFilters.join(", ")}` :
    "Selected filters: All";

  // Sorting seperately
  if (sortFilter.value !== "none") {
    sortedText = `Sorted by: ${capitalizeFirstLetter(sortFilter.options[sortFilter.selectedIndex].text)}`;
  }

  // Uppdate text at another row
  selectedFiltersText.innerHTML = `
    <div>${filterText}</div>
    ${sortedText ? `<div>${sortedText}</div>` : ""}
  `;
};

const updateRecipeCount = (recipeList) => {
  if (recipeCountElement) {
    recipeCountElement.textContent = `Showing recipes: ${recipeList.length}`;
  }
}

const displayRecipes = (recipeList = []) => {
  if (!Array.isArray(recipeList)) {  // Saftey check
    console.error("Error: recipeList is not an array!", recipeList);
    return;
  }

  container.innerHTML = "";

  // Update recipe count
  recipeCountElement.textContent = `Showing recipes: ${recipeList.length}`;

  // Show message if no recipes are found
  if (recipeList.length === 0) {
    container.innerHTML = `
        <p class="no-recipes">Sorry, no recipes found. Try adjusting your selections!</p>
      `;
    return;
  }

  // Create and display recipe cards
  recipeList.forEach(recipe => {
    const recipeCard = document.createElement("div");
    recipeCard.classList.add("recipe-card");

    const image = recipe.image || "https://via.placeholder.com/300";
    const cuisine = recipe.cuisines?.length
      ? recipe.cuisines.join(", ")
      : recipe.dishTypes?.length
        ? recipe.dishTypes.join(", ")
        : "Not specified";
    const ingredients = recipe.extendedIngredients?.length
      ? recipe.extendedIngredients.map(ing => ing.name).join(", ")
      : "No ingredients listed";

    recipeCard.innerHTML = `
      <img src="${image}" alt="${recipe.title}">
      <h3>${recipe.title}</h3>
      <p><strong>Cuisine:</strong> ${cuisine}</p>
      <p><strong>Time:</strong> ${recipe.readyInMinutes} min</p>
      <p><strong>Ingredients:</strong> ${ingredients}</p>
    `;

    container.appendChild(recipeCard);
  });
};

const filterAndSortRecipes = () => {
  let filteredRecipes = [...recipes];

  // Filtering based on diet if not "All" is selected
  const selectedDiet = dietFilter.value;
  if (selectedDiet !== "all") {
    filteredRecipes = filteredRecipes.filter(recipe => {
      if (selectedDiet === "vegetarian") return recipe.vegetarian;
      if (selectedDiet === "vegan") return recipe.vegan;
      if (selectedDiet === "gluten-free") return recipe.glutenFree;
      return false;
    });
  }

  // Filterering based on cuisine if not "All" is selected
  const selectedCuisine = cuisineFilter.value;
  if (selectedCuisine !== "all") {
    filteredRecipes = filteredRecipes.filter(recipe => {
      const cuisines = recipe.cuisines || recipe.dishTypes || [];
      return cuisines.some(cuisine => cuisine.toLowerCase() === selectedCuisine.toLowerCase());
    });
  }

  // Filtering based on time if not "All" is selected
  const selectedTime = timeFilter.value;
  if (selectedTime !== "all") {
    filteredRecipes = filteredRecipes.filter(recipe => {
      if (selectedTime === "under-15") return recipe.readyInMinutes < 15;
      if (selectedTime === "15-30") return recipe.readyInMinutes >= 15 && recipe.readyInMinutes <= 30;
      if (selectedTime === "30-60") return recipe.readyInMinutes > 30 && recipe.readyInMinutes <= 60;
      if (selectedTime === "over-60") return recipe.readyInMinutes > 60;
      return false;
    });
  }

  // Sorting based on selected sort option
  const selectedSort = sortFilter.value;
  if (selectedSort === "time-asc") {
    filteredRecipes.sort((a, b) => a.readyInMinutes - b.readyInMinutes); // Shortest time first
  } else if (selectedSort === "popularity-desc") {
    filteredRecipes.sort((a, b) => (b.aggregateLikes || 0) - (a.aggregateLikes || 0));
  } else if (selectedSort === "popularity-asc") {
    filteredRecipes.sort((a, b) => (a.aggregateLikes || 0) - (b.aggregateLikes || 0));
  }
  displayRecipes(filteredRecipes); // Call function to display recipes
};


// Clear filters/searchbar function
const clearFilters = () => {
  dietFilter.value = "all";
  cuisineFilter.value = "all";
  timeFilter.value = "all";
  sortFilter.value = "none";
  if (ingredientFilter) ingredientFilter.value = "all";

  searchInput.value = ""; // Clear search input

  // Erase active colors on button
  dietFilter.classList.remove("active-filter");
  cuisineFilter.classList.remove("active-filter");
  timeFilter.classList.remove("active-filter");
  sortFilter.classList.remove("sort-active");

  // Show all recipes again
  displayRecipes(recipes);

  // Uppdate filtertext
  updateSelectedFiltersText();
};


const updateFilterStyle = (filterElement) => {
  // If it's sort use pink color
  if (filterElement === sortFilter) {
    if (filterElement.value !== "none") {
      filterElement.classList.add("sort-active"); // add pink color
    }
  } else {
    // For other filters use blue color
    if (filterElement.value !== "all") {
      filterElement.classList.add("active-filter");
    }
  }
};

const searchRecipes = () => {
  const query = searchInput.value.toLowerCase().trim(); // Get search query and make it lowercase

  if (!query) {
    displayRecipes(recipes); // Show all recipes if search is empty
    return;
  }

  // Filter recipes based on search query
  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(query) ||
    (recipe.extendedIngredients || []).some(ing => ing.name.toLowerCase().includes(query))
  );

  displayRecipes(filteredRecipes);
};


//  Lista with all filters to loop through
const filters = [dietFilter, cuisineFilter, timeFilter, sortFilter];

filters.forEach(filter => {
  filter.addEventListener("change", () => {
    if (filter.value === "all") {
      showAllRecipes(); // Om "All" väljs, visa alla recept
    } else {
      filterAndSortRecipes(); // Annars filtrera som vanligt
    }
    updateFilterStyle(filter);
    updateSelectedFiltersText();
  });
});


// Eventlisteners for the clear filters and random button
clearBtn.addEventListener("click", clearFilters);
randomBtn.addEventListener("click", getRandomRecipe);

// 
if (ingredientFilter) {
  ingredientFilter.addEventListener("change", updateSelectedFiltersText);
}

// Eventlistener for search input
searchInput.addEventListener("input", searchRecipes);

// Remove active color from filters
filters.forEach(filter => filter.classList.remove("active-filter"));

document.addEventListener("DOMContentLoaded", async () => {
  recipes = await fetchRecipes();
  displayRecipes(recipes); // Show recipes AFTER they have been fetched
});


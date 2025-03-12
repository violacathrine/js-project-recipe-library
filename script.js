// DOM-element
const loadingIndicator = document.getElementById("loading");
const errorContainer = document.getElementById("error-container");
const selectedFiltersText = document.getElementById("selected-filters");
const selectedSorting = document.getElementById("selected-sorting");
const dietFilter = document.getElementById("diet-filter");
const cuisineFilter = document.getElementById("cuisine-filter");
const timeFilter = document.getElementById("time-filter");
const sortFilter = document.getElementById("sort-filter");
const clearBtn = document.getElementById("clearBtn");
const randomBtn = document.getElementById("randomBtn");
const container = document.getElementById("recipe-container");
const recipeCountElement = document.getElementById("recipe-count");
const searchInput = document.getElementById("search-input");

// GLOBAL VARIABLES
let recipes = [];
let apiQuotaExceeded = false;

// FUNCTION TO CAPITALIZE FIRST LETTER OF EACH WORD IN A STRING
const capitalizeArray = (array) => {
  return array.map(item => item.charAt(0).toUpperCase() + item.slice(1));
};

// LOADING INDICATOR
const toggleLoading = (show) => {
  loadingIndicator.style.display = show ? "block" : "none";
};

// ERROR MESSAGE
const showErrorMessage = (message) => {
  loadingIndicator.style.display = "none";
  errorContainer.innerHTML = `<p class="error-message">${message}</p>`;
  apiQuotaExceeded = true;
};

// FETCH RECIPES FROM API
const fetchRecipes = async () => {
  toggleLoading(true);
  apiQuotaExceeded = false;

  try {
    const apiKey = "29753ab3087c46f9ab04a6285b8c1ea0";
    const response = await fetch(`https://api.spoonacular.com/recipes/random?number=100&apiKey=${apiKey}`);

    if (!response.ok) {
      throw new Error(`Error! Status: ${response.status}`);
    }

    const data = await response.json();
    const selectedCuisines = ["italian", "mediterranean", "middle eastern", "american", "asian"];
    recipes = data.recipes.filter(recipe =>
      recipe.cuisines.some(cuisine => selectedCuisines.includes(cuisine.toLowerCase()))
    );

    // Capitalize 
    recipes.forEach(recipe => {
      if (recipe.cuisines) {
        recipe.cuisines = capitalizeArray(recipe.cuisines);
      }
    });

  } catch (error) {
    console.error("Error fetching recipes:", error);

    if (error.message.includes("API quota exhausted") || error.message.includes("402")) {
      showErrorMessage("🚨 API quota exhausted! Please try again later.");
    } else {
      showErrorMessage("⚠️ Failed to load recipes. Please try again later.");
    }

    recipes = [];
  } finally {
    toggleLoading(false);
    displayRecipes(recipes);
  }
};

// DISPLAY RECIPES
const displayRecipes = (recipeList = []) => {
  if (!Array.isArray(recipeList)) {
    console.error("Error: recipeList is not an array!", recipeList);
    return;
  }

  container.innerHTML = "";
  recipeCountElement.textContent = `Showing recipes: ${recipeList.length}`;

  if (apiQuotaExceeded) return;

  if (recipeList.length === 0) {
    container.innerHTML = `<p class="no-recipes">Sorry, no recipes found. Try adjusting your selections!</p>`;
    return;
  }

  recipeList.forEach(recipe => {
    if (!recipe.image) return;

    const recipeCard = document.createElement("div");
    recipeCard.classList.add("recipe-card");

    const diet = recipe.vegetarian ? "Vegetarian" :
      recipe.vegan ? "Vegan" :
        recipe.glutenFree ? "Gluten Free" :
          recipe.dairyFree ? "Dairy Free" : "No specific diet";


    const cuisine = recipe.cuisines?.length ? capitalizeArray(recipe.cuisines).join(", ") : "Not specified";

    const ingredients = recipe.extendedIngredients?.length
      ? `<ul>${capitalizeArray(recipe.extendedIngredients.map(ing => ing.name)).map(ing => `<li>${ing}</li>`).join("")}</ul>`
      : "<p>No ingredients listed</p>";

    recipeCard.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.title}">
      <h3>${recipe.title}</h3>
      <p><strong>Diet:</strong> ${diet}</p>
      <p><strong>Cuisine:</strong> ${cuisine}</p>
      <p><strong>Time:</strong> ${recipe.readyInMinutes} min</p>
      <p><strong>Ingredients:</strong> ${ingredients}</p>
    `;

    container.appendChild(recipeCard);
  });
};

// UPDATE FILTER TEXT
const updateSelectedFiltersText = () => {
  let selectedFilters = [];

  if (dietFilter.value !== "all") selectedFilters.push(capitalizeArray([dietFilter.value])[0]);
  if (cuisineFilter.value !== "all") selectedFilters.push(capitalizeArray([cuisineFilter.value])[0]);
  if (timeFilter.value !== "all") selectedFilters.push(capitalizeArray([timeFilter.options[timeFilter.selectedIndex].text])[0]);

  selectedFiltersText.textContent = selectedFilters.length > 0
    ? `Selected filters: ${selectedFilters.join(", ")}`
    : "Selected filters: All";

  selectedSorting.textContent = sortFilter.value !== "none"
    ? `Sorted by: ${capitalizeArray([sortFilter.options[sortFilter.selectedIndex].text])[0]}`
    : "Sorted by: None";
};


const getRandomRecipe = () => {
  if (apiQuotaExceeded) {
    selectedFiltersText.textContent = "🚨 No recipes available. API quota exceeded!";
    return;
  }

  if (recipes.length > 0) {
    const randomIndex = Math.floor(Math.random() * recipes.length);
    displayRecipes([recipes[randomIndex]]);
  } else {
    selectedFiltersText.textContent = "⚠️ No recipes available. Try again later.";
  }
};

// CLEAR FILTERS
const clearFilters = () => {
  dietFilter.value = "all";
  cuisineFilter.value = "all";
  timeFilter.value = "all";
  sortFilter.value = "none";
  searchInput.value = "";

  displayRecipes(recipes);
  updateSelectedFiltersText();
};

// SEARCH BAR
const searchRecipes = () => {
  const query = searchInput.value.toLowerCase().trim();

  if (!query) {
    displayRecipes(recipes);
    return;
  }

  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(query) ||
    (recipe.extendedIngredients || []).some(ing => ing.name.toLowerCase().includes(query))
  );

  if (filteredRecipes.length === 0) {
    container.innerHTML = `<p class="no-recipes">No recipes found for "${query}". Try another search!</p>`;
  } else {
    displayRecipes(filteredRecipes);
  }
};


// FILTER & SORT FUNCTIONALITY
const filterAndSortRecipes = () => {
  let filteredRecipes = [...recipes];

  if (dietFilter.value !== "all") {
    filteredRecipes = filteredRecipes.filter(recipe => recipe[dietFilter.value]);
  }

  if (cuisineFilter.value !== "all") {
    filteredRecipes = filteredRecipes.filter(recipe =>
      recipe.cuisines.includes(cuisineFilter.value)
    );
  }

  const sortingMethods = {
    "time-asc": (a, b) => a.readyInMinutes - b.readyInMinutes,
    "popularity-desc": (a, b) => b.aggregateLikes - a.aggregateLikes
  };

  if (sortFilter.value in sortingMethods) {
    filteredRecipes.sort(sortingMethods[sortFilter.value]);
  }

  displayRecipes(filteredRecipes);
};

// EVENT LISTENERS BUTTON AND SEARCH
clearBtn.addEventListener("click", clearFilters);
randomBtn.addEventListener("click", getRandomRecipe);
searchInput.addEventListener("input", searchRecipes);

// FILTER EVENT LISTENERS
[dietFilter, cuisineFilter, timeFilter, sortFilter].forEach(filter => {
  filter.addEventListener("change", () => {
    filterAndSortRecipes();
    updateSelectedFiltersText();
  });
});

// INITIALIZE PAGE
document.addEventListener("DOMContentLoaded", fetchRecipes);

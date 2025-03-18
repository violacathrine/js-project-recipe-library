// GLOBAL VARIABLES
const API_KEY = 'b362b9edeed54639b64b0e6176d9ab9e';
const ALLOWED_DIETS = ['vegan', 'vegetarian', 'gluten-free', 'dairy-free'];
const ALLOWED_CUISINES = ["mediterranean", "middle-eastern", "asian", "italian", "american"];

// FUNCTION TO GET ELEMENT BY ID //
const getElement = id => document.getElementById(id);

// DOM ELEMENTS
const elements = {
  loadingIndicator: getElement("loading"),
  errorContainer: getElement("error-container"),
  filtersInfo: getElement("filters-info"),
  dietFilter: getElement("diet-filter"),
  cuisineFilter: getElement("cuisine-filter"),
  timeFilter: getElement("time-filter"),
  sortFilter: getElement("sort-filter"),
  clearBtn: getElement("clearBtn"),
  randomBtn: getElement("randomBtn"),
  container: getElement("recipe-container"),
  recipeCountElement: getElement("recipe-count"),
  searchInput: getElement("search-input"),
};

// GLOBAL STATE
const state = {
  recipes: [],
  apiQuotaExceeded: false,
};

// CAPITALIZE STRING //
const capitalizeString = str => str.charAt(0)
  .toUpperCase() + str.slice(1).toLowerCase();

const capitalize = input => {
  if (Array.isArray(input)) return input.map(capitalizeString);
  if (typeof input === "string") return capitalizeString(input);
  return input;
};

// TOGGLE LOADING & ERROR MESSAGES //
const toggleLoading = show => {
  elements.loadingIndicator.style.display = show ? "block" : "none";
};

const showErrorMessage = (message = "An unknown error occurred.") => {
  toggleLoading(false);
  elements.errorContainer.innerHTML = `<p class="error-message">${message}</p>`;
  state.apiQuotaExceeded = true;
};

// API & DATA HANDLING //
const getRecipesFromAPI = async () => {
  const response = await fetch(
    `https://api.spoonacular.com/recipes/random?number=100&apiKey=${API_KEY}`);

  if (!response.ok) {
    throw new Error(`Error! Status: ${response.status}`);
  }

  const data = await response.json();
  return data.recipes;
};

// FETCH RECIPES //
const fetchRecipes = async () => {
  toggleLoading(true);
  state.apiQuotaExceeded = false;

  try {
    const recipes = await getRecipesFromAPI();
    state.recipes = recipes;

    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem("recipesData", JSON.stringify({ recipes, savedDate: today }));

    console.log("New recipes saved in Local Storage.");
    displayRecipes(state.recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    showErrorMessage("Failed to load recipes. Please try again later.");
    state.recipes = [];
  } finally {
    toggleLoading(false);
  }
};

// LOCALSTORAGE //
const loadSavedRecipes = () => {
  const savedData = localStorage.getItem("recipesData");
  if (!savedData) {
    return fetchRecipes();
  }

  const { recipes: savedRecipes, savedDate } = JSON.parse(savedData);
  const today = new Date().toISOString().split("T")[0];

  if (savedDate === today) {
    state.recipes = savedRecipes;
    displayRecipes(state.recipes);
    return;
  }

  fetchRecipes();
};

//  RECIPE DISPLAY //
const getDietText = recipe => {
  if (recipe.vegan) return "Vegan";
  if (recipe.vegetarian) return "Vegetarian";
  if (recipe.glutenFree) return "Gluten free";
  if (recipe.dairyFree) return "Dairy free";

  if (Array.isArray(recipe.diets) && recipe.diets.length > 0) {
    const firstAllowedDiet = recipe.diets.find(diet =>
      ALLOWED_DIETS.includes(diet.toLowerCase())
    );

    if (firstAllowedDiet) {
      return capitalizeString(firstAllowedDiet.replace("-", " "));
    }
  }

  return "No specific diet";
};

// FILTER OUT CUISINES NOT IN ALLOWED_CUISINES ARRAY //
const getCuisineText = recipe => {
  if (Array.isArray(recipe.cuisines) && recipe.cuisines.length > 0) {
    const firstAllowedCuisine = recipe.cuisines.find(cuisine =>
      ALLOWED_CUISINES.includes(cuisine.toLowerCase())
    );

    if (firstAllowedCuisine) {
      return capitalizeString(firstAllowedCuisine.replace("-", " "));
    }
  }
  return "Other cuisine";
};

// CREATE RECIPE CARD //
const createRecipeCard = recipe => {
  if (!recipe.image) return null;

  const recipeCard = document.createElement("div");
  recipeCard.classList.add("recipe-card");

  const finalDiet = getDietText(recipe);
  const cuisine = getCuisineText(recipe);
  const time = recipe.readyInMinutes ? `${recipe.readyInMinutes} min` : "Unknown time";
  const ingredients = recipe.extendedIngredients?.length
    ? recipe.extendedIngredients.map(ing => capitalizeString(ing.name)).join(", ")
    : "No ingredients listed";

  recipeCard.innerHTML = `
    <img src="${recipe.image}" alt="${recipe.title}">
    <h3>${capitalizeString(recipe.title)}</h3>
    <hr class="recipe-divider">
    <p><strong>Diet:</strong> ${finalDiet}</p>
    <p><strong>Cuisine:</strong> ${cuisine}</p>
    <p><strong>Time:</strong> ${time}</p>
    <hr class="recipe-divider">
    <p><strong>Ingredients:</strong> ${ingredients}</p>
    <div class="recipe-preview">
      <a href="${recipe.sourceUrl}" 
      target="_blank" class="view-recipe-btn">View Full Recipe</a>
    </div>
  `;

  return recipeCard;
};

// DISPLAY RECIPES //
const displayRecipes = (recipeList = []) => {
  if (!Array.isArray(recipeList)) {
    console.error("Error: recipeList is not an array!", recipeList);
    return;
  }

  elements.container.innerHTML = "";
  elements.recipeCountElement.textContent = `Showing recipes: ${recipeList.length}`;

  if (state.apiQuotaExceeded) return;

  if (recipeList.length === 0) {
    elements.container.innerHTML = `
    <p class="no-recipes">Sorry, no recipes found. 
    Try adjusting your selections!</p>`;
    return;
  }

  recipeList.forEach(recipe => {
    const card = createRecipeCard(recipe);
    if (card) elements.container.appendChild(card);
  });
};

// FILTERS & SORTING //
const updateFilterStyle = filterElement => {
  filterElement.classList.remove("active-filter", "sort-active");
  if (filterElement === elements.sortFilter) {
    filterElement.style.backgroundColor = "#ffecea";
    filterElement.style.color = "#0018a4";
  } else {
    filterElement.style.backgroundColor = "#ccffe2";
    filterElement.style.color = "#0018a4";
  }
  filterElement.style.border = "2px solid #FAFBFF";

  if (filterElement.value !== "all" && filterElement.value !== "none") {
    if (filterElement === elements.sortFilter) {
      filterElement.style.backgroundColor = "#ff6589";
      filterElement.classList.add("sort-active");
    } else {
      filterElement.style.backgroundColor = "#0018a4";
      filterElement.classList.add("active-filter");
    }
    filterElement.style.color = "white";
    filterElement.style.border = filterElement === elements.sortFilter
      ? "2px solid #ff6589"
      : "2px solid #0018a4";
  }
};

// UPDATE FILTERS INFO //
const updateFiltersInfo = () => {
  const activeFilters = [];

  // CHECK DIET FILTER
  if (elements.dietFilter.value !== "all") {
    activeFilters.push(capitalizeString(elements.dietFilter.value));
  }

  //  CHECK CUISINE FILTER
  if (elements.cuisineFilter.value !== "all") {
    activeFilters.push(capitalizeString(elements.cuisineFilter.value));
  }

  // CHECK TIME FILTER
  if (elements.timeFilter.value !== "all") {
    const timeText = {
      "under-15": "Under 15 min",
      "15-30": "15-30 min",
      "30-60": "30-60 min",
      "over-60": "Over 60 min"
    }[elements.timeFilter.value];
    activeFilters.push(timeText);
  }

  // CHECK SORT FILTER
  const sortText = elements.sortFilter.value !== "none"
    ? `Sorted by: ${elements.sortFilter.value === "time-asc" ? "Time" : "Popularity"}`
    : "";

  // CREATE FILTERS INFO TEXT
  const filtersText = activeFilters.length > 0
    ? `Selected filters: ${activeFilters.join(", ")}`
    : "Selected filters: None";

  elements.filtersInfo.innerHTML = `
    <p class="filter-text">${filtersText}</p>
    ${sortText ? `<p class="sort-text">${sortText}</p>` : ""}
  `;
};

// RESET FILTERS //
const resetFilters = () => {
  [elements.dietFilter, elements.cuisineFilter, elements.timeFilter].forEach(filter => {
    filter.value = "all";
    filter.classList.remove("active-filter");
    filter.style.backgroundColor = "#ccffe2";
    filter.style.color = "#0018a4";
    filter.style.border = "2px solid #FAFBFF";
  });

  elements.sortFilter.value = "none";
  elements.sortFilter.classList.remove("sort-active");
  elements.sortFilter.style.backgroundColor = "#ffecea";
  elements.sortFilter.style.color = "#0018a4";
  elements.sortFilter.style.border = "2px solid #FAFBFF";

  elements.searchInput.value = "";
  elements.filtersInfo.innerHTML = ""; // Clear the filters info text
};

// FILTER FUNCTIONS //
const filterByDiet = recipe => {
  if (elements.dietFilter.value === "all") return true;

  const selectedDiet = elements.dietFilter.value.replace("-", " ").toLowerCase();
  const dietProperties = {
    "vegan": recipe.vegan,
    "vegetarian": recipe.vegetarian,
    "gluten free": recipe.glutenFree,
    "dairy free": recipe.dairyFree
  };

  return dietProperties[selectedDiet] ||
    (Array.isArray(recipe.diets) && recipe.diets.some(diet =>
      diet.toLowerCase() === selectedDiet));
};

const filterByCuisine = recipe => {
  if (elements.cuisineFilter.value === "all") return true;

  return Array.isArray(recipe.cuisines) && recipe.cuisines.some(cuisine =>
    cuisine.toLowerCase() === elements.cuisineFilter.value.toLowerCase());
};

const filterByTime = recipe => {
  if (elements.timeFilter.value === "all" || !recipe.readyInMinutes) return true;

  const time = recipe.readyInMinutes;
  const timeRanges = {
    "under-15": time < 15,
    "15-30": time >= 15 && time <= 30,
    "30-60": time > 30 && time <= 60,
    "over-60": time > 60
  };

  return timeRanges[elements.timeFilter.value] || false;
};

const sortRecipes = recipes => {
  const sortValue = elements.sortFilter.value;
  if (sortValue === "none") return recipes;

  const sortedRecipes = [...recipes];

  switch (sortValue) {
    case "time-asc":
      return sortedRecipes.sort((a, b) => (a.readyInMinutes || 0) - (b.readyInMinutes || 0));
    case "popularity-desc":
      return sortedRecipes.sort((a, b) => (b.aggregateLikes || 0) - (a.aggregateLikes || 0));
    default:
      return sortedRecipes;
  }
};

//  SEARCH & RANDOM-BUTTON
const getRandomRecipeFromList = recipes => {
  return recipes[Math.floor(Math.random() * recipes.length)];
};

const getRandomRecipe = () => {
  if (state.recipes.length === 0) return;

  const filteredRecipes = filterAndSortRecipes();
  if (filteredRecipes.length === 0) return;

  const randomRecipe = getRandomRecipeFromList(filteredRecipes);
  displayRecipes([randomRecipe]);
};

const searchRecipes = () => {
  const searchTerm = elements.searchInput.value.toLowerCase().trim();

  if (!searchTerm) {
    displayRecipes(filterAndSortRecipes());
    return;
  }

  const matchesSearch = recipe => {
    const searchFields = [
      recipe.title,
      ...(recipe.cuisines || []),
      ...(recipe.diets || []),
      ...(recipe.extendedIngredients?.map(ing => ing.name) || [])
    ];

    return searchFields.some(field =>
      field?.toString().toLowerCase().includes(searchTerm)
    );
  };

  const searchResults = filterAndSortRecipes().filter(matchesSearch);
  displayRecipes(searchResults);
};

// FILTER & SORT LOGIC //
const filterAndSortRecipes = () => {
  return sortRecipes(
    state.recipes.filter(recipe =>
      filterByDiet(recipe) &&
      filterByCuisine(recipe) &&
      filterByTime(recipe)
    )
  );
};

// EVENT LISTENERS //
const initializeEventListeners = () => {
  [elements.dietFilter, elements.cuisineFilter, elements.timeFilter].forEach(filter => {
    filter.addEventListener("change", () => {
      updateFilterStyle(filter);
      updateFiltersInfo();
      displayRecipes(filterAndSortRecipes());
    });
  });

  elements.sortFilter.addEventListener("change", () => {
    updateFilterStyle(elements.sortFilter);
    updateFiltersInfo();
    displayRecipes(filterAndSortRecipes());
  });

  elements.clearBtn.addEventListener("click", () => {
    resetFilters();
    displayRecipes(state.recipes);
  });

  elements.randomBtn.addEventListener("click", getRandomRecipe);

  elements.searchInput.addEventListener("input", () => {
    displayRecipes(filterAndSortRecipes());
  });
};

// INITIALIZE PAGE //
document.addEventListener("DOMContentLoaded", () => {
  loadSavedRecipes();
  initializeEventListeners();
});

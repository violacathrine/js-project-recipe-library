// Function to get DOM element by ID
const getElement = id => document.getElementById(id);

// DOM ELEMENTS
const elements = {
  loadingIndicator: getElement("loading"),
  errorContainer: getElement("error-container"),
  selectedFiltersText: getElement("selected-filters"),
  selectedSorting: getElement("selected-sorting"),
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

// GLOBAL STATE IN AN OBJECT FOR BETTER ORGANIZATION
const state = {
  recipes: [],
  apiQuotaExceeded: false,
};

// LOCAL STORAGE LOAD SAVED RECIPES
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

/* FUNCTION TO CAPITALIZE FIRST LETTER OF
EACH WORD IN A STRING IF OUTCOME FROM API IS DIFFERENT */
const capitalizeString = str => str.charAt(0).toUpperCase() + str.slice(1);

const capitalize = input => {
  if (Array.isArray(input)) return input.map(capitalizeString);
  if (typeof input === "string") return capitalizeString(input);
  return input;
};

// LOADING INDICATOR
const toggleLoading = show => {
  elements.loadingIndicator.style.display = show ? "block" : "none";
};

// ERROR MESSAGE
const showErrorMessage = (message = "An unknown error occurred.") => {
  toggleLoading(false);
  elements.errorContainer.innerHTML = `<p class="error-message">${message}</p>`;
  state.apiQuotaExceeded = true;
};

// "CALLING THE API DATA"
const getRecipesFromAPI = async () => {
  const apiKey = "b362b9edeed54639b64b0e6176d9ab9e";
  const response = await fetch(`https://api.spoonacular.com/recipes/random?number=10&apiKey=${apiKey}`);

  if (!response.ok) {
    throw new Error(`Error! Status: ${response.status}`);
  }

  const data = await response.json();
  return data.recipes;
};


// "SAVING" THE API-DATA
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


// DISPLAY RECIPES
const displayRecipes = (recipeList = []) => {
  if (!Array.isArray(recipeList)) {
    console.error("Error: recipeList is not an array!", recipeList);
    return;
  }

  elements.container.innerHTML = "";
  elements.recipeCountElement.textContent = `Showing recipes: ${recipeList.length}`;
  if (state.apiQuotaExceeded) return;

  if (recipeList.length === 0) {
    elements.container.innerHTML = `<p class="no-recipes">Sorry, no recipes found. Try adjusting your selections!</p>`;
    return;
  }

  recipeList.forEach(recipe => {
    if (!recipe.image) return;
    elements.container.appendChild(createRecipeCard(recipe));
  });
};

// CREATE RECIPE CARD
const createRecipeCard = recipe => {
  const recipeCard = document.createElement("div");
  recipeCard.classList.add("recipe-card");

  const finalDiet = getDietText(recipe);
  const cuisine = recipe.cuisines?.length ? capitalize(recipe.cuisines).join(", ") : "Not specified";
  const time = recipe.readyInMinutes ? `${recipe.readyInMinutes} min` : "Unknown time";
  const ingredients = recipe.extendedIngredients?.length
    ? capitalize(recipe.extendedIngredients.map(ing => ing.name)).join(", ")
    : "No ingredients listed";

  recipeCard.innerHTML = `
    <a href="${recipe.sourceUrl}" target="_blank" class="recipe-link">
      <img src="${recipe.image}" alt="${recipe.title}">
      <h3>${capitalize(recipe.title)}</h3>
      <hr class="recipe-divider">
      <p><strong>Diet:</strong> ${finalDiet}</p>
      <p><strong>Cuisine:</strong> ${cuisine}</p>
      <p><strong>Time:</strong> ${time}</p>
      <hr class="recipe-divider">
      <p><strong>Ingredients:</strong> ${ingredients}</p>
    </a>
  `;

  return recipeCard;
};

// GET DIET TEXT
const getDietText = recipe => {
  const allowedDiets = ["vegan", "vegetarian", "gluten-free", "dairy-free"];
  const dietList = [];

  if (recipe.vegan) dietList.push("vegan");
  if (recipe.vegetarian) dietList.push("vegetarian");
  if (recipe.glutenFree) dietList.push("gluten-free");
  if (recipe.dairyFree) dietList.push("dairy-free");

  if (Array.isArray(recipe.diets)) {
    recipe.diets.forEach(diet => {
      const formattedDiet = diet.toLowerCase();
      if (allowedDiets.includes(formattedDiet) && !dietList.includes(formattedDiet)) {
        dietList.push(formattedDiet);
      }
    });
  }

  let selectedDiet = elements.dietFilter.value.toLowerCase();
  if (selectedDiet !== "all" && dietList.includes(selectedDiet)) {
    return capitalize(selectedDiet.replace("-", " "));
  }

  return dietList.length > 0 ? capitalize(dietList.join(", ").replace(/-/g, " ")) : "No specific diet";
};


// FILTER AND SORTING STYLES
const updateFilterStyle = filterElement => {
  filterElement.classList.remove("active-filter", "sort-active");

  if (filterElement.value === "none") return;

  const classToAdd = filterElement === elements.sortFilter ? "sort-active" : "active-filter";
  filterElement.classList.add(classToAdd);
};


// UPDATE FILTER/SORTING TEXT
const getSelectedText = selectElement =>
  selectElement.options[selectElement.selectedIndex].text;

const updateSelectedFiltersText = () => {
  const selectedFilters = [];

  if (elements.dietFilter.value !== "all")
    selectedFilters.push(capitalize(elements.dietFilter.value));

  if (elements.cuisineFilter.value !== "all")
    selectedFilters.push(capitalize(elements.cuisineFilter.value));

  if (elements.timeFilter.value !== "all")
    selectedFilters.push(capitalize(getSelectedText(elements.timeFilter)));

  elements.selectedFiltersText.textContent = selectedFilters.length
    ? `Selected filters: ${selectedFilters.join(", ")}`
    : "Selected filters: All";

  elements.selectedSorting.textContent = elements.sortFilter.value !== "none"
    ? `Sorted by: ${capitalize(getSelectedText(elements.sortFilter))}`
    : "Sorted by: None";
};


// GET RANDOM RECIPE
const getRandomRecipe = () => {
  if (state.apiQuotaExceeded) {
    showErrorMessage("🚨 No recipes available. API quota exceeded!");
    return;
  }

  if (!state.recipes.length) {
    showErrorMessage("⚠️ No recipes available. Try again later.");
    return;
  }

  displayRecipes([getRandomRecipeFromList()]);
};

const getRandomRecipeFromList = () => {
  const randomIndex = Math.floor(Math.random() * state.recipes.length);
  return state.recipes[randomIndex];
};


// CLEAR FILTERS
const clearFilters = () => {
  resetFilters(); // Återställ alla filter och sökfält
  state.recipes = JSON.parse(localStorage.getItem("recipesData"))?.recipes || []; // Ladda om sparade recept
  displayRecipes(state.recipes); // Visa alla recept igen
  updateSelectedFiltersText(); // Uppdatera UI för valda filter
};

const resetFilters = () => {
  elements.dietFilter.value = "all";
  elements.cuisineFilter.value = "all";
  elements.timeFilter.value = "all";
  elements.sortFilter.value = "none";
  elements.searchInput.value = "";

  [elements.dietFilter, elements.cuisineFilter, elements.timeFilter, elements.sortFilter].forEach(filter => {
    filter.classList.remove("active-filter", "sort-active");
  });
};


// SEARCH BAR
const searchRecipes = () => {
  const query = elements.searchInput.value.toLowerCase().trim();

  // Om sökrutan är tom, visa alla recept baserat på valda filter och sortering
  if (!query) {
    filterAndSortRecipes();
    return;
  }

  let filteredRecipes = state.recipes
    .filter(filterByDiet)
    .filter(filterByCuisine)
    .filter(filterByTime)
    .filter(recipe => {
      // Kontrollera om titeln innehåller sökordet
      const titleMatch = recipe.title.toLowerCase().includes(query);

      // Kontrollera om ingredienserna innehåller sökordet
      const ingredientsMatch = recipe.extendedIngredients?.some(ing =>
        ing.name.toLowerCase().includes(query)
      );

      // Kontrollera om cuisine innehåller sökordet
      const cuisineMatch = recipe.cuisines?.some(cuisine =>
        cuisine.toLowerCase().includes(query)
      );

      // Kontrollera om diet innehåller sökordet
      const dietMatch = (recipe.diets || [])
        .concat(
          recipe.vegan ? ["vegan"] : [],
          recipe.vegetarian ? ["vegetarian"] : [],
          recipe.glutenFree ? ["gluten-free"] : [],
          recipe.dairyFree ? ["dairy-free"] : []
        )
        .some(diet => diet.toLowerCase().includes(query));

      return titleMatch || ingredientsMatch || cuisineMatch || dietMatch;
    });

  displayRecipes(filteredRecipes);
};



// FILTER & SORT FUNCTIONALITY
const filterAndSortRecipes = () => {
  let filteredRecipes = state.recipes
    .filter(filterByDiet)
    .filter(filterByCuisine)
    .filter(filterByTime);

  filteredRecipes = sortRecipes(filteredRecipes);

  displayRecipes(filteredRecipes);
};

// Filter by diet
const filterByDiet = recipe => {
  if (elements.dietFilter.value === "all") return true;
  const selectedDiet = elements.dietFilter.value.replace("-", " ").toLowerCase();

  return (
    (selectedDiet === "vegan" && recipe.vegan) ||
    (selectedDiet === "vegetarian" && recipe.vegetarian) ||
    (selectedDiet === "gluten free" && recipe.glutenFree) ||
    (selectedDiet === "dairy free" && recipe.dairyFree) ||
    (Array.isArray(recipe.diets) && recipe.diets.some(diet => diet.toLowerCase() === selectedDiet))
  );
};

// Filter by cuisine
const allowedCuisines = ["italian", "mediterranean", "middle eastern", "asian", "american"];

const filterByCuisine = recipe => {
  const selectedCuisine = elements.cuisineFilter.value.toLowerCase();

  if (!Array.isArray(recipe.cuisines) || recipe.cuisines.length === 0) {
    return false;
  }
  const hasValidCuisine = recipe.cuisines.some(cuisine =>
    allowedCuisines.includes(cuisine.toLowerCase())
  );

  if (!hasValidCuisine) return false;
  if (selectedCuisine === "all") return true;
  return recipe.cuisines.some(cuisine => cuisine.toLowerCase() === selectedCuisine);
};


// Filter by time
const filterByTime = recipe => {
  if (elements.timeFilter.value === "all") return true;
  const timeRanges = {
    "under-15": time => time < 15,
    "15-30": time => time >= 15 && time <= 30,
    "30-60": time => time > 30 && time <= 60,
    "over-60": time => time > 60,
  };
  return timeRanges[elements.timeFilter.value](recipe.readyInMinutes || 0);
};


//Sort recipes
const sortRecipes = recipes => {
  const sortingMethods = {
    "time-asc": (a, b) => (a.readyInMinutes || 0) - (b.readyInMinutes || 0),
    "time-desc": (a, b) => (b.readyInMinutes || 0) - (a.readyInMinutes || 0),
    "popularity-desc": (a, b) => (b.aggregateLikes || 0) - (a.aggregateLikes || 0),
  };

  return elements.sortFilter.value in sortingMethods
    ? recipes.sort(sortingMethods[elements.sortFilter.value])
    : recipes;
};

// EVENT LISTENERS
const initializeEventListeners = () => {
  elements.clearBtn.addEventListener("click", clearFilters);
  elements.randomBtn.addEventListener("click", getRandomRecipe);
  elements.searchInput.addEventListener("input", searchRecipes);
  [elements.dietFilter, elements.cuisineFilter,
  elements.timeFilter, elements.sortFilter].forEach(filter => {
    filter.addEventListener("change", () => {
      filterAndSortRecipes();
      updateSelectedFiltersText();
      updateFilterStyle(filter);
    });
  });
};

// INITIALIZE PAGE
document.addEventListener("DOMContentLoaded", () => {
  loadSavedRecipes();
  initializeEventListeners();
});

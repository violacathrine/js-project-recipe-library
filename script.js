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

// LOCAL STORAGE LOAD SAVED RECIPES
const loadSavedRecipes = () => {
  const savedData = localStorage.getItem("recipesData");

  if (savedData) {
    const { recipes: savedRecipes, savedDate } = JSON.parse(savedData);
    const today = new Date().toISOString().split("T")[0];

    if (savedDate === today) {
      console.log("✅ Loading recipes from Local Storage.");
      recipes = savedRecipes;
      displayRecipes(recipes);
      return; // Viktigt att returnera här för att stoppa vidare körning
    } else {
      console.log("📅 Saved recipes are from a different day. Fetching new recipes.");
    }
  } else {
    console.log("💾 No saved recipes found. Fetching new recipes.");
  }

  console.log("🌐 Fetching new recipes from API...");
  fetchRecipes(); // Hämta nya recept om det inte finns giltiga sparade recept
};


// FUNCTION TO CAPITALIZE FIRST LETTER OF EACH WORD IN A STRING
const capitalize = (input) => {
  if (Array.isArray(input)) {
    return input.map(item => item.charAt(0).toUpperCase() + item.slice(1));
  } else if (typeof input === "string") {
    return input.charAt(0).toUpperCase() + input.slice(1);
  }
  return input; // Return unchanged if not string or array
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
    const apiKey = "b362b9edeed54639b64b0e6176d9ab9e"; // Ersätt med din riktiga API-nyckel
    const response = await fetch(`https://api.spoonacular.com/recipes/random?number=100&apiKey=${apiKey}`);

    if (!response.ok) {
      throw new Error(`Error! Status: ${response.status}`);
    }

    const data = await response.json();
    recipes = data.recipes;

    // 🟢 Spara recepten i Local Storage med dagens datum
    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
    localStorage.setItem("recipesData", JSON.stringify({ recipes, savedDate: today }));

    console.log("✅ New recipes saved in Local Storage.");
    displayRecipes(recipes);

  } catch (error) {
    console.error("Error fetching recipes:", error);
    showErrorMessage("⚠️ Failed to load recipes. Please try again later.");
    recipes = [];

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

    // 🔵 Kapitalisera bara vid visning
    const cuisine = recipe.cuisines?.length ? capitalize(recipe.cuisines).join(", ") : "Not specified";
    const ingredients = recipe.extendedIngredients?.length
      ? capitalize(recipe.extendedIngredients.map(ing => ing.name)).join(", ")
      : "No ingredients listed";

    recipeCard.innerHTML = `
    <a href="${recipe.sourceUrl}" target="_blank" class="recipe-link">
      <img src="${recipe.image}" alt="${recipe.title}">
      <h3>${capitalize(recipe.title)}</h3>
      <hr class="recipe-divider">
      <p><strong>Diet:</strong> ${diet}</p>
      <p><strong>Cuisine:</strong> ${cuisine}</p>
      <p><strong>Time:</strong> ${recipe.readyInMinutes} min</p>
      <hr class="recipe-divider">
      <p><strong>Ingredients:</strong> ${ingredients}</p>
      </a>
    `;

    container.appendChild(recipeCard);
  });
};

// FILTER AND SORTING STYLES
const updateFilterStyle = (filterElement) => {
  // Tar först bort den aktiva färgen från alla filter innan vi lägger till den igen
  filterElement.classList.remove("active-filter", "sort-active");
  // Om ett filter väljs (inklusive "All"), lägg till den aktiva färgen
  if (filterElement.value !== "none") {
    if (filterElement === sortFilter) {
      filterElement.classList.add("sort-active"); // Rosa färg för sortering
    } else {
      filterElement.classList.add("active-filter"); // Blå färg för filter (inkl. "All")
    }
  }
};

// UPDATE FILTER TEXT
const updateSelectedFiltersText = () => {
  let selectedFilters = [];

  if (dietFilter.value !== "all") selectedFilters.push(capitalize([dietFilter.value])[0]);
  if (cuisineFilter.value !== "all") selectedFilters.push(capitalize([cuisineFilter.value])[0]);
  if (timeFilter.value !== "all") selectedFilters.push(capitalize([timeFilter.options[timeFilter.selectedIndex].text])[0]);

  selectedFiltersText.textContent = selectedFilters.length > 0
    ? `Selected filters: ${selectedFilters.join(", ")}`
    : "Selected filters: All";

  selectedSorting.textContent = sortFilter.value !== "none"
    ? `Sorted by: ${capitalize([sortFilter.options[sortFilter.selectedIndex].text])[0]}`
    : "Sorted by: None";
};

// GET RANDOM RECIPE
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

  [dietFilter, cuisineFilter, timeFilter, sortFilter].forEach(filter => {
    filter.classList.remove("active-filter", "sort-active");
  });

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
    recipeCountElement.textContent = `Showing recipes: 0`;
    container.innerHTML = `<p class="no-recipes">No recipes found for "${query}". Try another search!</p>`;
  } else {
    displayRecipes(filteredRecipes);
  }
};


// FILTER & SORT FUNCTIONALITY
const filterAndSortRecipes = () => {
  let filteredRecipes = [...recipes];

  // ✅ Diet-filter (hanterar boolean-värden korrekt)
  if (dietFilter.value !== "all") {
    filteredRecipes = filteredRecipes.filter(recipe => {
      if (dietFilter.value === "vegetarian") return recipe.vegetarian === true;
      if (dietFilter.value === "vegan") return recipe.vegan === true;
      if (dietFilter.value === "gluten-free") return recipe.glutenFree === true;
      if (dietFilter.value === "dairy-free") return recipe.dairyFree === true;
      return false;
    });
  }

  // ✅ Cuisine-filter (hanterar listor korrekt)
  if (cuisineFilter.value !== "all") {
    filteredRecipes = filteredRecipes.filter(recipe => {
      return recipe.cuisines.some(cuisine =>
        cuisine.toLowerCase() === cuisineFilter.value.toLowerCase()
      );
    });
  }

  // ✅ Time-filter (hanterar siffror korrekt)
  const timeRanges = {
    "under-15": (time) => time < 15,
    "15-30": (time) => time >= 15 && time <= 30,
    "30-60": (time) => time > 30 && time <= 60,
    "over-60": (time) => time > 60,
  };

  if (timeFilter.value !== "all") {
    filteredRecipes = filteredRecipes.filter(recipe =>
      timeRanges[timeFilter.value](recipe.readyInMinutes)
    );
  }

  // ✅ Sorting
  const sortingMethods = {
    "time-asc": (a, b) => a.readyInMinutes - b.readyInMinutes,
    "popularity-desc": (a, b) => (b.aggregateLikes || 0) - (a.aggregateLikes || 0),
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
    updateFilterStyle(filter);
  });
});

// INITIALIZE PAGE
document.addEventListener("DOMContentLoaded", loadSavedRecipes);


// DOM-element
const loadingIndicator = document.getElementById("loading");
const errorContainer = document.getElementById("error-container");
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

// LOADING INDICATOR
const toggleLoading = (show) => {
  loadingIndicator.style.display = show ? "block" : "none";
};

// ERROR MESSAGE
const showErrorMessage = (message) => {
  console.log("🔴 showErrorMessage() körs: ", message);

  loadingIndicator.style.display = "none"; // 🔥 Dölj "Loading recipes..."

  // ✅ Rensa gamla felmeddelanden innan vi lägger till ett nytt
  errorContainer.innerHTML = "";

  /* 🔴 SE TILL ATT `errorContainer` VISAS
  errorContainer.style.display = "flex";
  errorContainer.style.justifyContent = "center";
  errorContainer.style.alignItems = "center";
  errorContainer.style.flexDirection = "column";
  errorContainer.style.minHeight = "100px";
  errorContainer.style.padding = "10px";
  errorContainer.style.backgroundColor = "#ffe6e6"; */

  // ✅ Skapa felmeddelandet och lägg det i `errorContainer`
  const errorMessage = document.createElement("p");
  errorMessage.textContent = message;
  errorMessage.classList.add("error-message");

  errorContainer.appendChild(errorMessage);

  console.log("🟢 Error message added to errorContainer:", errorContainer.innerHTML);
};

// FETCH RECIPES FROM API //

const fetchRecipes = async () => {
  toggleLoading(true); // Show loading-indikator

  try {
    const apiKey = "29753ab3087c46f9ab04a6285b8c1ea0";
    const response = await fetch(`https://api.spoonacular.com/recipes/random?number=100&apiKey=${apiKey}`);

    if (!response.ok) {
      throw new Error(`Error! Status: ${response.status}`);
    }

    const data = await response.json();
    const selectedCuisines = ["italian", "mediterranean", "middle eastern", "american", "asian"];
    const filteredRecipes = data.recipes.filter(recipe =>
      recipe.cuisines.some(cuisine => selectedCuisines.includes(cuisine.toLowerCase()))
    );

    return filteredRecipes; // Return only filtered recipes

  } catch (error) {
    console.error("Error fetching recipes:", error);

    // 🔴 Kontrollera statuskoden och visa rätt meddelande
    if (error.message.includes("API quota exhausted") || error.message.includes("402")) {
      showErrorMessage("🚨 API quota exhausted! Please try again later or upgrade your plan.");
    } else {
      showErrorMessage("⚠️ Failed to load recipes. Please try again later.");
    }

    return []; // Return empty array if error

  } finally {
    toggleLoading(false); // Hide loading
  }
};

// SHOW ALL RECIPES"
const showAllRecipes = () => {
  displayRecipes(recipes);
  updateSelectedFiltersText();
};

// CAPITALIZE FIRST LETTER
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// RANDOM RECIPE FUNCTION
const getRandomRecipe = () => {
  if (recipes.length === 0) {
    selectedFiltersText.textContent = "No recipes available. Try again later.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * recipes.length);
  displayRecipes([recipes[randomIndex]]);
};

// UPDATED SELECTED FILTERS TEXT
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

  // START WITH STANDARD TEXT
  let filterText = selectedFilters.length > 0 ?
    `Selected filters: ${selectedFilters.join(", ")}` :
    "Selected filters: All";

  // SORTING SEPERATELY
  if (sortFilter.value !== "none") {
    sortedText = `Sorted by: ${capitalizeFirstLetter(sortFilter.options[sortFilter.selectedIndex].text)}`;
  }

  // UPDATE TEXT AT SECOND ROW
  selectedFiltersText.innerHTML = `
    <div>${filterText}</div>
    ${sortedText ? `<div>${sortedText}</div>` : ""}
  `;
};

// RECIPE COUNT
const updateRecipeCount = (recipeList) => {
  if (recipeCountElement) {
    recipeCountElement.textContent = `Showing recipes: ${recipeList.length}`;
  }
}

// DISPLAY RECIPES
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
    if (!recipe.image) return; // Skips recipes without image

    const recipeCard = document.createElement("div");
    recipeCard.classList.add("recipe-card");

    const image = recipe.image;

    const diet =
      recipe.vegetarian ? "Vegetarian" :
        recipe.vegan ? "Vegan" :
          recipe.glutenFree ? "Gluten Free" :
            recipe.dairyFree ? "Dairy Free" :
              "No specific diet";

    const cuisine = recipe.cuisines?.length
      ? recipe.cuisines.join(", ")
      : "Not specified";

    const capitalizeFirstLetter = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    const ingredients = recipe.extendedIngredients?.length
      ? `<ul>${recipe.extendedIngredients.map(ing => `<li>${capitalizeFirstLetter(ing.name)}</li>`).join("")}</ul>`
      : "<p>No ingredients listed</p>";

    recipeCard.innerHTML = `
      <img src="${image}" alt="${recipe.title}">
      <h3>${recipe.title}</h3>
      <hr class="recipe-divider">
      <p><strong>Diet:</strong> ${diet}</p>
      <p><strong>Cuisine:</strong> ${cuisine}</p>
      <p><strong>Time:</strong> ${recipe.readyInMinutes} min</p>
      <hr class="recipe-divider">
      <p><strong>Ingredients:</strong> ${ingredients}</p>
    `;

    container.appendChild(recipeCard);
  });
};

const filterAndSortRecipes = () => {
  let filteredRecipes = [...recipes];

  // Diet filter
  const selectedDiet = dietFilter.value;
  if (selectedDiet !== "all") {
    filteredRecipes = filteredRecipes.filter(recipe => {
      if (selectedDiet === "vegetarian") return recipe.vegetarian === true;
      if (selectedDiet === "vegan") return recipe.vegan === true;
      if (selectedDiet === "gluten-free") return recipe.glutenFree === true;
      if (selectedDiet === "dairy-free") return recipe.dairyFree === true;
      return false;
    });
  }

  // Cuisine filter
  const validCuisines = ["Mediterranean", "Middle Eastern", "Asian", "Italian", "American"];
  const selectedCuisine = cuisineFilter.value;
  if (selectedCuisine !== "all") {
    filteredRecipes = filteredRecipes.filter(recipe =>
      (recipe.cuisines || []).some(cuisine => validCuisines.includes(cuisine) && cuisine.toLowerCase() === selectedCuisine.toLowerCase())
    );
  }

  // Time filter
  const timeRanges = {
    "under-15": (time) => time < 15,
    "15-30": (time) => time >= 15 && time <= 30,
    "30-60": (time) => time > 30 && time <= 60,
    "over-60": (time) => time > 60,
  };

  const selectedTime = timeFilter.value;
  if (selectedTime !== "all") {
    filteredRecipes = filteredRecipes.filter(recipe => timeRanges[selectedTime](recipe.readyInMinutes));
  }

  // Sorting
  const sortingMethods = {
    "time-asc": (a, b) => a.readyInMinutes - b.readyInMinutes,
    "popularity-desc": (a, b) => (b.aggregateLikes || 0) - (a.aggregateLikes || 0),
    "popularity-asc": (a, b) => (a.aggregateLikes || 0) - (b.aggregateLikes || 0),
  };

  if (sortFilter.value in sortingMethods) {
    filteredRecipes.sort(sortingMethods[sortFilter.value]);
  }

  displayRecipes(filteredRecipes);
};

// CLEAR FILTERS AND SEARCH BAR
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


//  List with all filters to loop through
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


// EVENTLISTENERS //
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

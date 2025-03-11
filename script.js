// DOM-element
document.getElementById("loading").style.display = "block"; // ✅ Visa laddningsindikator
document.getElementById("loading").style.display = "none"; // ✅ Göm indikatorn när datan hämtats
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

let recipes = [];

/*Receptarray
const recipes = [
  {
    id: 1,
    title: "Vegan Lentil Soup",
    image: "/assets/images/placeholder.png",
    readyInMinutes: 61,
    servings: 4,
    diets: ["vegan"],
    cuisine: "mediterranean",
    ingredients: [
      "red lentils",
      "carrots",
      "onion",
      "garlic",
      "tomato paste",
      "cumin",
      "paprika",
      "vegetable broth",
      "olive oil",
      "salt"
    ],
    popularity: 85
  },
  {
    id: 2,
    title: "Vegetarian Pesto Pasta",
    image: "/assets/images/placeholder.png",
    readyInMinutes: 25,
    servings: 2,
    diets: ["vegetarian"],
    cuisine: "italian",
    ingredients: [
      "pasta",
      "basil",
      "parmesan cheese",
      "garlic",
      "pine nuts",
      "olive oil",
      "salt",
      "black pepper"
    ],
    popularity: 92
  },
  {
    id: 3,
    title: "Gluten-Free Chicken Stir-Fry",
    image: "/assets/images/placeholder.png",
    readyInMinutes: 20,
    servings: 3,
    diets: ["gluten-free"],
    cuisine: "asian",
    ingredients: [
      "chicken breast",
      "broccoli",
      "bell pepper",
      "carrot",
      "soy sauce (gluten-free)",
      "ginger",
      "garlic",
      "sesame oil",
      "cornstarch",
      "green onion",
      "sesame seeds",
      "rice"
    ],
    popularity: 78
  },
  {
    id: 4,
    title: "Classic American Hamburger",
    image: "/assets/images/placeholder.png",
    readyInMinutes: 14,
    servings: 2,
    diets: [""],
    cuisine: "american",
    ingredients: [
      "bread",
      "meat",
      "parmesan cheese",
      "coleslaw",
      "cucumber",
      "french fries",
      "salt",
      "black pepper"
    ],
    popularity: 92
  },
  {
    id: 5,
    title: "Pizza Margherita",
    image: "/assets/images/placeholder.png",
    readyInMinutes: 31,
    servings: 4,
    diets: [""],
    cuisine: "italian",
    ingredients: [
      "red lentils",
      "carrots",
      "onion",
      "garlic",
      "tomato paste",
      "cumin",
      "paprika",
      "vegetable broth",
      "olive oil",
      "salt"
    ],
    popularity: 85
  },
];
*/

const fetchRecipes = async () => {
  try {
    const apiKey = "29753ab3087c46f9ab04a6285b8c1ea0"; // Ersätt med din Spoonacular API-nyckel
    const response = await fetch(`https://api.spoonacular.com/recipes/random?number=10&apiKey=${apiKey}`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.recipes || !Array.isArray(data.recipes)) {  // ✅ Kontrollera att API:et returnerar en array
      return [];
    }
    return data.recipes; // API returnerar recepten i en "recipes"-array
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return []; // Returnera en tom array om något går fel
  } finally {
  };
}


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
  if (!Array.isArray(recipeList)) {  // ✅ Säkerhetskontroll
    console.error("Error: recipeList is not an array!", recipeList);
    return;
  }

  container.innerHTML = ""; // Rensa innehållet
  updateRecipeCount(recipeList); // Uppdatera antal recept

  if (recipeList.length === 0) {
    container.innerHTML = `
      <p class="no-recipes">Sorry, no recipes found. Try adjusting your selections!</p>
    `;
    return;
  }

  recipeList.forEach(recipe => {
    const recipeCard = document.createElement("div");
    recipeCard.classList.add("recipe-card");

    // Hämta rätt data från Spoonacular API
    const image = recipe.image || "https://via.placeholder.com/300";
    const cuisine = recipe.cuisines.length > 0 ? recipe.cuisines.join(", ") : "Unknown";
    const ingredients = recipe.extendedIngredients ? recipe.extendedIngredients.map(ing => ing.name).join(", ") : "No ingredients listed";

    recipeCard.innerHTML = `
      <img src="${image}" alt="${recipe.title}">
      <h3>${recipe.title}</h3>
      <hr class="recipe-divider">
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
    filteredRecipes = filteredRecipes.filter(recipe =>
      recipe.cuisine === selectedCuisine
    );
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
  } else if (selectedSort === "time-desc") {
    filteredRecipes.sort((a, b) => b.readyInMinutes - a.readyInMinutes); // Longest time first
  } else if (selectedSort === "popularity-desc") {
    filteredRecipes.sort((a, b) => b.popularity - a.popularity); // Most popular first
  } else if (selectedSort === "popularity-asc") {
    filteredRecipes.sort((a, b) => a.popularity - b.popularity); // Least popular first
  }

  displayRecipes(filteredRecipes); // Call function
};

// Clear filters 
const clearFilters = () => {
  dietFilter.value = "all";
  cuisineFilter.value = "all";
  timeFilter.value = "all";
  sortFilter.value = "none";
  if (ingredientFilter) ingredientFilter.value = "all";

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
  // If it is sort use pink color
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

// 🔹 Event listeners
dietFilter.addEventListener("change", filterAndSortRecipes);
cuisineFilter.addEventListener("change", filterAndSortRecipes);
timeFilter.addEventListener("change", filterAndSortRecipes);
sortFilter.addEventListener("change", filterAndSortRecipes);

dietFilter.addEventListener("change", () => updateFilterStyle(dietFilter));
cuisineFilter.addEventListener("change", () => updateFilterStyle(cuisineFilter));
timeFilter.addEventListener("change", () => updateFilterStyle(timeFilter));
sortFilter.addEventListener("change", () => updateFilterStyle(sortFilter));
clearBtn.addEventListener("click", clearFilters);
randomBtn.addEventListener("click", getRandomRecipe);

dietFilter.addEventListener("change", updateSelectedFiltersText);
cuisineFilter.addEventListener("change", updateSelectedFiltersText);
timeFilter.addEventListener("change", updateSelectedFiltersText);
sortFilter.addEventListener("change", updateSelectedFiltersText);
if (ingredientFilter) ingredientFilter.addEventListener("change", updateSelectedFiltersText);

displayRecipes(recipes);
dietFilter.classList.remove("active-filter");
cuisineFilter.classList.remove("active-filter");
timeFilter.classList.remove("active-filter");
sortFilter.classList.remove("active-filter");

document.addEventListener("DOMContentLoaded", async () => {
  recipes = await fetchRecipes(); // ✅ Uppdatera den globala variabeln
  displayRecipes(recipes);
});


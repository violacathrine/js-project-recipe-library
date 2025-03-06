// DOM-element
const selectedFiltersText = document.getElementById("selected-filters");
const container = document.getElementById("recipe-container");
const dietFilter = document.getElementById("diet-filter");
const cuisineFilter = document.getElementById("cuisine-filter");
const timeFilter = document.getElementById("time-filter");
const sortFilter = document.getElementById("sort-filter");
const ingredientFilter = document.getElementById("ingredient-filter");
const clearBtn = document.getElementById("clearBtn"); // Kolla att ID:t matchar i HTML
const randomBtn = document.getElementById("randomBtn"); // Knapp för slumpmässigt recept

// Receptarray
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

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};


const getRandomRecipe = () => {
  const randomIndex = Math.floor(Math.random() * recipes.length);
  const randomRecipe = recipes[randomIndex];

  displayRecipes([randomRecipe]); // Visa endast det sylumpmässiga receptet

  // Ändra texten så att den visar att ett slumpmässigt recept valdes
  selectedFiltersText.textContent = "Here you go, a random selected recipe just for you!";
};

const updateSelectedFiltersText = () => {
  let selectedFilters = [];
  let sortedText = ""; // Lägg till denna variabel!

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

  // Börja med standardtext
  let filterText = selectedFilters.length > 0 ?
    `Selected filters: ${selectedFilters.join(", ")}` :
    "Selected filters: None";

  // Hantera sortering separat
  if (sortFilter.value !== "none") {
    sortedText = `Sorted by: ${capitalizeFirstLetter(sortFilter.options[sortFilter.selectedIndex].text)}`;
  }

  // Uppdatera texten i HTML med radbrytning
  selectedFiltersText.innerHTML = `
    <div>${filterText}</div>
    ${sortedText ? `<div>${sortedText}</div>` : ""}
  `;
};


const displayRecipes = (recipeList) => {
  container.innerHTML = ""; // Rensa befintligt innehåll

  // Om inga recept matchar filtren, visa ett meddelande
  if (recipeList.length === 0) {
    container.innerHTML = `
      <p class="no-recipes">Sorry, no recipes found. Try adjusting your selections!</p>
    `;
    return; // Avbryter funktionen här
  }

  recipeList.forEach(recipe => {
    const recipeCard = document.createElement("div");
    recipeCard.classList.add("recipe-card");

    recipeCard.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.title}">
      <h3>${recipe.title}</h3>
      <hr class="recipe-divider">
      <p><strong>Cuisine:</strong> ${capitalizeFirstLetter(recipe.cuisine)}</p>
      <p><strong>Time:</strong> ${recipe.readyInMinutes} min</p>
      <hr class="recipe-divider">
<p><strong>Ingredients:</strong> ${recipe.ingredients.length}</p>
<ul class="ingredient-list">
  ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join("")}
</ul>
    `;

    container.appendChild(recipeCard);
  });
};


const filterAndSortRecipes = () => {
  let filteredRecipes = [...recipes]; // Kopiera alla recept

  // 🔹 Filtrera baserat på diet (om inte "All" är valt)
  const selectedDiet = dietFilter.value;
  if (selectedDiet !== "all") {
    filteredRecipes = filteredRecipes.filter(recipe =>
      recipe.diets.includes(selectedDiet)
    );
  }

  // 🔹 Filtrera baserat på cuisine (om inte "All" är valt)
  const selectedCuisine = cuisineFilter.value;
  if (selectedCuisine !== "all") {
    filteredRecipes = filteredRecipes.filter(recipe =>
      recipe.cuisine === selectedCuisine
    );
  }

  // 🔹 Filtrera baserat på tillagningstid (om inte "All" är valt)
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

  // 🔹 Sortera efter valt alternativ
  const selectedSort = sortFilter.value;
  if (selectedSort === "time-asc") {
    filteredRecipes.sort((a, b) => a.readyInMinutes - b.readyInMinutes); // Kortast tid först
  } else if (selectedSort === "time-desc") {
    filteredRecipes.sort((a, b) => b.readyInMinutes - a.readyInMinutes); // Längst tid först
  } else if (selectedSort === "popularity-desc") {
    filteredRecipes.sort((a, b) => b.popularity - a.popularity); // Mest populära först
  } else if (selectedSort === "popularity-asc") {
    filteredRecipes.sort((a, b) => a.popularity - b.popularity); // Minst populära först
  }

  displayRecipes(filteredRecipes); // Visa de filtrerade & sorterade recepten
};

const clearFilters = () => {
  // Återställ alla dropdowns till sina standardvärden
  dietFilter.value = "all";
  cuisineFilter.value = "all";
  timeFilter.value = "all";
  sortFilter.value = "none";
  if (ingredientFilter) ingredientFilter.value = "all";

  // Ta bort aktiva färgklasser
  dietFilter.classList.remove("active-filter");
  cuisineFilter.classList.remove("active-filter");
  timeFilter.classList.remove("active-filter");
  sortFilter.classList.remove("sort-active");

  // Visa alla recept igen
  displayRecipes(recipes);

  // Uppdatera filtertexten till "None"
  updateSelectedFiltersText();
};


const updateFilterStyle = (filterElement) => {
  // Om det är sorteringsdropdownen, använd den rosa klassen
  if (filterElement === sortFilter) {
    if (filterElement.value !== "none") {
      filterElement.classList.add("sort-active"); // Lägg till rosa färg
    }
  } else {
    // För de andra dropdowns, använd standard blå färg
    if (filterElement.value !== "all") {
      filterElement.classList.add("active-filter");
    }
  }
};

// 🔹 Event listeners för att uppdatera filtreringen vid valändring
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


document.addEventListener("DOMContentLoaded", () => {
  displayRecipes(recipes);
  dietFilter.classList.remove("active-filter");
  cuisineFilter.classList.remove("active-filter");
  timeFilter.classList.remove("active-filter");
  sortFilter.classList.remove("active-filter");
});

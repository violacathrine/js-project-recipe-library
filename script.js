// DOM-element
const container = document.getElementById("recipe-container");
const dietFilter = document.getElementById("diet-filter");
const cuisineFilter = document.getElementById("cuisine-filter");
const timeFilter = document.getElementById("time-filter");
const sortFilter = document.getElementById("sort-filter");

// Receptarray
const recipes = [
  {
    id: 1,
    title: "Vegan Lentil Soup",
    image: "/assets/images/placeholder.png",
    readyInMinutes: 61,
    servings: 4,
    diets: ["vegan"],
    cuisine: "Mediterranean",
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
    cuisine: "Italian",
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
    cuisine: "Asian",
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
    cuisine: "American",
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
    id: 5,
    title: "Pizza Margherita",
    image: "/assets/images/placeholder.png",
    readyInMinutes: 31,
    servings: 4,
    diets: [""],
    cuisine: "Italian",
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

// Funktion för att visa recept
const displayRecipes = (recipeList) => {
  container.innerHTML = ""; // Rensa befintligt innehåll

  recipeList.forEach(recipe => {
    const recipeCard = document.createElement("div");
    recipeCard.classList.add("recipe-card");

    recipeCard.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.title}">
      <h3>${recipe.title}</h3>
      <hr class="recipe-divider">
      <p><strong>Cuisine:</strong> ${recipe.cuisine}</p>
      <p><strong>Time:</strong> ${recipe.readyInMinutes} min</p>
      <hr class="recipe-divider">
      <p><strong>Ingredients:</strong> ${recipe.ingredients.length}</p>
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
      recipe.cuisine.toLowerCase() === selectedCuisine
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

  displayRecipes(filteredRecipes); // Visa recepten
};

const updateFilterStyle = (filterElement) => {
  // Om något val har gjorts NÅGON gång, behåll mörkblå färg
  filterElement.classList.add("active-filter");
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

// 🔹 Visa alla recept direkt vid sidladdning
document.addEventListener("DOMContentLoaded", () => {
  displayRecipes(recipes);
});

document.addEventListener("DOMContentLoaded", () => {
  dietFilter.classList.remove("active-filter");
  cuisineFilter.classList.remove("active-filter");
  timeFilter.classList.remove("active-filter");
  sortFilter.classList.remove("active-filter");
});
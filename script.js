// Receptarray
const recipes = [
  {
    id: 1,
    title: "Vegan Lentil Soup",
    image: "/assets/images/placeholder.png",
    readyInMinutes: 30,
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
    id: 5,
    title: "Vegan Lentil Soup",
    image: "/assets/images/placeholder.png",
    readyInMinutes: 30,
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
    id: 6,
    title: "Vegan Lentil Soup",
    image: "/assets/images/placeholder.png",
    readyInMinutes: 30,
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
];

// Funktion för att visa recepten
const displayRecipes = (recipeList) => {
  const container = document.getElementById("recipe-container");
  container.innerHTML = ""; // Rensa befintligt innehåll

  recipeList.forEach(recipe => {
    const recipeCard = document.createElement("div");
    recipeCard.classList.add("recipe-card");

    recipeCard.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.title}">
      <h3>${recipe.title}</h3>
      <p><strong>Cuisine:</strong> ${recipe.cuisine}</p>
      <p><strong>Time:</strong> ${recipe.readyInMinutes} min</p>
      <p><strong>Ingredients:</strong> ${recipe.ingredients.length}</p>
    `;

    container.appendChild(recipeCard);
  });
};

// Visa alla recept när sidan laddas
document.addEventListener("DOMContentLoaded", () => {
  displayRecipes(recipes);
});

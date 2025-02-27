//DOM SELECTORS

const filterGroup = document.getElementById("filter-group")
const filterButtons = filterGroup.querySelectorAll(".filter-btn")
const sortGroup = document.getElementById("sort-group")
const sortButtons = sortGroup.querySelectorAll(".sort-btn")
const placeholderBox = document.getElementById("placeholder-box")

// Different messages when specific button is clicked
const messages = {
    all: "You are very hungry huh?",
    italy: "Want to make a pizza maybe?",
    usa: "Or are you in the mood for burgers?",
    china: "Springolls? Okay!",
    desc: "Sorting by descending time.",
    asc: "Sorting by ascending time."
}

// Function for when click button, change color

filterButtons.forEach(button => {
    button.addEventListener("click", (event) => {
        filterButtons.forEach(btn => btn.classList.remove("active"))
        event.target.classList.add("active")
    })
})

// Sort-buttons

sortButtons.forEach(button =>{
    button.addEventListener("click", (event) => {
        sortButtons.forEach(btn => btn.classList.remove("active"))
        event.target.classList.add("active")
    })
})

// Function to get message when button clicked

document.querySelectorAll(".filter-btn, .sort-btn").forEach(button =>
    button.addEventListener("click", () => {
const newMessage = messages[button.dataset.filter] || 
messages[button.dataset.sort] || "No matching filter found."

const paragraph = document.createElement("p")
paragraph.innerText = newMessage

placeholderBox.appendChild(paragraph)
    })
)
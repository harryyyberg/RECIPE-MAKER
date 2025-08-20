const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const mealsContainer = document.getElementById("meals");
const resultHeading = document.getElementById("result-heading");
const errorContainer = document.getElementById("error-container");
const mealDetails = document.getElementById("meal-details");
const mealDetailsContent = document.querySelector(".meal-details-content");
const backBtn = document.getElementById("back-btn");

const BASE_URL = "https://www.themealdb.com/api/json/v1/1/"
const SEARCH_URL = `${BASE_URL}search.php?s=`
const LOOKUP_URL = `${BASE_URL}lookup.php?i=`

searchBtn.addEventListener("click",searchMeals)

mealsContainer.addEventListener("click",handlemealclick)

backBtn.addEventListener("click",()=>mealDetails.classList.add("hidden"));


searchInput.addEventListener("keypress",(e)=>{
    if(e.key === "Enter") searchMeals();
})

async function searchMeals(){
    const searchterm = searchInput.value.trim();

    if(!searchterm){
        errorContainer.textContent="Please enter a valid search term"
        errorContainer.classList.remove("hidden")
        return;
    }

    try{
        resultHeading.textContent=`Searching for "${searchterm}"..`
        mealsContainer.innerHTML="";
        errorContainer.classList.add("hidden")

        //fetch dishes from api
        const response = await fetch(`${SEARCH_URL}${searchterm}`)
        const data = await response.json()

        console.log("data is here.",data)

        if(data.meals === null){
            resultHeading.textContent=``;
            mealsContainer.innerHTML="";
            errorContainer.textContent=`No recipes found for "${searchterm}" , try another search term`
            errorContainer.classList.remove("hidden");
        } else{
            resultHeading.textContent = `search results for "${searchterm}":`

            displaymeals(data.meals);

            searchInput.value = "";
        }
    } catch(error){
        errorContainer.textContent = "Something went wrong.Please try again";
        errorContainer.classList.remove("hidden");
    }
}

function displaymeals(meals){
    mealsContainer.innerHTML=""

    meals.forEach((meal) => {
    mealsContainer.innerHTML += `
      <div class="meal" data-meal-id="${meal.idMeal}">
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        <div class="meal-info">
          <h3 class="meal-title">${meal.strMeal}</h3>
          ${meal.strCategory ? `<div class="meal-category">${meal.strCategory}</div>` : ""}
        </div>
      </div>
    `;
  });
}

async function handlemealclick(e){
    const mealel = e.target.closest(".meal")
    if(!mealel) return;

    const mealid = mealel.getAttribute("data-meal-id");

    try{
        const response = await fetch(`${LOOKUP_URL}${mealid}`);
        const data = await response.json();

        console.log(data);

        if(data.meals && data.meals[0]){
            const meal = data.meals[0]

            const ingredients = []

            for(let i=1;i<20;i++){
                if(meal[`strIngredient${i}`] && meal[`strIngredient${i}`].trim()!== ""){
                    ingredients.push({
                        ingredient: meal[`strIngredient${i}`],
                        measure: meal[`strMeasure${i}`] 
                    })
                }
            }

            mealDetailsContent.innerHTML = `
           <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="meal-details-img">
           <h2 class="meal-details-title">${meal.strMeal}</h2>
           <div class="meal-details-category">
             <span>${meal.strCategory || "Uncategorized"}</span>
           </div>
           <div class="meal-details-instructions">
             <h3>Instructions</h3>
             <p>${meal.strInstructions}</p>
           </div>
           <div class="meal-details-ingredients">
             <h3>Ingredients</h3>
             <ul class="ingredients-list">
               ${ingredients
                 .map(
                   (item) => `
                 <li><i class="fas fa-check-circle"></i> ${item.measure} ${item.ingredient}</li>
               `
                 )
                 .join("")}  
             </ul>
           </div>
           ${
             meal.strYoutube
               ? `
             <a href="${meal.strYoutube}" target="_blank" class="youtube-link">
               <i class="fab fa-youtube"></i> Watch Video
             </a>
           `
               : ""
           }
         `;

         mealDetails.classList.remove("hidden")
         mealDetails.scrollIntoView({behavior:"smooth"});
        }
    }
    catch(error){
        errorContainer.textContent = "Could not load recipe details.Please try again later.";
    }
}
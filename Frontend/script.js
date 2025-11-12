// script.js
const recipeListSection = document.getElementById('recipe-list');
const addRecipeForm = document.getElementById('add-recipe-form');
const generateListBtn = document.getElementById('generate-list-btn'); // Muss im HTML existieren!

// 🚨 WICHTIG: Ändern Sie dies zur AWS URL, sobald deployed!
const API_BASE_URL = 'http://localhost:3000/api'; 

/**
 * Erstellt das HTML-Element für ein einzelnes Rezept ("recipe-card").
 * Dieses Element erhält die Klasse für den Neon-Hover-Effekt.
 * @param {object} recipe - Das Rezeptobjekt vom Backend.
 */
function createRecipeCard(recipe) {
    const card = document.createElement('div');
    // Die CSS-Klasse für den Neon-Hover-Effekt
    card.classList.add('recipe-card'); 

    card.innerHTML = `
        <div class="card-controls">
            <input type="checkbox" data-recipe-id="${recipe.id}" class="shopping-list-checkbox"> 
            <label>Zur Einkaufsliste</label>
            <button class="delete-btn" onclick="deleteRecipe(${recipe.id})">Löschen</button>
            </div>
        <h3>${recipe.name}</h3>
        <p><strong>Zutaten:</strong></p>
        <p>${recipe.ingredients.replace(/\n/g, '<br>')}</p>
        <p><strong>Zubereitung:</strong></p>
        <p>${recipe.instructions.replace(/\n/g, '<br>')}</p>
    `;
    
    return card;
}

// ----------------------------------------------------
// READ (Laden aller Rezepte)
// ----------------------------------------------------

/**
 * Ruft alle Rezepte vom Backend ab und zeigt sie an.
 */
async function loadRecipes() {
    try {
        const response = await fetch(`${API_BASE_URL}/recipes`);
        
        if (!response.ok) {
            throw new Error(`HTTP-Fehler! Status: ${response.status}`);
        }
        
        const recipes = await response.json();

        // Bestehende Rezepte entfernen und Container leeren
        recipeListSection.innerHTML = '<h2>Deine Rezepte</h2>'; 

        if (recipes.length === 0) {
            const emptyMsg = document.createElement('p');
            emptyMsg.textContent = 'Noch keine Rezepte vorhanden. Füge eines hinzu!';
            recipeListSection.appendChild(emptyMsg);
        } else {
            recipes.forEach(recipe => {
                const card = createRecipeCard(recipe);
                recipeListSection.appendChild(card);
            });
        }
    } catch (error) {
        console.error("Fehler beim Laden der Rezepte:", error);
        // Anzeige eines Fehlers, falls der Backend-Server nicht erreichbar ist
        recipeListSection.innerHTML = `<h2>Deine Rezepte</h2><p class="error-msg">❌ Konnte Rezepte nicht laden. Bitte Backend-Server (${API_BASE_URL}) prüfen.</p>`;
    }
}

// ----------------------------------------------------
// CREATE (Neues Rezept speichern)
// ----------------------------------------------------

addRecipeForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const recipeName = document.getElementById('recipe-name').value;
    const recipeIngredients = document.getElementById('recipe-ingredients').value;
    const recipeInstructions = document.getElementById('recipe-instructions').value;

    const newRecipe = {
        name: recipeName,
        ingredients: recipeIngredients,
        instructions: recipeInstructions
    };

    try {
        const response = await fetch(`${API_BASE_URL}/recipes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newRecipe)
        });

        if (response.status === 201) {
            loadRecipes(); 
            addRecipeForm.reset(); 
            alert('✅ Rezept erfolgreich gespeichert!');
        } else {
            throw new Error('Speichern fehlgeschlagen.');
        }
    } catch (error) {
        console.error("Fehler beim Senden des Rezepts:", error);
        alert('❌ Fehler beim Speichern des Rezepts. Überprüfe die Serververbindung.');
    }
});


// ----------------------------------------------------
// DELETE (Rezept löschen)
// ----------------------------------------------------

/**
 * Löscht ein Rezept über die API.
 * @param {number} id - Die ID des zu löschenden Rezepts.
 */
async function deleteRecipe(id) {
    if (!confirm('Sicher? Dieses Rezept wird permanent gelöscht.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
            method: 'DELETE'
        });

        if (response.status === 204) {
            alert('🗑️ Rezept erfolgreich gelöscht!');
            loadRecipes(); // Liste neu laden
        } else if (response.status === 404) {
            alert('Fehler: Rezept wurde nicht gefunden.');
        } else {
            throw new Error(`Fehler beim Löschen, Status: ${response.status}`);
        }
    } catch (error) {
        console.error("Fehler beim Löschen des Rezepts:", error);
        alert('❌ Konnte Rezept nicht löschen.');
    }
}


// ----------------------------------------------------
// Einkaufslisten-Logik
// ----------------------------------------------------

generateListBtn.addEventListener('click', async () => {
    // Sammle alle IDs von markierten Checkboxen
    const checkedBoxes = document.querySelectorAll('.shopping-list-checkbox:checked');
    const recipeIds = Array.from(checkedBoxes).map(cb => parseInt(cb.dataset.recipeId));

    if (recipeIds.length === 0) {
        return alert('🛒 Bitte wählen Sie mindestens ein Rezept für die Liste aus.');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/shoppinglist`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipeIds })
        });
        
        if (!response.ok) {
             throw new Error('Fehler beim Generieren der Liste.');
        }

        const shoppingList = await response.json();
        
        // Anzeige der Einkaufsliste
        const listText = shoppingList.map(item => `\n- ${item}`).join('');
        alert(`Ihre Einkaufsliste:\n\n${listText}`);
        
    } catch (error) {
        console.error("Fehler bei Einkaufslisten-Generierung:", error);
        alert('❌ Konnte Einkaufsliste nicht erstellen. Überprüfen Sie das Backend.');
    }
});


// ----------------------------------------------------
// Start
// ----------------------------------------------------

// Lade die Rezepte beim Start der Seite
document.addEventListener('DOMContentLoaded', loadRecipes);
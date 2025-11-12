// script.js - DELETE Funktion

/**
 * Löscht ein Rezept über die API.
 * @param {number} id - Die ID des zu löschenden Rezepts.
 */
async function deleteRecipe(id) {
    if (!confirm('Sind Sie sicher, dass Sie dieses Rezept löschen möchten?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
            method: 'DELETE'
        });

        if (response.status === 204) {
            alert('Rezept erfolgreich gelöscht!');
            // Liste neu laden, um die Anzeige zu aktualisieren
            loadRecipes(); 
        } else if (response.status === 404) {
            alert('Fehler: Rezept wurde nicht gefunden.');
        } else {
            throw new Error(`Fehler beim Löschen, Status: ${response.status}`);
        }
    } catch (error) {
        console.error("Fehler beim Löschen des Rezepts:", error);
        alert('Konnte Rezept nicht löschen.');
    }
}

// script.js - Angepasste createRecipeCard (Auszug)

function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.classList.add('recipe-card'); 

    card.innerHTML = `
        <input type="checkbox" data-recipe-id="${recipe.id}" class="shopping-list-checkbox"> 
        <label>Zur Einkaufsliste hinzufügen</label>
        <h3>${recipe.name}</h3>
        <button onclick="deleteRecipe(${recipe.id})">Löschen</button>
        <button onclick="openEditModal(${recipe.id})">Bearbeiten</button>
    `;
    
    return card;
}

// script.js - Einkaufslisten-Generierung

const generateListBtn = document.getElementById('generate-list-btn'); // Button-Element

generateListBtn.addEventListener('click', async () => {
    // Sammle alle IDs von markierten Checkboxen
    const checkedBoxes = document.querySelectorAll('.shopping-list-checkbox:checked');
    const recipeIds = Array.from(checkedBoxes).map(cb => parseInt(cb.dataset.recipeId));

    if (recipeIds.length === 0) {
        return alert('Bitte wählen Sie mindestens ein Rezept für die Liste aus.');
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
        
        // Anzeige der Einkaufsliste (z.B. in einem neuen Modal oder Alert)
        const listText = shoppingList.join('\n');
        alert('Ihre konsolidierte Einkaufsliste:\n\n' + listText);
        
    } catch (error) {
        console.error("Fehler bei Einkaufslisten-Generierung:", error);
        alert('Konnte Einkaufsliste nicht erstellen.');
    }
});
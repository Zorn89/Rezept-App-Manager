require('dotenv').config(); // Lädt Umgebungsvariablen (DB-Daten)
const express = require('express');
const cors = require('cors'); // Wichtig für die Kommunikation mit dem Frontend
const db = require('./db'); // Importiert die PostgreSQL-Datenbankverbindung

const app = express();
// Nutze entweder den Port aus den Umgebungsvariablen (AWS/Deployment) oder Port 3000 (Lokal)
const port = process.env.PORT || 3000; 

// --- Middleware ---

// 1. CORS-Aktivierung: Erlaubt Anfragen von anderen Domänen (wie Ihrem lokalen Frontend-Server)
// Für die Entwicklung ist app.use(cors()) in Ordnung. Für die Produktion sollte eine spezifische Origin festgelegt werden.
app.use(cors()); 

// 2. Body Parser: Erlaubt das Parsen von JSON-Daten, die im Request-Body gesendet werden
app.use(express.json()); 

// --- API Routen (RESTful Endpunkte) ---
const API_PREFIX = '/api';

// ----------------------------------------------------
// 1. CREATE: Neues Rezept speichern (POST /api/recipes)
// ----------------------------------------------------
app.post(`${API_PREFIX}/recipes`, async (req, res) => {
    const { name, ingredients, instructions } = req.body;
    
    // Prepared Statement schützt vor SQL Injection
    const sql = 'INSERT INTO recipes (name, ingredients, instructions) VALUES ($1, $2, $3) RETURNING *';
    const params = [name, ingredients, instructions];

    try {
        const result = await db.query(sql, params);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Fehler beim Speichern des Rezepts:", err);
        res.status(400).send('Ungültige Daten oder Datenbankfehler beim Erstellen.');
    }
});

// ----------------------------------------------------
// 2. READ: Alle Rezepte abrufen (GET /api/recipes)
// ----------------------------------------------------
app.get(`${API_PREFIX}/recipes`, async (req, res) => {
    try {
        // Holt alle Spalten und sortiert nach der ID (neueste zuerst)
        const result = await db.query('SELECT * FROM recipes ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        console.error("Fehler beim Abrufen der Rezepte:", err);
        res.status(500).send('Interner Serverfehler beim Lesen der Rezepte.');
    }
});

// ----------------------------------------------------
// 3. UPDATE: Rezept aktualisieren (PUT /api/recipes/:id)
// ----------------------------------------------------
app.put(`${API_PREFIX}/recipes/:id`, async (req, res) => {
    const id = req.params.id;
    const { name, ingredients, instructions } = req.body;
    
    const sql = 'UPDATE recipes SET name = $1, ingredients = $2, instructions = $3 WHERE id = $4 RETURNING *';
    const params = [name, ingredients, instructions, id];

    try {
        const result = await db.query(sql, params);
        
        if (result.rowCount === 0) {
            return res.status(404).send('Rezept nicht gefunden.');
        }
        
        res.json(result.rows[0]); 
    } catch (err) {
        console.error("Fehler beim Aktualisieren des Rezepts:", err);
        res.status(500).send('Interner Serverfehler beim Aktualisieren.');
    }
});

// ----------------------------------------------------
// 4. DELETE: Rezept löschen (DELETE /api/recipes/:id)
// ----------------------------------------------------
app.delete(`${API_PREFIX}/recipes/:id`, async (req, res) => {
    const id = req.params.id;
    
    try {
        const result = await db.query('DELETE FROM recipes WHERE id = $1', [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).send('Rezept nicht gefunden.');
        }
        
        // Status 204 No Content
        res.status(204).send(); 
    } catch (err) {
        console.error("Fehler beim Löschen des Rezepts:", err);
        res.status(500).send('Interner Serverfehler beim Löschen.');
    }
});

// ----------------------------------------------------
// 5. ZUSATZ: Einkaufsliste generieren (POST /api/shoppinglist)
// ----------------------------------------------------
app.post(`${API_PREFIX}/shoppinglist`, async (req, res) => {
    const { recipeIds } = req.body;

    if (!recipeIds || !Array.isArray(recipeIds) || recipeIds.length === 0) {
        return res.status(400).send('Ungültige oder fehlende Rezept-IDs.');
    }

    try {
        // Holt die Zutaten aller ausgewählten Rezepte
        const ingredientsResult = await db.query(
            'SELECT ingredients FROM recipes WHERE id = ANY($1)',
            [recipeIds]
        );

        let consolidatedList = {};

        ingredientsResult.rows.forEach(row => {
            // Teile den Text in Zeilen und entferne leere Zeilen
            const lines = row.ingredients.split('\n').filter(line => line.trim() !== '');

            lines.forEach(line => {
                const key = line.trim();
                // Hier wird vereinfacht nur der Eintrag gezählt. 
                // Für eine professionelle Lösung müsste hier die Menge summiert werden (z.B. "500g Mehl" + "200g Mehl").
                consolidatedList[key] = (consolidatedList[key] || 0) + 1; 
            });
        });

        const shoppingList = Object.keys(consolidatedList);
        
        res.json(shoppingList);
    } catch (err) {
        console.error("Fehler bei Einkaufslisten-Generierung:", err);
        res.status(500).send('Interner Serverfehler bei der Listenverarbeitung.');
    }
});


// --- Server starten ---

app.listen(port, () => {
    console.log(`✅ Backend läuft auf http://localhost:${port}`);
    console.log(`API-Endpunkte unter http://localhost:${port}${API_PREFIX}`);
});
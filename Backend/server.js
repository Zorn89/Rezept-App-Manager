// server.js - READ (Lesen)
app.get('/api/recipes', async (req, res) => {
    try {
        // SQL-Abfrage: Holt alle Spalten (*) aus der Tabelle 'recipes'
        const result = await db.query('SELECT * FROM recipes ORDER BY id DESC');
        
        // Sende die Daten der abgerufenen Zeilen als JSON an das Frontend
        res.json(result.rows); 
    } catch (err) {
        console.error("Fehler beim Abrufen:", err);
        res.status(500).send('Interner Serverfehler.');
    }
});

// server.js - CREATE (Erstellen)
app.post('/api/recipes', async (req, res) => {
    // req.body enthält die JSON-Daten vom Frontend
    const { name, ingredients, instructions } = req.body; 

    // Verwendung von $1, $2, $3 (Prepared Statement) statt String-Konkatenation
    const sql = 'INSERT INTO recipes (name, ingredients, instructions) VALUES ($1, $2, $3) RETURNING *';
    const params = [name, ingredients, instructions];

    try {
        const result = await db.query(sql, params);
        
        // Sende das neu erstellte Objekt zurück
        res.status(201).json(result.rows[0]); 
    } catch (err) {
        console.error("Fehler beim Speichern:", err);
        res.status(400).send('Ungültige Daten oder Datenbankfehler.');
    }
});

// server.js 
const port = process.env.PORT || 8080; // Wichtig für AWS EB

app.listen(port, () => {
    console.log(`Backend läuft auf Port ${port}`);
});


// server.js - DELETE (Löschen)

app.delete('/api/recipes/:id', async (req, res) => {
    // Die ID wird aus der URL-Parameter (req.params) gelesen
    const id = req.params.id;
    
    try {
        const result = await db.query('DELETE FROM recipes WHERE id = $1 RETURNING *', [id]);
        
        if (result.rowCount === 0) {
            // Wenn keine Zeile gelöscht wurde, existierte das Rezept nicht
            return res.status(404).send('Rezept nicht gefunden.');
        }
        
        // Status 204 No Content ist Standard für erfolgreiches DELETE
        res.status(204).send(); 
    } catch (err) {
        console.error("Fehler beim Löschen:", err);
        res.status(500).send('Interner Serverfehler.');
    }
});

// server.js - UPDATE (Aktualisieren)

app.put('/api/recipes/:id', async (req, res) => {
    const id = req.params.id;
    const { name, ingredients, instructions } = req.body;
    
    // SQL-Abfrage: Aktualisiert die Felder, wo die ID übereinstimmt
    const sql = 'UPDATE recipes SET name = $1, ingredients = $2, instructions = $3 WHERE id = $4 RETURNING *';
    const params = [name, ingredients, instructions, id];

    try {
        const result = await db.query(sql, params);
        
        if (result.rowCount === 0) {
            return res.status(404).send('Rezept nicht gefunden.');
        }
        
        // Sende das aktualisierte Objekt zurück
        res.json(result.rows[0]); 
    } catch (err) {
        console.error("Fehler beim Aktualisieren:", err);
        res.status(500).send('Interner Serverfehler.');
    }
});

// server.js - Einkaufslisten-Logik

app.post('/api/shoppinglist', async (req, res) => {
    // Erwarte ein Array von IDs, z.B. { recipeIds: [1, 5, 8] }
    const { recipeIds } = req.body;

    if (!recipeIds || !Array.isArray(recipeIds) || recipeIds.length === 0) {
        return res.status(400).send('Ungültige oder fehlende Rezept-IDs.');
    }

    try {
        // SQL-Abfrage: Holt die Zutaten aller ausgewählten Rezepte
        const ingredientsResult = await db.query(
            'SELECT ingredients FROM recipes WHERE id = ANY($1)',
            [recipeIds] // $1 wird als Array von IDs behandelt
        );

        let consolidatedList = {};

        ingredientsResult.rows.forEach(row => {
            // Gehe jede Zutat (jede Zeile im Textfeld) durch
            const lines = row.ingredients.split('\n').filter(line => line.trim() !== '');

            lines.forEach(line => {
                // Hier müsste eine komplexe Parsing-Logik (z.B. "500g Mehl") hin.
                // Für unser Projekt nutzen wir eine vereinfachte Logik (nur das Hinzufügen des Textes)

                const key = line.trim();
                // Wenn die Zutat schon in der Liste ist, wird die Zeile hinzugefügt
                consolidatedList[key] = (consolidatedList[key] || 0) + 1; 
            });
        });

        // Gib die Liste als Array von Strings zurück
        const shoppingList = Object.keys(consolidatedList);
        
        res.json(shoppingList);
    } catch (err) {
        console.error("Fehler bei Einkaufslisten-Generierung:", err);
        res.status(500).send('Interner Serverfehler.');
    }
});
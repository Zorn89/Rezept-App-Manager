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

// server.js (Aktualisierung)
const port = process.env.PORT || 8080; // Wichtig für AWS EB

app.listen(port, () => {
    console.log(`Backend läuft auf Port ${port}`);
});
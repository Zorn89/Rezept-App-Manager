// db.js
const { Pool } = require('pg');

// Der Pool nutzt Umgebungsvariablen für sichere Konfiguration.
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432, // Standard-PostgreSQL-Port
  ssl: {rejectUnauthorized: false}
});

console.log("Datenbank-Pool initialisiert.");

// Exportiere eine Hilfsfunktion, um SQL-Abfragen auszuführen
module.exports = {
  /**
   * Führt eine SQL-Abfrage aus.
   * @param {string} text - Der SQL-Befehl.
   * @param {Array<any>} params - Die Parameter für die Abfrage.
   */
  query: (text, params) => pool.query(text, params),
};
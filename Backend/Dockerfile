# Dockerfile

# 1. BASIS-IMAGE: Startet mit einem offiziellen Node.js-Image (schlanke Version)
FROM node:20-alpine

# 2. ARBEITSVERZEICHNIS: Erstellt ein Verzeichnis im Container
WORKDIR /usr/src/app

# 3. ABHÄNGIGKEITEN: Kopiert die Metadaten-Dateien (package.json und package-lock.json)
# Dies ist schneller, da Node Modules nur installiert werden, wenn sich die package.json ändert.
COPY package*.json ./

# 4. INSTALLATION: Installiert alle Node.js-Abhängigkeiten
RUN npm install --omit=dev

# 5. ANWENDUNGSCODE: Kopiert den gesamten Code in das Arbeitsverzeichnis
COPY . .

# 6. PORT: Definiert, welchen Port der Container intern verwendet
EXPOSE 3000

# 7. START-BEFEHL: Definiert den Befehl, der ausgeführt wird, wenn der Container startet
# Verwendet den Start-Befehl aus Ihrer package.json
CMD [ "npm", "start" ]
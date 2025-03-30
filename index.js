const express = require('express');
const axios = require('axios');
const app = express();

const CLIENT_ID = '1356009347603501288';
const CLIENT_SECRET = 'Rp7J4fPu-CalrAEnEdSn1y0vA7n5hNGn';
const REDIRECT_URI = 'https://airwavesprogrammer.github.io/discord_project/submission.html';
const GUILD_ID = '1353778960080699403'; // Die ID deines Discord-Servers

// Umleitung nach erfolgreicher Authentifizierung
app.get('/auth/discord', async (req, res) => {
    const code = req.query.code;

    try {
        // Schritt 1: Token gegen den Code eintauschen
        const response = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
            redirect_uri: REDIRECT_URI,
            scope: 'identify guilds',
        }));

        const accessToken = response.data.access_token;

        // Schritt 2: Benutzerinformationen abrufen
        const userResponse = await axios.get('https://discord.com/api/v10/users/@me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const user = userResponse.data;

        // Schritt 3: Überprüfen, ob der Benutzer Mitglied des Servers ist
        const guildResponse = await axios.get(`https://discord.com/api/v10/users/@me/guilds`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const guilds = guildResponse.data;
        const isMember = guilds.some(guild => guild.id === GUILD_ID);

        // Schritt 4: Weiterleiten oder Blockieren
        if (isMember) {
            res.redirect('/submission.html');
        } else {
            res.send('Zugriff verweigert: Du bist kein Mitglied des Servers.');
        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Es gab ein Problem bei der Authentifizierung.');
    }
});

app.listen(3000, () => {
    console.log('Server läuft auf Port 3000');
});

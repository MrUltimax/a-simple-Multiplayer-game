# Secure Real Time Multiplayer Game

This is the boilerplate for the Secure Real Time Multiplayer Game project. Instructions for building your project can be found at https://www.freecodecamp.org/learn/information-security/information-security-projects/secure-real-time-multiplayer-game

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:3000`.

## Deploy to Render

1. Push this repository to GitHub.
2. Sign in to [Render](https://render.com/) and select **New > Web Service**.
3. Connect the GitHub repository.
4. Keep these settings:
   - **Runtime:** Node
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Plan:** Free
5. Add an environment variable if needed:
   - `NODE_ENV=production`
6. Click **Deploy Web Service**.

Render will provide a public URL such as `https://your-game.onrender.com`. Share that URL with friends.

This repository also includes `render.yaml`, so you can alternatively select **New > Blueprint** in Render and use this repository's Blueprint configuration.

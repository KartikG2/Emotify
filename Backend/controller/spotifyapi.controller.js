import axios from "axios";

export const spotifyapiController = async (req, res) => {
  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'client_credentials'
      }),
      {
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    res.json({ token: response.data.access_token });
  } catch (error) {
    res.status(500).json({ error: 'Token fetch failed' });
  }
}
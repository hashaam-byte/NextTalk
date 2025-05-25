export const initGooglePhotos = () => {
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_PHOTOS_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(window.location.origin)}/auth/callback` +
    `&response_type=code` +
    `&scope=https://www.googleapis.com/auth/photoslibrary.readonly` +
    `&access_type=offline`;

  return authUrl;
};

export const handleGooglePhotosCallback = async (code: string) => {
  try {
    const response = await fetch('/api/auth/google-photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    return await response.json();
  } catch (error) {
    console.error('Error handling Google Photos callback:', error);
    throw error;
  }
};

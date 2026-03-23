/**
 * LINE Authentication using expo-auth-session
 * Compatible with Firebase Auth OIDC provider
 */

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { OAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from './firebase';

// Complete any pending auth session
WebBrowser.maybeCompleteAuthSession();

const LINE_CHANNEL_ID = process.env.EXPO_PUBLIC_LINE_CHANNEL_ID;
const LINE_CHANNEL_SECRET = process.env.EXPO_PUBLIC_LINE_CHANNEL_SECRET;

const discovery = {
  authorizationEndpoint: 'https://access.line.me/oauth2/v2.1/authorize',
  tokenEndpoint: 'https://api.line.me/oauth2/v2.1/token',
};

/**
 * Sign in with LINE using expo-auth-session
 * @returns Promise<{ error: Error | null }>
 */
export async function signInWithLINE(): Promise<{ error: Error | null }> {
  try {
    if (!LINE_CHANNEL_ID || !LINE_CHANNEL_SECRET) {
      throw new Error('LINE Channel ID or Secret not configured');
    }

    // Create redirect URI
    const redirectUri = AuthSession.makeRedirectUri({
      native: 'com.coffee.project://auth',
    });

    // Generate nonce for security
    const nonce = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      Math.random().toString()
    );

    // Create auth request
    const request = new AuthSession.AuthRequest({
      clientId: LINE_CHANNEL_ID,
      redirectUri,
      scopes: ['profile', 'openid', 'email'],
      responseType: 'code',
      extraParams: { nonce },
    });

    // Prompt user to login with LINE
    const result = await request.promptAsync(discovery);

    if (result.type !== 'success') {
      throw new Error('LINE login cancelled or failed');
    }

    const { code } = result.params;

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: LINE_CHANNEL_ID,
        client_secret: LINE_CHANNEL_SECRET,
      }).toString(),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.id_token) {
      throw new Error('Failed to get ID token from LINE');
    }

    // Sign in with Firebase using OIDC
    const provider = new OAuthProvider('oidc.line');
    const credential = provider.credential({
      idToken: tokenData.id_token,
      rawNonce: nonce,
    });

    await signInWithCredential(auth, credential);

    return { error: null };
  } catch (err) {
    console.error('LINE auth error:', err);
    return { error: err as Error };
  }
}

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import crypto from 'crypto';

// In production, this should be an environment variable. 
// It MUST be exactly 32 bytes for aes-256-gcm.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_secret_key_needs_32_bytes!';

function encrypt(text: string) {
  // Ensure the key is exactly 32 bytes
  const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  
  return {
    iv: iv.toString('hex'),
    content: encrypted,
    tag: authTag.toString('hex')
  };
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    
    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Callback OAuth error:', error);
      return NextResponse.redirect(`${requestUrl.origin}/dashboard/settings?error=oauth_failed`);
    }

    // Since we requested Google Drive scopes, the provider_token and provider_refresh_token
    // should be available in the session data if configured in Supabase dashboard.
    const providerToken = data.session?.provider_token;
    const providerRefreshToken = data.session?.provider_refresh_token;

    if (providerToken && data.user) {
      // Encrypt tokens before storing
      const encryptedAccessToken = encrypt(providerToken);
      const encryptedRefreshToken = providerRefreshToken ? encrypt(providerRefreshToken) : null;

      // Store in users table
      const updateData: any = {
        google_drive_access_token: JSON.stringify(encryptedAccessToken),
      };
      
      if (encryptedRefreshToken) {
        updateData.google_drive_refresh_token = JSON.stringify(encryptedRefreshToken);
      }

      await supabase
        .from('users')
        .update(updateData)
        .eq('id', data.user.id);
    }
  }

  // Redirect back to settings or vault
  return NextResponse.redirect(`${requestUrl.origin}/dashboard/documents?drive=connected`);
}

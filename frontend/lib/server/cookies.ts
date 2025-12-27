import { cookies } from "next/headers";

/**
 * Legge i cookies dal server
 */
export async function getCookiesString(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;

    const cookieParts: string[] = [];
    if (accessToken) cookieParts.push(`accessToken=${accessToken}`);
    if (refreshToken) cookieParts.push(`refreshToken=${refreshToken}`);

    return cookieParts.join('; ');
  } catch (error) {
    console.error('Failed to read cookies:', error);
    return '';
  }
}


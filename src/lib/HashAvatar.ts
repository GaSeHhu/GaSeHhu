export function getHashAvatarUrl(userId: string): string {
  return `https://api.multiavatar.com/${userId}.svg`;
}

// import { fetchUserProfile } from '@/app/utils/serverAuth';
import ClientProfileCompletionPage from './ClientProfileCompletionPage';

export default async function ProfilePage() {
  // let userProfile = null;

  // try {
  //   userProfile = await fetchUserProfile();
  //   console.log('User profile fetched:', userProfile);
  // } catch (error) {
  //   console.error('Failed to fetch user profile:', error);
  // }

  return <ClientProfileCompletionPage />;
}

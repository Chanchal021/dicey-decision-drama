
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useProfileManager = () => {
  const { toast } = useToast();

  const ensureUserProfile = async (userId: string): Promise<boolean> => {
    try {
      console.log('Ensuring user profile exists for:', userId);
      
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (profileCheckError) {
        console.error('Error checking user profile:', profileCheckError);
        toast({
          title: "Profile check failed",
          description: profileCheckError.message,
          variant: "destructive"
        });
        return false;
      }

      if (!existingProfile) {
        console.log('User profile does not exist, creating one...');
        
        const { data: userData } = await supabase.auth.getUser();
        const displayName = userData.user?.user_metadata?.display_name || 
                           userData.user?.email?.split('@')[0] || 
                           'Anonymous User';

        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            display_name: displayName
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          toast({
            title: "Failed to create user profile",
            description: profileError.message,
            variant: "destructive"
          });
          return false;
        }
        
        console.log('User profile created successfully');
      }

      return true;
    } catch (error) {
      console.error('Unexpected error managing user profile:', error);
      toast({
        title: "Profile management failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    }
  };

  return { ensureUserProfile };
};

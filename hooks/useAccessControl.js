'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useAppSelector } from '../store/hooks';

/**
 * Access control rules for different pages
 */
const ACCESS_RULES = {
  // Basic access - Admin and Patient only
  BASIC_ACCESS: ['Admin', 'Patient'],
  
  // Requires consultation - Admin and Patient with consultationOccurred
  CONSULTATION_REQUIRED: ['Admin', 'Patient'],
  
  // Admin portal - Admin and Doctor only
  ADMIN_PORTAL: ['Admin', 'Doctor'],
};

/**
 * Check if user has any of the required groups
 */
function hasRequiredGroup(userGroups, requiredGroups) {
  if (!userGroups || !Array.isArray(userGroups)) return false;
  
  // Check for exact matches first
  const exactMatch = requiredGroups.some(group => userGroups.includes(group));
  if (exactMatch) return true;
  
  // Check for case-insensitive matches
  const caseInsensitiveMatch = requiredGroups.some(requiredGroup => 
    userGroups.some(userGroup => 
      userGroup.toLowerCase() === requiredGroup.toLowerCase()
    )
  );
  
  // Check for partial matches (e.g., "doctor group" contains "doctor")
  const partialMatch = requiredGroups.some(requiredGroup => 
    userGroups.some(userGroup => 
      userGroup.toLowerCase().includes(requiredGroup.toLowerCase())
    )
  );
  
  
  return exactMatch || caseInsensitiveMatch || partialMatch;
}

/**
 * Hook to protect pages with basic access (Admin and Patient)
 * Used for: Dashboard, Profile, Consent Forms
 */
export function useBasicAccess() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      const userGroups = user.groups || user['https://lukariagroup.com/roles'] || [];
      
      if (!hasRequiredGroup(userGroups, ACCESS_RULES.BASIC_ACCESS)) {
        router.push('/unauthorized');
      }
    }
  }, [user, isLoading, router]);

  return { user, isLoading };
}

/**
 * Hook to protect pages requiring consultation
 * Used for: Side Effects, Weight Logging, Medication Tracker, Meal Tracker
 * Requires: Admin OR (Patient with consultationOccurred)
 */
export function useConsultationAccess() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const profileState = useAppSelector((state) => state.profile);

  useEffect(() => {
    if (!isLoading && user) {
      const userGroups = user.groups || user['https://lukariagroup.com/roles'] || [];
      
      // Check multiple sources for consultationOccurred (prefer MongoDB profile)
      const consultationOccurred = profileState.profile?.user_metadata?.consultationOccurred ||
                                   user.user_metadata?.consultationOccurred || 
                                   user['https://lukariagroup.com/user_metadata']?.consultationOccurred ||
                                   false;
      
      const isAdmin = userGroups.includes('Admin');
      const isPatientWithConsultation = userGroups.includes('Patient') && consultationOccurred;
      
      // Admin has full access, Patient needs consultation
      if (profileState?.profile && !isAdmin && !isPatientWithConsultation && !consultationOccurred) {
        if (userGroups.includes('Patient') && !consultationOccurred) {
          router.push('/consultation-required');
        } else {
          router.push('/unauthorized');
        }
      }
    }
  }, [user, isLoading, profileState.profile, router]);

  return { user, isLoading };
}

/**
 * Hook to protect admin portal pages
 * Used for: Administration
 * Requires: Admin or Doctor
 */
export function useAdminAccess() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      const userGroups = user.groups || user['https://lukariagroup.com/roles'] || [];
      
      if (!hasRequiredGroup(userGroups, ACCESS_RULES.ADMIN_PORTAL)) {
        router.push('/unauthorized');
      }
    }
  }, [user, isLoading, router]);

  return { user, isLoading };
}

/**
 * Utility function to check if user should see navigation items
 */
export function canAccessPage(user, pageType, profileData = null) {
  if (!user) return false;
  
  const userGroups = user.groups || user['https://lukariagroup.com/roles'] || [];
  
  // Check multiple sources (prefer MongoDB profile if available)
  const consultationOccurred = profileData?.user_metadata?.consultationOccurred ||
                               user.user_metadata?.consultationOccurred || 
                               user['https://lukariagroup.com/user_metadata']?.consultationOccurred ||
                               false;


  switch (pageType) {
    case 'basic':
      return hasRequiredGroup(userGroups, ACCESS_RULES.BASIC_ACCESS);
    
    case 'consultation':
      const isAdmin = userGroups.includes('Admin');
      const isPatientWithConsultation = userGroups.includes('Patient') && consultationOccurred;
      return isAdmin || isPatientWithConsultation;
    
    case 'admin':
      return hasRequiredGroup(userGroups, ACCESS_RULES.ADMIN_PORTAL);
    
    default:
      return false;
  }
}


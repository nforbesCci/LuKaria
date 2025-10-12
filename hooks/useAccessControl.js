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
  return requiredGroups.some(group => userGroups.includes(group));
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
      
      console.log('🔐 Basic Access Check:', {
        groups: userGroups,
        hasAccess: hasRequiredGroup(userGroups, ACCESS_RULES.BASIC_ACCESS)
      });

      if (!hasRequiredGroup(userGroups, ACCESS_RULES.BASIC_ACCESS)) {
        console.log('❌ Access Denied: User does not have required group');
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
      
      console.log('🔐 Consultation Access Check:', {
        groups: userGroups,
        consultationOccurred,
        consultationFromMongoDB: profileState.profile?.user_metadata?.consultationOccurred,
        consultationFromMetadata: user.user_metadata?.consultationOccurred,
        consultationFromClaim: user['https://lukariagroup.com/user_metadata']?.consultationOccurred,
        isAdmin,
        isPatientWithConsultation,
        hasAccess: isAdmin || isPatientWithConsultation
      });

      // Admin has full access, Patient needs consultation

      if (profileState?.profile && !isAdmin && !isPatientWithConsultation && !consultationOccurred) {
        if (userGroups.includes('Patient') && !consultationOccurred) {
          console.log('❌ Access Denied: Patient has not had consultation yet');
          router.push('/consultation-required');
        } else {
          console.log('❌ Access Denied: User does not have required group');
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
      
      console.log('🔐 Admin Access Check:', {
        groups: userGroups,
        hasAccess: hasRequiredGroup(userGroups, ACCESS_RULES.ADMIN_PORTAL)
      });

      if (!hasRequiredGroup(userGroups, ACCESS_RULES.ADMIN_PORTAL)) {
        console.log('❌ Access Denied: User is not Admin or Doctor');
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

  console.log('🔐 canAccessPage check:', {
    pageType,
    userGroups,
    consultationOccurred,
    consultationFromProfile: profileData?.user_metadata?.consultationOccurred,
    consultationFromMetadata: user.user_metadata?.consultationOccurred,
    consultationFromClaim: user['https://lukariagroup.com/user_metadata']?.consultationOccurred,
  });

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


'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useAppSelector } from '../store/hooks';

const ROLES_CLAIM = 'https://lukariagroup.com/roles';

/**
 * Access control rules for different pages
 */
const ACCESS_RULES = {
  // Patient self-service (profile, consents, trackers)
  PATIENT_ONLY: ['Patient'],

  // Admin portal - Admin and Doctor only
  ADMIN_PORTAL: ['Admin', 'Doctor'],

  // Shared hub (dashboard) — any known app role
  ANY_APP_ROLE: ['Admin', 'Doctor', 'Patient'],
};

function getUserGroups(user) {
  if (!user) return [];
  const raw = user.groups || user[ROLES_CLAIM] || [];
  if (Array.isArray(raw)) return raw.map((r) => String(r));
  if (raw) return [String(raw)];
  return [];
}

/**
 * Check if user has any of the required groups
 */
function hasRequiredGroup(userGroups, requiredGroups) {
  if (!userGroups || !Array.isArray(userGroups)) return false;

  const exactMatch = requiredGroups.some((group) => userGroups.includes(group));
  if (exactMatch) return true;

  const caseInsensitiveMatch = requiredGroups.some((requiredGroup) =>
    userGroups.some((userGroup) => userGroup.toLowerCase() === requiredGroup.toLowerCase()),
  );
  if (caseInsensitiveMatch) return true;

  const partialMatch = requiredGroups.some((requiredGroup) =>
    userGroups.some((userGroup) =>
      userGroup.toLowerCase().includes(requiredGroup.toLowerCase()),
    ),
  );

  return partialMatch;
}

function isStaff(userGroups) {
  return hasRequiredGroup(userGroups, ACCESS_RULES.ADMIN_PORTAL);
}

/** Patient self-service only — staff never qualify, even if they also have Patient. */
function isPatientOnly(userGroups) {
  return !isStaff(userGroups) && hasRequiredGroup(userGroups, ACCESS_RULES.PATIENT_ONLY);
}

/**
 * Hook for pages any signed-in app role can open (e.g. dashboard).
 */
export function useBasicAccess() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      const userGroups = getUserGroups(user);

      if (!hasRequiredGroup(userGroups, ACCESS_RULES.ANY_APP_ROLE)) {
        router.push('/unauthorized');
      }
    }
  }, [user, isLoading, router]);

  return { user, isLoading };
}

/**
 * Patient-only pages (profile, consent forms).
 */
export function usePatientAccess() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      const userGroups = getUserGroups(user);
      if (isStaff(userGroups)) {
        router.push('/admin');
        return;
      }
      if (!isPatientOnly(userGroups)) {
        router.push('/unauthorized');
      }
    }
  }, [user, isLoading, router]);

  return { user, isLoading };
}

/**
 * Patient pages that also require consultationOccurred.
 */
export function useConsultationAccess() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const profileState = useAppSelector((state) => state.profile);

  useEffect(() => {
    if (!isLoading && user) {
      const userGroups = getUserGroups(user);

      if (isStaff(userGroups)) {
        router.push('/admin');
        return;
      }

      const consultationOccurred =
        profileState.profile?.user_metadata?.consultationOccurred ||
        user.user_metadata?.consultationOccurred ||
        user['https://lukariagroup.com/user_metadata']?.consultationOccurred ||
        false;

      if (!isPatientOnly(userGroups)) {
        router.push('/unauthorized');
        return;
      }

      if (profileState?.profile && !consultationOccurred) {
        router.push('/consultation-required');
      }
    }
  }, [user, isLoading, profileState.profile, router]);

  return { user, isLoading };
}

/**
 * Admin / Doctor portal pages.
 */
export function useAdminAccess() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      const userGroups = getUserGroups(user);

      if (!hasRequiredGroup(userGroups, ACCESS_RULES.ADMIN_PORTAL)) {
        router.push('/unauthorized');
      }
    }
  }, [user, isLoading, router]);

  return { user, isLoading };
}

/**
 * Utility function to check if user should see navigation items / dashboard cards.
 */
export function canAccessPage(user, pageType, profileData = null) {
  if (!user) return false;

  const userGroups = getUserGroups(user);

  const consultationOccurred =
    profileData?.user_metadata?.consultationOccurred ||
    user.user_metadata?.consultationOccurred ||
    user['https://lukariagroup.com/user_metadata']?.consultationOccurred ||
    false;

  switch (pageType) {
    case 'basic':
      // Patient self-service nav only
      return isPatientOnly(userGroups);

    case 'consultation':
      return isPatientOnly(userGroups) && Boolean(consultationOccurred);

    case 'admin':
      return isStaff(userGroups);

    default:
      return false;
  }
}

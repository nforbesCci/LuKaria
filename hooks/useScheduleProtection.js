'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '../store/hooks';

/**
 * Custom hook to protect routes based on schedule completion status
 * Prevents navigation away from schedule page when schedule is not completed
 */
export function useScheduleProtection() {
  const router = useRouter();
  const scheduleCompleted = useAppSelector((state) => state.appointment.isScheduleCompleted);
  const isScheduled = useAppSelector((state) => state.user.isScheduled);
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  useEffect(() => {
    // Only enforce schedule protection if:
    // 1. Schedule is NOT completed
    // 2. User is NOT already scheduled (isScheduled is false or undefined)
    // 3. User is not on schedule page or home page
    // This prevents redirect loop when user is already scheduled
    if (!scheduleCompleted && !isScheduled && currentPath !== '/schedule' && currentPath !== '/') {
      // Redirect back to schedule page
      router.push('/schedule');
    }
  }, [scheduleCompleted, isScheduled, currentPath, router]);

  return { scheduleCompleted };
}

/**
 * Custom hook to prevent re-access to schedule page when already completed
 */
export function useScheduleRedirect() {
  const router = useRouter();
  const scheduleCompleted = useAppSelector((state) => state.appointment.isScheduleCompleted);
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  useEffect(() => {
    // If schedule is completed and user is trying to access schedule page
    if (scheduleCompleted && currentPath === '/schedule') {
      // Redirect to dashboard
      router.push('/dashboard');
    }
  }, [scheduleCompleted, currentPath, router]);

  return { scheduleCompleted };
}


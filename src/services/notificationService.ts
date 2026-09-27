import { AppNotification, NotificationType, UserProfile, DailyMetrics } from '../types';

export interface CheckReminderParams {
  userProfile: UserProfile;
  dailyMetrics: DailyMetrics;
  completedWorkouts: string[];
}

class NotificationService {
  private readonly SENT_LOG_KEY_PREFIX = 'fitlife_sent_reminders_';

  // Get current browser permission
  public getPermissionStatus(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  // Request browser push notification permission
  public async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch {
      return 'denied';
    }
  }

  // Dispatch a native browser notification if permitted
  public dispatchBrowserNotification(notification: AppNotification, onClick?: () => void): boolean {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      try {
        const nativeNotification = new Notification(notification.title, {
          body: notification.body,
          icon: '/favicon.ico',
          tag: notification.id,
          badge: '/favicon.ico',
          silent: false,
        });

        nativeNotification.onclick = () => {
          window.focus();
          nativeNotification.close();
          if (onClick) onClick();
        };

        return true;
      } catch {
        return false;
      }
    }

    return false;
  }

  // Check if reminder was already dispatched today
  private hasReminderFiredToday(type: string): boolean {
    if (typeof window === 'undefined') return false;
    const todayStr = new Date().toISOString().split('T')[0];
    const key = `${this.SENT_LOG_KEY_PREFIX}${todayStr}`;
    const logged = localStorage.getItem(key);
    if (!logged) return false;
    try {
      const sentArray: string[] = JSON.parse(logged);
      return sentArray.includes(type);
    } catch {
      return false;
    }
  }

  // Record that a reminder was dispatched today
  public markReminderFiredToday(type: string): void {
    if (typeof window === 'undefined') return;
    const todayStr = new Date().toISOString().split('T')[0];
    const key = `${this.SENT_LOG_KEY_PREFIX}${todayStr}`;
    try {
      const existing = localStorage.getItem(key);
      const sentArray: string[] = existing ? JSON.parse(existing) : [];
      if (!sentArray.includes(type)) {
        sentArray.push(type);
        localStorage.setItem(key, JSON.stringify(sentArray));
      }
    } catch {
      // Ignore
    }
  }

  // Reset dispatched log (useful for testing or daily reset)
  public resetTodayReminderLog(): void {
    if (typeof window === 'undefined') return;
    const todayStr = new Date().toISOString().split('T')[0];
    const key = `${this.SENT_LOG_KEY_PREFIX}${todayStr}`;
    localStorage.removeItem(key);
  }

  // Evaluates current time and goal statuses, returning a gentle reminder if overdue
  public evaluateReminders({
    userProfile,
    dailyMetrics,
    completedWorkouts,
  }: CheckReminderParams): AppNotification | null {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeVal = currentHours * 60 + currentMinutes;

    // Helper to parse "HH:MM" string to minutes from midnight
    const parseTimeToMinutes = (timeStr: string): number => {
      const [h, m] = timeStr.split(':').map((x) => parseInt(x, 10) || 0);
      return h * 60 + m;
    };

    // 1. Check Water Intake Reminder
    if (userProfile.reminders.water) {
      const waterReminderMinutes = parseTimeToMinutes(userProfile.reminderTimes.water || '14:00');
      const isWaterOverdue = currentTimeVal >= waterReminderMinutes;
      const isGoalUnmet = dailyMetrics.waterConsumedMl < userProfile.dailyWaterGoal;
      const alreadyFired = this.hasReminderFiredToday('water');

      if (isWaterOverdue && isGoalUnmet && !alreadyFired) {
        const remainingMl = Math.max(0, userProfile.dailyWaterGoal - dailyMetrics.waterConsumedMl);
        const percent = Math.round((dailyMetrics.waterConsumedMl / userProfile.dailyWaterGoal) * 100);

        this.markReminderFiredToday('water');

        return {
          id: `notif-water-${Date.now()}`,
          type: 'water',
          title: '💧 Gentle Hydration Nudge',
          body: `You've drank ${dailyMetrics.waterConsumedMl.toLocaleString()} ml of your ${userProfile.dailyWaterGoal.toLocaleString()} ml goal (${percent}%). Drink a refreshing glass to stay energized and hit your target!`,
          timestamp: new Date().toISOString(),
          read: false,
          actions: [
            {
              id: 'act-w1',
              label: '+250 ml Glass',
              actionType: 'add_water_250',
              primary: true,
            },
            {
              id: 'act-w2',
              label: '+500 ml Bottle',
              actionType: 'add_water_500',
            },
            {
              id: 'act-w3',
              label: 'Open Tracker',
              actionType: 'navigate_water',
            },
          ],
          metadata: {
            currentWaterMl: dailyMetrics.waterConsumedMl,
            targetWaterMl: userProfile.dailyWaterGoal,
            scheduledTime: userProfile.reminderTimes.water,
          },
        };
      }
    }

    // 2. Check Workout Reminder
    if (userProfile.reminders.workout) {
      const workoutReminderMinutes = parseTimeToMinutes(userProfile.reminderTimes.workout || '18:00');
      const isWorkoutOverdue = currentTimeVal >= workoutReminderMinutes;
      const hasCompletedWorkout = completedWorkouts.length > 0;
      const alreadyFired = this.hasReminderFiredToday('workout');

      if (isWorkoutOverdue && !hasCompletedWorkout && !alreadyFired) {
        this.markReminderFiredToday('workout');

        return {
          id: `notif-workout-${Date.now()}`,
          type: 'workout',
          title: '⚡ Scheduled Workout Session',
          body: `It's ${userProfile.reminderTimes.workout}! You haven't completed your daily workout yet. 'Full Body Foundation' (25 min, ~180 kcal) is ready with interactive animated demos.`,
          timestamp: new Date().toISOString(),
          read: false,
          actions: [
            {
              id: 'act-wk1',
              label: 'Start Live Demo Now',
              actionType: 'start_workout',
              primary: true,
            },
            {
              id: 'act-wk2',
              label: 'View Workouts',
              actionType: 'navigate_workout',
            },
          ],
          metadata: {
            workoutTitle: 'Full Body Foundation',
            scheduledTime: userProfile.reminderTimes.workout,
          },
        };
      }
    }

    return null;
  }

  // Create immediate test push notification
  public generateTestReminder(
    type: 'water' | 'workout',
    userProfile: UserProfile,
    dailyMetrics: DailyMetrics
  ): AppNotification {
    if (type === 'water') {
      const remaining = Math.max(0, userProfile.dailyWaterGoal - dailyMetrics.waterConsumedMl);
      const percent = Math.round((dailyMetrics.waterConsumedMl / userProfile.dailyWaterGoal) * 100);

      return {
        id: `notif-test-water-${Date.now()}`,
        type: 'water',
        title: '💧 Gentle Hydration Nudge',
        body: `You've logged ${dailyMetrics.waterConsumedMl.toLocaleString()} ml of your ${userProfile.dailyWaterGoal.toLocaleString()} ml goal (${percent}%). Drink a refreshing glass to power your body!`,
        timestamp: new Date().toISOString(),
        read: false,
        actions: [
          {
            id: 'act-w1',
            label: '+250 ml Glass',
            actionType: 'add_water_250',
            primary: true,
          },
          {
            id: 'act-w2',
            label: '+500 ml Bottle',
            actionType: 'add_water_500',
          },
          {
            id: 'act-w3',
            label: 'Open Tracker',
            actionType: 'navigate_water',
          },
        ],
        metadata: {
          currentWaterMl: dailyMetrics.waterConsumedMl,
          targetWaterMl: userProfile.dailyWaterGoal,
          scheduledTime: userProfile.reminderTimes.water,
        },
      };
    }

    return {
      id: `notif-test-workout-${Date.now()}`,
      type: 'workout',
      title: '⚡ Scheduled Workout Session',
      body: `Gentle Reminder: Your scheduled workout 'Full Body Foundation' (25 min, ~180 kcal) is ready. Keep your streak alive!`,
      timestamp: new Date().toISOString(),
      read: false,
      actions: [
        {
          id: 'act-wk1',
          label: 'Start Live Demo Now',
          actionType: 'start_workout',
          primary: true,
        },
        {
          id: 'act-wk2',
          label: 'View Workouts',
          actionType: 'navigate_workout',
        },
      ],
      metadata: {
        workoutTitle: 'Full Body Foundation',
        scheduledTime: userProfile.reminderTimes.workout,
      },
    };
  }
}

export const notificationService = new NotificationService();

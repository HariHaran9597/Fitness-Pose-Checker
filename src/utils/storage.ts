export interface ExerciseSession {
  timestamp: number;
  exercise: string;
  duration: number;
  angles: {
    left: number[];
    right: number[];
  };
  feedback: string[];
}

export interface UserProgress {
  sessions: ExerciseSession[];
}

const STORAGE_KEY = 'fitness-pose-corrector-progress';

export const saveSession = (session: ExerciseSession): void => {
  try {
    const existingData = localStorage.getItem(STORAGE_KEY);
    const progress: UserProgress = existingData 
      ? JSON.parse(existingData)
      : { sessions: [] };
    
    progress.sessions.push(session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving session:', error);
  }
};

export const getSessions = (): ExerciseSession[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const progress: UserProgress = JSON.parse(data);
    return progress.sessions;
  } catch (error) {
    console.error('Error getting sessions:', error);
    return [];
  }
};

export const clearProgress = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing progress:', error);
  }
};

export const getExerciseStats = (exercise: string) => {
  const sessions = getSessions().filter(s => s.exercise === exercise);
  if (sessions.length === 0) return null;

  const averageAngles = {
    left: 0,
    right: 0
  };

  let totalDuration = 0;

  sessions.forEach(session => {
    // Calculate average angles for the session
    const leftAvg = session.angles.left.reduce((a, b) => a + b, 0) / session.angles.left.length;
    const rightAvg = session.angles.right.reduce((a, b) => a + b, 0) / session.angles.right.length;
    
    averageAngles.left += leftAvg;
    averageAngles.right += rightAvg;
    totalDuration += session.duration;
  });

  return {
    totalSessions: sessions.length,
    averageAngles: {
      left: Math.round(averageAngles.left / sessions.length),
      right: Math.round(averageAngles.right / sessions.length)
    },
    totalDuration,
    averageDuration: Math.round(totalDuration / sessions.length)
  };
};
import React from 'react';
import { WorkoutSet } from '../utils/workoutMetrics';
import { ExerciseType } from '../utils/exerciseRules';

interface WorkoutMetricsProps {
  repCount: number;
  formScore: number | null;
  lastRepScore: number | null;
  averageScore: number;
  exercise: ExerciseType;
  reps: Array<{
    timestamp: number;
    angles: {
      left: number[];
      right: number[];
    };
    score: number;
  }>;
  showShareButton?: boolean;
  onShare?: (data: WorkoutSet) => void;
}

const WorkoutMetrics: React.FC<WorkoutMetricsProps> = ({
  repCount,
  formScore,
  lastRepScore,
  averageScore,
  exercise,
  reps,
  showShareButton = false,
  onShare
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 70) return '#FFC107';
    return '#FF5252';
  };

  const getScoreText = (score: number) => {
    if (score >= 90) return 'Excellent!';
    if (score >= 70) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      background: 'rgba(0, 0, 0, 0.8)',
      padding: '15px',
      borderRadius: '10px',
      color: 'white',
      minWidth: '200px'
    }}>
      <div style={{
        marginBottom: '15px',
        textAlign: 'center'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '28px',
          color: '#4CAF50'
        }}>
          {repCount}
        </h3>
        <p style={{
          margin: '5px 0 0 0',
          fontSize: '14px',
          color: '#999'
        }}>
          Repetitions
        </p>
      </div>

      {lastRepScore !== null && (
        <div style={{
          marginBottom: '15px',
          textAlign: 'center'
        }}>
          <h4 style={{
            margin: 0,
            fontSize: '24px',
            color: getScoreColor(lastRepScore)
          }}>
            {lastRepScore}%
          </h4>
          <p style={{
            margin: '5px 0 0 0',
            fontSize: '14px',
            color: '#999'
          }}>
            Last Rep: {getScoreText(lastRepScore)}
          </p>
        </div>
      )}

      <div style={{
        textAlign: 'center'
      }}>
        <h4 style={{
          margin: 0,
          fontSize: '20px',
          color: getScoreColor(averageScore)
        }}>
          {averageScore}%
        </h4>
        <p style={{
          margin: '5px 0 0 0',
          fontSize: '14px',
          color: '#999'
        }}>
          Average Score
        </p>
      </div>

      {formScore !== null && formScore !== averageScore && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '5px',
          textAlign: 'center'
        }}>
          <span style={{
            color: getScoreColor(formScore)
          }}>
            Current Form: {formScore}%
          </span>
        </div>
      )}

      {showShareButton && onShare && repCount > 0 && (
        <button
          onClick={() => onShare({
            exercise,
            reps,
            averageScore,
            startTime: reps[0]?.timestamp || Date.now(),
            endTime: reps[reps.length - 1]?.timestamp || Date.now()
          })}
          style={{
            marginTop: '15px',
            width: '100%',
            padding: '8px',
            background: '#4CAF50',
            border: 'none',
            borderRadius: '5px',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px'
          }}
        >
          📤 Share Results
        </button>
      )}
    </div>
  );
};

export default WorkoutMetrics;
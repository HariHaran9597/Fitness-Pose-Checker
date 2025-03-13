import { useEffect, useState } from 'react';
import { getSessions, getExerciseStats, ExerciseSession } from '../utils/storage';
import { ExerciseType } from '../utils/exerciseRules';

interface ProgressProps {
  onClose: () => void;
}

const Progress = ({ onClose }: ProgressProps) => {
  const [sessions, setSessions] = useState<ExerciseSession[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType>(ExerciseType.SQUAT);
  const [currentPage, setCurrentPage] = useState(1);
  const sessionsPerPage = 5;

  useEffect(() => {
    setSessions(getSessions());
  }, []);

  const stats = getExerciseStats(selectedExercise);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredSessions = sessions
    .filter(session => session.exercise === selectedExercise)
    .sort((a, b) => b.timestamp - a.timestamp);

  const totalPages = Math.ceil(filteredSessions.length / sessionsPerPage);
  
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * sessionsPerPage,
    currentPage * sessionsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const StatCard = ({ title, value, color = '#4CAF50' }: { title: string; value: string; color?: string }) => (
    <div style={{
      background: 'rgba(255, 255, 255, 0.1)',
      padding: '15px',
      borderRadius: '10px',
      textAlign: 'center',
      minWidth: '120px'
    }}>
      <h3 style={{ 
        margin: '0 0 10px 0',
        fontSize: '14px',
        color: '#ffffff80'
      }}>{title}</h3>
      <p style={{ 
        margin: 0,
        fontSize: '24px',
        fontWeight: 'bold',
        color: color
      }}>{value}</p>
    </div>
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        backgroundColor: '#1a1a1a',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          ×
        </button>

        <h2 style={{ 
          textAlign: 'center', 
          margin: '0 0 20px 0',
          fontSize: '28px',
          color: '#4CAF50'
        }}>
          Progress Tracker
        </h2>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          <select
            value={selectedExercise}
            onChange={(e) => {
              setSelectedExercise(e.target.value as ExerciseType);
              setCurrentPage(1);
            }}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              borderRadius: '5px',
              backgroundColor: '#2c2c2c',
              color: 'white',
              border: '2px solid #4CAF50',
              cursor: 'pointer',
              outline: 'none',
              width: '200px'
            }}
          >
            {Object.values(ExerciseType).map(exercise => (
              <option key={exercise} value={exercise}>
                {exercise.charAt(0).toUpperCase() + exercise.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {stats ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '15px',
            marginBottom: '30px'
          }}>
            <StatCard 
              title="Total Sessions" 
              value={stats.totalSessions.toString()}
            />
            <StatCard 
              title="Avg Duration" 
              value={formatDuration(stats.averageDuration)}
            />
            <StatCard 
              title="Left Avg" 
              value={`${stats.averageAngles.left}°`}
            />
            <StatCard 
              title="Right Avg" 
              value={`${stats.averageAngles.right}°`}
            />
          </div>
        ) : (
          <p style={{ 
            textAlign: 'center', 
            color: '#999',
            margin: '20px 0'
          }}>
            No data available for {selectedExercise}
          </p>
        )}

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <h3 style={{ 
            margin: '0',
            fontSize: '20px',
            color: '#4CAF50'
          }}>
            Recent Sessions
          </h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            marginBottom: '20px'
          }}>
            {paginatedSessions.length > 0 ? (
              paginatedSessions.map((session, index) => (
                <div 
                  key={index}
                  style={{
                    padding: '15px',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(76, 175, 80, 0.2)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <span style={{ color: '#4CAF50' }}>{formatDate(session.timestamp)}</span>
                    <span>{formatDuration(session.duration)}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    color: '#999'
                  }}>
                    <span>Left: {Math.round(
                      session.angles.left.reduce((a, b) => a + b, 0) / session.angles.left.length
                    )}°</span>
                    <span>Right: {Math.round(
                      session.angles.right.reduce((a, b) => a + b, 0) / session.angles.right.length
                    )}°</span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#999' }}>
                No sessions recorded yet
              </p>
            )}
          </div>

          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '10px',
              marginTop: '20px'
            }}>
              {currentPage > 1 && (
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#2c2c2c',
                    border: 'none',
                    borderRadius: '5px',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Previous
                </button>
              )}
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: currentPage === page ? '#4CAF50' : '#2c2c2c',
                      border: 'none',
                      borderRadius: '5px',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    {page}
                  </button>
                ))}
              </span>
              {currentPage < totalPages && (
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#2c2c2c',
                    border: 'none',
                    borderRadius: '5px',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Next
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Progress;
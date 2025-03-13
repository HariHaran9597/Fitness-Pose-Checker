import React from 'react';

interface ArrowProps {
  direction: 'up' | 'down' | 'left' | 'right';
  color: string;
  size?: number;
}

const Arrow: React.FC<ArrowProps> = ({ direction, color, size = 40 }) => {
  const getRotation = () => {
    switch (direction) {
      case 'up': return '0deg';
      case 'right': return '90deg';
      case 'down': return '180deg';
      case 'left': return '270deg';
      default: return '0deg';
    }
  };

  return (
    <div style={{
      width: size,
      height: size,
      transform: `rotate(${getRotation()})`,
      transition: 'transform 0.3s ease'
    }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 4L4 12L12 20M4 12H20"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

interface VisualGuideProps {
  exercise: string;
  leftAngle: number;
  rightAngle: number;
  isGoodForm: boolean;
}

const VisualGuide: React.FC<VisualGuideProps> = ({
  exercise,
  leftAngle,
  rightAngle,
  isGoodForm
}) => {
  const getSquatGuidance = () => {
    if (isGoodForm) return null;

    const avgAngle = (leftAngle + rightAngle) / 2;
    if (avgAngle > 120) {
      return (
        <div style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: '150px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Arrow direction="down" color="#FF5252" />
          <span style={{ color: 'white', textShadow: '1px 1px 2px black' }}>
            Go Lower
          </span>
        </div>
      );
    }
    return null;
  };

  const getPushupGuidance = () => {
    if (isGoodForm) return null;

    const avgAngle = (leftAngle + rightAngle) / 2;
    if (avgAngle > 160) {
      return (
        <div style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          top: '150px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Arrow direction="down" color="#FF5252" />
          <span style={{ color: 'white', textShadow: '1px 1px 2px black' }}>
            Lower Your Body
          </span>
        </div>
      );
    } else if (avgAngle < 90) {
      return (
        <div style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          top: '150px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Arrow direction="up" color="#FF5252" />
          <span style={{ color: 'white', textShadow: '1px 1px 2px black' }}>
            Push Up
          </span>
        </div>
      );
    }
    return null;
  };

  const getDeadliftGuidance = () => {
    if (isGoodForm) return null;

    const avgAngle = (leftAngle + rightAngle) / 2;
    if (avgAngle < 150) {
      return (
        <div style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          top: '150px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Arrow direction="up" color="#FF5252" />
          <span style={{ color: 'white', textShadow: '1px 1px 2px black' }}>
            Straighten Your Back
          </span>
        </div>
      );
    }
    return null;
  };

  const getGuidance = () => {
    switch (exercise) {
      case 'squat':
        return getSquatGuidance();
      case 'pushup':
        return getPushupGuidance();
      case 'deadlift':
        return getDeadliftGuidance();
      default:
        return null;
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none'
    }}>
      {getGuidance()}
    </div>
  );
};

export default VisualGuide;
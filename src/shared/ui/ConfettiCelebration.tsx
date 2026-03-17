import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiCelebrationProps {
  trigger?: boolean;
  type?: 'success' | 'achievement' | 'levelup' | 'completion';
}

export function ConfettiCelebration({ trigger = true, type = 'success' }: ConfettiCelebrationProps) {
  useEffect(() => {
    if (!trigger) return;

    const runConfetti = () => {
      switch (type) {
        case 'success':
          // Simple celebration
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
          });
          break;

        case 'achievement':
          // Achievement unlock - burst from sides
          const count = 200;
          const defaults = {
            origin: { y: 0.7 },
            colors: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a'],
          };

          function fire(particleRatio: number, opts: any) {
            confetti({
              ...defaults,
              ...opts,
              particleCount: Math.floor(count * particleRatio),
            });
          }

          fire(0.25, {
            spread: 26,
            startVelocity: 55,
          });
          fire(0.2, {
            spread: 60,
          });
          fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8,
          });
          fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2,
          });
          fire(0.1, {
            spread: 120,
            startVelocity: 45,
          });
          break;

        case 'levelup':
          // Level up - fireworks
          const duration = 3000;
          const animationEnd = Date.now() + duration;
          const fireworkColors = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];

          const fireworks = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
              return clearInterval(fireworks);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({
              particleCount,
              startVelocity: 30,
              spread: 360,
              origin: {
                x: Math.random(),
                y: Math.random() - 0.2,
              },
              colors: fireworkColors,
            });
          }, 250);
          break;

        case 'completion':
          // Completion - stars burst
          const end = Date.now() + 2000;
          const starColors = ['#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'];

          (function frame() {
            confetti({
              particleCount: 2,
              angle: 60,
              spread: 55,
              origin: { x: 0 },
              colors: starColors,
              shapes: ['star'],
              scalar: 1.2,
            });
            confetti({
              particleCount: 2,
              angle: 120,
              spread: 55,
              origin: { x: 1 },
              colors: starColors,
              shapes: ['star'],
              scalar: 1.2,
            });

            if (Date.now() < end) {
              requestAnimationFrame(frame);
            }
          })();
          break;
      }
    };

    runConfetti();
  }, [trigger, type]);

  return null;
}

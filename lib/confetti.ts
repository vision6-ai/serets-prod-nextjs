import confetti from 'canvas-confetti';

export function launchConfetti() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    zIndex: 9999,
    ticks: 60,
    scalar: 0.8,
  });
} 
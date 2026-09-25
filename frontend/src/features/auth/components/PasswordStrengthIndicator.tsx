import React from 'react';

export interface PasswordStrengthProps {
  password?: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthProps> = ({ password = '' }) => {
  const calculateScore = (pwd: string): number => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return Math.min(score, 4);
  };

  const score = calculateScore(password);

  const labels = ['Sin ingresar', 'Muy débil', 'Moderada', 'Fuerte', 'Excelente'];
  const colors = [
    'bg-zinc-800',
    'bg-rose-500',
    'bg-amber-500',
    'bg-blue-500',
    'bg-emerald-500',
  ];

  if (!password) return null;

  return (
    <div className="space-y-1.5 pt-1">
      <div className="flex items-center justify-between text-[11px] text-zinc-400">
        <span>Seguridad de contraseña</span>
        <span className="font-medium text-zinc-300">{labels[score]}</span>
      </div>
      <div className="grid grid-cols-4 gap-1.5 h-1">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`rounded-full transition-colors duration-300 ${
              score >= step ? colors[score] : 'bg-zinc-800'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

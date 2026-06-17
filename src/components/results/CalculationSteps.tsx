import type { CalculationStep } from '../../types';

interface Props {
  steps: CalculationStep[];
}

export function CalculationSteps({ steps }: Props) {
  return (
    <div className="space-y-2">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        return (
          <div
            key={i}
            className={`flex items-center gap-3 p-2 rounded ${
              isLast ? 'bg-blue-50 border border-blue-200' : ''
            }`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              isLast ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-700">{step.label}</div>
              <div className="text-xs font-mono text-gray-400 truncate">{step.formula}</div>
            </div>
            <div className={`font-mono font-bold text-right shrink-0 ${
              isLast ? 'text-blue-600 text-base' : 'text-gray-700 text-sm'
            }`}>
              {step.value.toLocaleString('zh-CN')}
            </div>
          </div>
        );
      })}
    </div>
  );
}

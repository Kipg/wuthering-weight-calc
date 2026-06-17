import type { InputHTMLAttributes } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  suffix?: string;
}

export function FormInput({ label, suffix, className = '', ...props }: FormInputProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <div className="flex items-center gap-1">
        <input
          {...props}
          className={`w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all duration-200
            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
            ${className}`}
        />
        {suffix && <span className="text-gray-500 text-sm w-5">{suffix}</span>}
      </div>
    </label>
  );
}

interface Option {
  value: string;
  label: string;
}

interface FormSelectProps {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}

export function FormSelect({ label, value, options, onChange }: FormSelectProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-all duration-200"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

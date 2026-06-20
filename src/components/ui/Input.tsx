import { cn } from '@/lib/utils';

interface InputProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  textarea?: boolean;
  options?: readonly string[] | string[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  className?: string;
  id?: string;
}

export default function Input({
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
  error,
  textarea = false,
  options,
  value,
  onChange,
  className,
  id,
}: InputProps) {
  const inputId = id || `input-${name}`;
  const baseClasses = cn(
    'w-full rounded-lg border bg-white px-4 py-3 text-sm text-[#0A1929] placeholder:text-gray-400 transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2]',
    error ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 hover:border-gray-400',
    className
  );

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-medium text-[#2C3E50]">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {options ? (
        <select
          id={inputId}
          name={name}
          required={required}
          value={value}
          onChange={onChange}
          className={cn(baseClasses, 'appearance-none cursor-pointer')}
        >
          <option value="">Select an option...</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : textarea ? (
        <textarea
          id={inputId}
          name={name}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={onChange}
          rows={4}
          className={cn(baseClasses, 'resize-y min-h-[100px]')}
        />
      ) : (
        <input
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={onChange}
          className={baseClasses}
        />
      )}

      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

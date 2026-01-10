import { ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Option {
  value: string;
  label: string;
}

type ChangeHandler = (e: any) => void;

interface FormFieldProps {
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea';
  name: string;
  value: string | number;
  onChange: ChangeHandler;
  error?: string;
  required?: boolean;
  placeholder?: string;
  options?: Option[];
  disabled?: boolean;
  className?: string;
  step?: string;
  min?: string | number;
  max?: string | number;
  rows?: number;
}

export function FormField({
  label,
  type = 'text',
  name,
  value,
  onChange,
  error,
  required,
  placeholder,
  options,
  disabled,
  className = '',
  step,
  min,
  max,
  rows = 4
}: FormFieldProps): ReactNode {
  if (type === 'select') {
    return (
      <div className={className}>
        <Label htmlFor={name} className="mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Select
          value={String(value)}
          onValueChange={(val) => onChange({ target: { name, value: val } })}
        >
          <SelectTrigger id={name} disabled={disabled}>
            <SelectValue placeholder={placeholder || 'Seleziona...'} />
          </SelectTrigger>
          <SelectContent>
            {options?.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  if (type === 'textarea') {
    return (
      <div className={className}>
        <Label htmlFor={name} className="mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className={className}>
      <Label htmlFor={name} className="mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={error ? 'border-red-500' : ''}
        step={step}
        min={min}
        max={max}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
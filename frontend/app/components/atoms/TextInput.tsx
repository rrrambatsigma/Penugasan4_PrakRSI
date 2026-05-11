"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LucideIcon } from "lucide-react";

interface TextInputProps {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "password" | "tel" | "number";
  icon?: LucideIcon;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  autoComplete?: string;
  className?: string;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      id,
      name,
      label,
      placeholder = "",
      type = "text",
      icon: Icon,
      value,
      onChange,
      required = false,
      error,
      disabled = false,
      autoComplete,
      className = "",
    },
    ref,
  ) => {
    return (
      <div className="space-y-2">
        <Label htmlFor={id} className="text-xs sm:text-sm font-medium">
          {label}
        </Label>

        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
          )}

          <Input
            ref={ref}
            id={id}
            name={name}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            autoComplete={autoComplete}
            className={`${
              Icon ? "pl-10" : ""
            } bg-gray-50 border-gray-200 text-sm transition-colors ${
              error ? "border-red-500 focus:border-red-500 " : "focus:border-blue-500"
            } disabled:bg-gray-100 disabled:cursor-not-allowed ${className}`}
          />
        </div>

        {error && <p className="text-xs sm:text-sm text-red-500 mt-1">{error}</p>}
      </div>
    );
  },
);

TextInput.displayName = "TextInput";
"use client"

import * as React from "react"
import PhoneInput from "react-phone-number-input"
import "react-phone-number-input/style.css"
import { cn } from "@/lib/utils"

interface PhoneInputComponentProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function PhoneInputComponent({ value, onChange, placeholder = "Enter phone number", className }: PhoneInputComponentProps) {
  // Ensure value is in E.164 format (starts with +) or empty
  const normalizedValue = value && !value.startsWith('+') ? `+${value}` : value
  
  return (
    <PhoneInput
      international
      defaultCountry="US"
      value={normalizedValue || undefined}
      onChange={(val) => onChange(val || "")}
      placeholder={placeholder}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    />
  )
}

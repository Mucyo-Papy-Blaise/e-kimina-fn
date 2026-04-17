"use client";

import { forwardRef, useState, useEffect, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Input } from "./input";
import { cn } from "@/utils/cn";

export const COUNTRY_CODES = [
  { country: "Rwanda", code: "RW", prefix: "+250", flag: "🇷🇼", phoneLength: 9 },
  { country: "Uganda", code: "UG", prefix: "+256", flag: "🇺🇬", phoneLength: 9 },
  { country: "Kenya", code: "KE", prefix: "+254", flag: "🇰🇪", phoneLength: 9 },
  {
    country: "Tanzania",
    code: "TZ",
    prefix: "+255",
    flag: "🇹🇿",
    phoneLength: 9,
  },
  {
    country: "Burundi",
    code: "BI",
    prefix: "+257",
    flag: "🇧🇮",
    phoneLength: 8,
  },
  {
    country: "South Africa",
    code: "ZA",
    prefix: "+27",
    flag: "🇿🇦",
    phoneLength: 9,
  },
  {
    country: "United States",
    code: "US",
    prefix: "+1",
    flag: "🇺🇸",
    phoneLength: 10,
  },
  {
    country: "United Kingdom",
    code: "GB",
    prefix: "+44",
    flag: "🇬🇧",
    phoneLength: 10,
  },
  {
    country: "Nigeria",
    code: "NG",
    prefix: "+234",
    flag: "🇳🇬",
    phoneLength: 10,
  },
  { country: "Egypt", code: "EG", prefix: "+20", flag: "🇪🇬", phoneLength: 10 },
  {
    country: "Ethiopia",
    code: "ET",
    prefix: "+251",
    flag: "🇪🇹",
    phoneLength: 9,
  },
];

export const getCountryInfoByPrefix = (prefix: string) =>
  COUNTRY_CODES.find((c) => c.prefix === prefix);

/**
 * Strip everything the user may have typed that duplicates the selected
 * country code, returning only the clean subscriber digits.
 *
 * Order matters — always run steps 1 → 2 → 3 → 4:
 *
 *  Uganda +256 (phoneLength 9) examples:
 *   "0771234567"    → "771234567"   (trunk 0 stripped)
 *   "256771234567"  → "771234567"   (country digits stripped)
 *   "+256771234567" → "771234567"   (full E.164 pasted)
 *   "771234567"     → "771234567"   (already clean)
 *   "6771234567"    → "677123456"   (hard-capped at 9 — avoids +2566... bleed)
 */
export const normalizeLocalNumber = (value: string, prefix: string): string => {
  const country = getCountryInfoByPrefix(prefix);
  const maxLen = country?.phoneLength ?? 15;

  let v = value;

  // 1. Strip any leading "+" the user may have typed.
  if (v.startsWith("+")) v = v.slice(1);

  // 2. Strip country-code digits if the user re-typed them.
  //    e.g. prefix "+256" → prefixDigits "256"
  const prefixDigits = prefix.replace(/\D/g, "");
  if (v.startsWith(prefixDigits)) v = v.slice(prefixDigits.length);

  // 3. Strip local trunk zero (e.g. 0771... → 771...).
  if (v.startsWith("0")) v = v.slice(1);

  // 4. Hard-cap to the expected subscriber length.
  //    This is the final safety net: even if none of the above rules matched,
  //    we never emit more digits than the country expects.
  if (v.length > maxLen) v = v.slice(0, maxLen);

  return v;
};

/**
 * Returns true only when fullNumber is a valid E.164 string for a known country.
 * Use this for form validation anywhere in the app.
 */
export const isPhoneNumberValid = (fullNumber: string): boolean => {
  if (!fullNumber) return false;
  const country = COUNTRY_CODES.find((c) => fullNumber.startsWith(c.prefix));
  if (!country) return false;
  const subscriber = fullNumber.slice(country.prefix.length);
  return /^\d+$/.test(subscriber) && subscriber.length === country.phoneLength;
};

interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onPhoneChange?: (fullPhoneNumber: string) => void;
  defaultCountryCode?: string;
  showError?: boolean;
  errorMessage?: string;
  value?: string;
  allowedCountryCodes?: string[];
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      onPhoneChange,
      defaultCountryCode = "+250",
      className,
      showError,
      errorMessage,
      disabled,
      value: externalValue,
      allowedCountryCodes,
      ...props
    },
    ref,
  ) => {
    const availableCountries =
      allowedCountryCodes && allowedCountryCodes.length > 0
        ? COUNTRY_CODES.filter((country) =>
            allowedCountryCodes.includes(country.prefix),
          )
        : COUNTRY_CODES;
    const fallbackPrefix =
      availableCountries.find(
        (country) => country.prefix === defaultCountryCode,
      )?.prefix ??
      availableCountries[0]?.prefix ??
      defaultCountryCode;
    const [selectedPrefix, setSelectedPrefix] = useState(fallbackPrefix);
    // localNumber is exactly what is rendered inside the <input>.
    const [localNumber, setLocalNumber] = useState("");

    const getCountryInfo = (prefix: string) => getCountryInfoByPrefix(prefix);

    /** Pull the subscriber part out of a stored E.164 string for display. */
    const extractLocalNumber = useCallback(
      (fullNumber: string, prefix: string): string => {
        if (!fullNumber) return "";
        if (fullNumber.startsWith(prefix))
          return fullNumber.slice(prefix.length);
        const known = COUNTRY_CODES.find((c) =>
          fullNumber.startsWith(c.prefix),
        );
        if (known) return fullNumber.slice(known.prefix.length);
        return fullNumber;
      },
      [],
    );

    // Sync when the parent controls the value externally.
    useEffect(() => {
      // Validate that selectedPrefix is still in availableCountries
      const isValidPrefix = availableCountries.some(
        (country) => country.prefix === selectedPrefix,
      );

      if (!externalValue) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedPrefix(fallbackPrefix);
        setLocalNumber("");
        return;
      }

      const match = COUNTRY_CODES.find((c) =>
        externalValue.startsWith(c.prefix),
      );
      const allowedMatch = match
        ? availableCountries.find((country) => country.prefix === match.prefix)
        : undefined;

      if (allowedMatch) {
        setSelectedPrefix(allowedMatch.prefix);
        setLocalNumber(extractLocalNumber(externalValue, allowedMatch.prefix));
      } else if (match) {
        setSelectedPrefix(fallbackPrefix);
        setLocalNumber(extractLocalNumber(externalValue, fallbackPrefix));
      } else if (!isValidPrefix) {
        setSelectedPrefix(fallbackPrefix);
        setLocalNumber(externalValue);
      } else {
        setLocalNumber(externalValue);
      }
    }, [externalValue, availableCountries, fallbackPrefix, extractLocalNumber]);

    /** Build and emit the clean E.164 payload. */
    const emit = (displayValue: string, prefix: string) => {
      const normalized = normalizeLocalNumber(displayValue, prefix);
      onPhoneChange?.(normalized ? `${prefix}${normalized}` : "");
    };

    const handlePrefixChange = (newPrefix: string) => {
      setSelectedPrefix(newPrefix);
      emit(localNumber, newPrefix);
    };

    const handleLocalNumberChange = (
      e: React.ChangeEvent<HTMLInputElement>,
    ) => {
      // Allow digits only, plus one optional leading '+' to support pasting full E.164.
      let clean = e.target.value.replace(/[^\d+]/g, "");

      // Cap display length: '+' (1) + country digits + trunk-0 (1) + subscriber
      const country = getCountryInfo(selectedPrefix);
      const subscriberLen = country?.phoneLength ?? 15;
      const prefixDigitsLen = selectedPrefix.replace(/\D/g, "").length;
      const maxDisplayLen = 1 + prefixDigitsLen + 1 + subscriberLen;

      if (clean.length > maxDisplayLen) clean = clean.slice(0, maxDisplayLen);

      setLocalNumber(clean);
      emit(clean, selectedPrefix);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && localNumber.length === 0) e.preventDefault();
    };

    const isValid = (): boolean => {
      const country = getCountryInfo(selectedPrefix);
      if (!country || !localNumber) return false;
      return (
        normalizeLocalNumber(localNumber, selectedPrefix).length ===
        country.phoneLength
      );
    };

    const country = getCountryInfo(selectedPrefix);

    return (
      <div className="space-y-1">
        <div className="flex gap-2">
          <Select
            value={selectedPrefix}
            onValueChange={handlePrefixChange}
            disabled={disabled || availableCountries.length === 1}
          >
            <SelectTrigger className="w-28 shrink-0">
              <SelectValue placeholder="Code" />
            </SelectTrigger>
            <SelectContent>
              {availableCountries.map((item) => (
                <SelectItem key={item.code} value={item.prefix}>
                  <span className="flex items-center gap-2">
                    <span>{item.flag}</span>
                    <span>{item.prefix}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            ref={ref}
            type="tel"
            placeholder={`e.g. 0${"X".repeat(country?.phoneLength ?? 9)}`}
            value={localNumber}
            onChange={handleLocalNumberChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className={cn(
              "flex-1",
              showError &&
                !isValid() &&
                "border-destructive focus-visible:ring-destructive",
              className,
            )}
            {...props}
          />
        </div>

        {showError && !isValid() && localNumber && (
          <p className="text-xs text-destructive">
            {errorMessage ||
              `Phone number must be ${country?.phoneLength} digits`}
          </p>
        )}

        {showError && !localNumber && (
          <p className="text-xs text-destructive">Phone number is required</p>
        )}
      </div>
    );
  },
);

PhoneInput.displayName = "PhoneInput";

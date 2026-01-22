"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Country {
  code: string
  name: string
  nameEn: string
  nameFr: string
  isActive: boolean
  region: string
  available?: boolean
  spots_remaining?: number
  max_users?: number
}

interface CountrySelectProps {
  countries: Country[]
  selectedCountry: string
  onChange: (country: string) => void
  disabled?: boolean
}

// Fonction pour obtenir l'émoji du drapeau à partir du code pays
function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

export function CountrySelect({
  countries,
  selectedCountry,
  onChange,
  disabled = false,
}: CountrySelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const selectedCountryData = countries.find((c) => c.code === selectedCountry)

  const selectCountry = (countryCode: string) => {
    onChange(countryCode)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full justify-between h-10 text-sm font-normal"
      >
        {selectedCountryData ? (
          <span className="flex items-center gap-2">
            <span className="text-xl leading-none">{getFlagEmoji(selectedCountryData.code)}</span>
            <span>{selectedCountryData.name}</span>
          </span>
        ) : (
          <span className="text-muted-foreground">Sélectionnez un pays</span>
        )}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 w-full mt-1 max-h-[300px] overflow-y-auto rounded-lg border border-input bg-background shadow-lg">
            <div className="p-2 space-y-1">
              {countries.map((country) => {
                const isSelected = selectedCountry === country.code

                return (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => selectCountry(country.code)}
                    disabled={disabled}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors
                      hover:bg-accent cursor-pointer
                      ${isSelected ? "bg-accent" : ""}
                    `}
                  >
                    <span className="text-xl leading-none">{getFlagEmoji(country.code)}</span>
                    <span className="flex-1 text-left font-medium">
                      {country.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

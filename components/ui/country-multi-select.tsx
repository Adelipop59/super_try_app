"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

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

interface CountryMultiSelectProps {
  countries: Country[]
  selectedCountries: string[]
  onChange: (countries: string[]) => void
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

export function CountryMultiSelect({
  countries,
  selectedCountries,
  onChange,
  disabled = false,
}: CountryMultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const toggleCountry = (countryCode: string) => {
    if (selectedCountries.includes(countryCode)) {
      onChange(selectedCountries.filter((c) => c !== countryCode))
    } else {
      onChange([...selectedCountries, countryCode])
    }
  }

  const selectedCountryNames = countries
    .filter((c) => selectedCountries.includes(c.code))
    .map((c) => c.name)

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full justify-between h-10 text-sm font-normal"
      >
        <span className={selectedCountries.length === 0 ? "text-muted-foreground" : ""}>
          {selectedCountries.length === 0
            ? "Sélectionnez des pays"
            : selectedCountries.length === 1
            ? selectedCountryNames[0]
            : `${selectedCountries.length} pays sélectionnés`}
        </span>
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
                const isAvailable = country.isActive
                const isSelected = selectedCountries.includes(country.code)

                return (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => toggleCountry(country.code)}
                    disabled={disabled}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors
                      hover:bg-accent cursor-pointer
                      ${!isAvailable ? "opacity-75" : ""}
                      ${isSelected ? "bg-accent" : ""}
                    `}
                  >
                    <div
                      className={`
                        flex items-center justify-center h-4 w-4 border rounded
                        ${
                          isSelected
                            ? "bg-primary border-primary"
                            : "border-input"
                        }
                      `}
                    >
                      {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    <span className="text-xl leading-none">{getFlagEmoji(country.code)}</span>
                    <span className="flex-1 text-left font-medium">
                      {country.name}
                    </span>
                    {isAvailable ? (
                      <span className="flex items-center gap-1.5 text-xs">
                        <span className="flex h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-green-600 font-medium">Disponible</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs">
                        <span className="flex h-2 w-2 rounded-full bg-orange-500" />
                        <span className="text-orange-600 font-medium">Bientôt disponible</span>
                      </span>
                    )}
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

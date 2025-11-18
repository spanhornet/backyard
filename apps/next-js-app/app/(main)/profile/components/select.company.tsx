"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Building2, Plus } from "lucide-react";

import { cn } from "@/lib/clsx-handler";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { apiHandler } from "@/lib/api-handler";

interface Company {
  name: string;
  domain: string;
  logo?: string;
  description?: string;
}

interface CompanySelectProps {
  value?: { name: string; domain: string; logo?: string } | null;
  onChange?: (value: { name: string; domain: string; logo?: string } | null) => void;
  placeholder?: string;
}

export function CompanySelect({
  value,
  onChange,
  placeholder = "Select a company...",
}: CompanySelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Debounce search
  React.useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setCompanies([]);
      setError(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiHandler.get<{
          success: boolean;
          companies: Company[];
        }>(`/api/companies/search?query=${encodeURIComponent(searchQuery)}`);

        if (response.error) {
          throw new Error(response.error);
        }

        if (response.data?.success && response.data?.companies) {
          setCompanies(response.data.companies);
        } else {
          setCompanies([]);
        }
      } catch (err) {
        console.error("Error searching companies:", err);
        setError("Failed to search companies. Please try again.");
        setCompanies([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSelect = (company: Company) => {
    if (onChange) {
      onChange({
        name: company.name,
        domain: company.domain,
        logo: company.logo,
      });
    }
    setOpen(false);
  };

  const handleClear = () => {
    if (onChange) {
      onChange(null);
    }
    setSearchQuery("");
    setCompanies([]);
  };

  const handleCustomCompany = () => {
    if (onChange && searchQuery.trim()) {
      onChange({
        name: searchQuery.trim(),
        domain: "", // No domain for custom entries
      });
    }
    setOpen(false);
    setSearchQuery("");
    setCompanies([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex-shrink-0 relative h-5 w-5">
                {value.logo && value.domain ? (
                  <>
                    <img
                      src={value.logo}
                      alt={`${value.name} logo`}
                      className="h-5 w-5 rounded object-contain"
                      onError={(e) => {
                        // Hide the image and show fallback icon
                        e.currentTarget.style.display = "none";
                        const fallback = e.currentTarget.nextElementSibling;
                        if (fallback) {
                          (fallback as HTMLElement).style.display = "flex";
                        }
                      }}
                    />
                    <div className="hidden h-5 w-5 rounded bg-muted items-center justify-center">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </>
                ) : (
                  <div className="h-5 w-5 rounded bg-muted flex items-center justify-center">
                    <Building2 className="h-3 w-3 text-muted-foreground" />
                  </div>
                )}
              </div>
              <span className="truncate">{value.name}</span>
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search companies..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {isLoading && (
              <div className="py-6 text-center text-sm">
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span>Searching...</span>
                </div>
              </div>
            )}

            {!isLoading && error && (
              <div className="py-6 text-center text-sm text-destructive">
                {error}
              </div>
            )}

            {!isLoading && !error && searchQuery.length > 0 && searchQuery.length < 2 && (
              <CommandEmpty>Type at least 2 characters to search.</CommandEmpty>
            )}

            {!isLoading && !error && searchQuery.length >= 2 && companies.length === 0 && (
              <CommandGroup>
                <CommandItem
                  onSelect={handleCustomCompany}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                        <Plus className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-medium truncate">
                        Use "{searchQuery}"
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        Set as company
                      </span>
                    </div>
                  </div>
                </CommandItem>
              </CommandGroup>
            )}

            {!isLoading && !error && companies.length > 0 && (
              <>
                <CommandGroup>
                  {companies.map((company) => (
                    <CommandItem
                      key={company.domain}
                      value={company.domain}
                      onSelect={() => handleSelect(company)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="flex-shrink-0">
                          {company.logo ? (
                            <img
                              src={company.logo}
                              alt={`${company.name} logo`}
                              className="h-8 w-8 rounded object-contain"
                              onError={(e) => {
                                // Fallback to icon if logo fails to load
                                e.currentTarget.style.display = "none";
                                const fallback = e.currentTarget.nextElementSibling;
                                if (fallback) {
                                  (fallback as HTMLElement).style.display = "flex";
                                }
                              }}
                            />
                          ) : null}
                          <div
                            className="h-8 w-8 rounded bg-muted items-center justify-center hidden"
                            style={{ display: company.logo ? "none" : "flex" }}
                          >
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-medium truncate">
                            {company.name}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {company.domain}
                          </span>
                        </div>
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            value?.domain === company.domain
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandGroup>
                  <CommandItem
                    onSelect={handleCustomCompany}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                          <Plus className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-medium truncate">
                          Use "{searchQuery}"
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          Set as company name
                        </span>
                      </div>
                    </div>
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}


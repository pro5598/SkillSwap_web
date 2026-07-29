"use client";

import { useState, useRef, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";

interface Option {
  value: string; // The value we store (e.g. skill name)
  label: string; // The display label (e.g. skill name)
}

interface MultiSelectProps {
  options: Option[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  onPropose?: (value: string) => void;
  onSearch?: (query: string) => Promise<Option[]>;
  placeholder?: string;
  label?: string;
}

export default function MultiSelect({ options, selectedValues, onChange, onPropose, onSearch, placeholder = "Select...", label }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Option[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!onSearch || !searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await onSearch(searchTerm.trim());
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  const handleSelect = (value: string) => {
    if (!selectedValues.includes(value)) {
      onChange([...selectedValues, value]);
    }
    setSearchTerm("");
  };

  const handleRemove = (valueToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedValues.filter(val => val !== valueToRemove));
  };

  const handlePropose = () => {
    if (searchTerm.trim() && onPropose) {
      onPropose(searchTerm.trim());
      setSearchTerm("");
      setIsOpen(false);
    }
  };

  const baseOptions = onSearch && searchTerm.trim() ? searchResults : options;

  const filteredOptions = baseOptions.filter(
    opt => !selectedValues.includes(opt.value) && opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEnterKey = () => {
    if (!searchTerm.trim()) return;

    const exactMatch = filteredOptions.find(
      opt => opt.label.toLowerCase() === searchTerm.trim().toLowerCase()
    );
    if (exactMatch) {
      handleSelect(exactMatch.value);
      return;
    }
    if (filteredOptions.length === 1) {
      handleSelect(filteredOptions[0].value);
      return;
    }
    if (filteredOptions.length === 0 && onPropose) {
      handlePropose();
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {label && <label className="block text-sm font-medium text-[#4A5568] mb-1">{label}</label>}
      <div 
        className="min-h-[42px] px-3 py-2 border border-gray-300 rounded-lg bg-white flex flex-wrap gap-2 items-center cursor-text focus-within:ring-2 focus-within:ring-[#F4A261] focus-within:border-transparent transition-all"
        onClick={() => setIsOpen(true)}
      >
        {selectedValues.map(value => {
          const option = options.find(o => o.value === value) || { label: value, value };
          return (
            <span key={value} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm font-medium">
              {option.label}
              <button 
                type="button" 
                onClick={(e) => handleRemove(value, e)}
                className="text-blue-600 hover:text-blue-900 focus:outline-none"
              >
                <X size={14} />
              </button>
            </span>
          );
        })}
        
        <input
          type="text"
          className="flex-1 bg-transparent outline-none min-w-[120px] text-sm text-black"
          placeholder={selectedValues.length === 0 ? placeholder : ""}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && searchTerm.trim()) {
              e.preventDefault();
              handleEnterKey();
            }
          }}
          onFocus={() => setIsOpen(true)}
        />
        <button type="button" onClick={() => setIsOpen(!isOpen)} className="text-gray-400 hover:text-gray-600 focus:outline-none">
          <ChevronDown size={18} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-800"
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 text-center flex flex-col items-center">
              {searchTerm ? (
                <>
                  <span className="mb-2">No matching skills found.</span>
                  {onPropose && (
                    <button 
                      type="button"
                      onClick={handlePropose}
                      className="text-blue-600 font-medium hover:text-blue-800 bg-blue-50 px-3 py-1 rounded"
                    >
                      Press Enter or click to add "{searchTerm}"
                    </button>
                  )}
                </>
              ) : (
                "All skills selected."
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

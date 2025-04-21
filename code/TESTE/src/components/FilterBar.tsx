
import React, { useState, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type FilterBarProps = {
  onFilterChange: (query: string, status?: string) => void;
  showStatusFilter?: boolean;
};

const FilterBar: React.FC<FilterBarProps> = ({ 
  onFilterChange,
  showStatusFilter = true 
}) => {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("");
  const [isFilterActive, setIsFilterActive] = useState(false);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      onFilterChange(query, status);
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [query, status, onFilterChange]);

  const handleReset = () => {
    setQuery("");
    setStatus("");
    onFilterChange("", "");
    setIsFilterActive(false);
  };

  const handleFilterToggle = () => {
    setIsFilterActive(!isFilterActive);
    if (isFilterActive) {
      setStatus("");
      onFilterChange(query, "");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-subtle p-3 mb-5">
      <div className="flex flex-col space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 text-gray-400 hover:text-gray-600"
              onClick={() => setQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center text-sm ${
                isFilterActive ? "text-carona-700 bg-carona-50" : "text-gray-500"
              }`}
              onClick={handleFilterToggle}
            >
              <Filter className="mr-1 h-4 w-4" />
              Filtros
            </Button>
            
            {(status) && (
              <Button
                variant="ghost"
                size="sm"
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={handleReset}
              >
                Limpar filtros
              </Button>
            )}
          </div>
          
          {query || status ? (
            <div className="flex items-center space-x-2">
              {query && (
                <Badge variant="secondary" className="text-xs">
                  Busca: {query}
                </Badge>
              )}
              {status && (
                <Badge variant="secondary" className="text-xs">
                  Status: {status}
                </Badge>
              )}
            </div>
          ) : null}
        </div>

        {isFilterActive && showStatusFilter && (
          <div className="pt-2 border-t mt-1">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="rejected">Rejeitado</SelectItem>
                <SelectItem value="blocked">Bloqueado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;

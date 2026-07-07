import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface SymbolsGuideContextProps {
  isOpen: boolean;
  openGuide: (initialSearch?: string, onSelect?: (symbol: string) => void) => void;
  closeGuide: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectSymbol?: (symbol: string) => void;
}

const SymbolsGuideContext = createContext<SymbolsGuideContextProps>({
  isOpen: false,
  openGuide: () => {},
  closeGuide: () => {},
  searchQuery: '',
  setSearchQuery: () => {},
  onSelectSymbol: undefined,
});

// eslint-disable-next-line react-refresh/only-export-components
export const useSymbolsGuide = () => useContext(SymbolsGuideContext);

interface SymbolsGuideProviderProps {
  children: ReactNode;
}

export function SymbolsGuideProvider({ children }: SymbolsGuideProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [onSelectSymbol, setOnSelectSymbol] = useState<((symbol: string) => void) | undefined>(undefined);

  const openGuide = (initialSearch?: string, onSelect?: (symbol: string) => void) => {
    if (initialSearch) {
      setSearchQuery(initialSearch);
    } else {
      setSearchQuery('');
    }
    setOnSelectSymbol(() => onSelect);
    setIsOpen(true);
  };

  const closeGuide = () => {
    setIsOpen(false);
    setOnSelectSymbol(undefined);
  };

  return (
    <SymbolsGuideContext.Provider
      value={{
        isOpen,
        openGuide,
        closeGuide,
        searchQuery,
        setSearchQuery,
        onSelectSymbol,
      }}
    >
      {children}
    </SymbolsGuideContext.Provider>
  );
}

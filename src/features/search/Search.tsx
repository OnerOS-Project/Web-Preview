import React from 'react';

export interface SearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  position?: 'topbar' | 'centered' | 'sidebar';
}

const Search: React.FC<SearchProps> = ({ placeholder = 'Search...', onSearch, position = 'centered' }) => {
  return (
    <div className={`os-search os-search--${position}`}>
      <input
        type="text"
        placeholder={placeholder}
        onChange={(e) => onSearch?.(e.target.value)}
      />
    </div>
  );
};

export default Search;

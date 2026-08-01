import React from 'react';
import { TextField, InputAdornment, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export default function SearchBar({ searchQuery, setSearchQuery }) {
  return (
    <Box sx={{ my: 2 }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search tokens by Customer Name or Token Number..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
}

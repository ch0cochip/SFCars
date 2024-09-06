import SearchProvider from "@contexts/SearchProvider";
import SearchListings from "@components/SearchListings";

const Search = () => {
  return (
    <SearchProvider>
      <SearchListings />
    </SearchProvider>
  );
};

export default Search;

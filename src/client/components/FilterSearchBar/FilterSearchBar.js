import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Fuse from 'fuse.js';

import './FilterSearchBar.less';

const FUZZY_SEARCH_CHAR_DELAY_MS = 80;

const FilterSearchBar = ({
  fuzzySearchOptions,
  onFilterOptions,
}) => {

  const [searchInput, setSearchInput] = useState('');
  const [fuzzy, setFuzzy] = useState();

  useEffect(() => {
    const fuseOptions = {
      isCaseSensitive: false,
      includeScore: false,
      shouldSort: true,
      includeMatches: false,
      findAllMatches: false,
      minMatchCharLength: 1,
      threshold: 0.2,
      useExtendedSearch: false,
      ignoreLocation: false,
      ignoreFieldNorm: false,
      keys: [
        'label',
      ],
    };

    setFuzzy(new Fuse(fuzzySearchOptions, fuseOptions));
  }, [fuzzySearchOptions]);

  const runFuseSearch = (input) => {
    if (input.length >= 1 && fuzzy) {
      const fuseSearchResults = fuzzy.search(input);
      const options = fuseSearchResults
        .map(({ item }) => item)
        .slice(0, 30);

      onFilterOptions(options);
    }
    else {
      onFilterOptions(fuzzySearchOptions);
    }
  };

  const onInputChange = (e) => {
    const input = e.target.value || '';
    setSearchInput(input);
    clearTimeout(timeout);
    const timeout = setTimeout(() => { runFuseSearch(input); }, FUZZY_SEARCH_CHAR_DELAY_MS);
  };

  return (
    <div styleName={classNames('FilterSearchBar')}>
      <input
        value={searchInput}
        type='text'
        onChange={onInputChange}
        placeholder='Search Market'
      />
    </div>
  );
};

FilterSearchBar.propTypes = {
  fuzzySearchOptions: PropTypes.array.isRequired,
  onFilterOptions: PropTypes.func,
};

export default FilterSearchBar;

import React, { useState } from 'react';
import PropTypes from 'prop-types';

import CollapsibleContainer, {
  COLLAPSIBLE_CONTAINER_STATUSES,
  COLLAPSIBLE_CONTAINER_BORDER_TYPES,
} from '#client/components/CollapsibleContainer/CollapsibleContainer.js';

const CollapsibleContainerController = (props) => {
  const {
    children,
  } = props;

  const [isExpanded, setIsExpanded] = useState(false);
  const onClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <CollapsibleContainer
      {...props}
      isExpanded={isExpanded}
      onClick={onClick}
    >
      {children}
    </CollapsibleContainer>
  );
};

CollapsibleContainerController.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  status: PropTypes.oneOf(COLLAPSIBLE_CONTAINER_STATUSES),
  borderType: PropTypes.oneOf(COLLAPSIBLE_CONTAINER_BORDER_TYPES),
  editLinkUrl: PropTypes.string,
};

export default CollapsibleContainerController;

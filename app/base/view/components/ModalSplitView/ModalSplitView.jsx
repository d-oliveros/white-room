import React from 'react';
import PropTypes from 'prop-types';

import Box from '#base/view/components/Box/Box.jsx';
import DarkModal from '#base/view/components/DarkModal/DarkModal.jsx';
import './ModalSplitView.less';

const ModalSplitView = ({
  leftChild,
  rightChild,
  onClose,
}) => {

  return (
    <DarkModal>
      <Box styleName='ModalSplitView'>
        <Box styleName='leftChildContainer'>
          <Box margin='40px'>
            <img
              onClick={onClose}
              src='/images/circle-x-icon-white.svg'
              alt='close-icon'
              styleName='closeButton'
            />
            {leftChild}
          </Box>
        </Box>
        <Box styleName='rightChildContainer'>
          {rightChild}
        </Box>
      </Box>
    </DarkModal>
  );
};

ModalSplitView.propTypes = {
  leftChild: PropTypes.node.isRequired,
  rightChild: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ModalSplitView;

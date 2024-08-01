import React from 'react';
import PropTypes from 'prop-types';

import DarkModal from '#app/view/components/DarkModal/DarkModal.jsx';
import './ModalSplitView.css';

const ModalSplitView = ({
  leftChild,
  rightChild,
  onClose,
}) => {

  return (
    <DarkModal>
      <div styleName='ModalSplitView'>
        <div styleName='leftChildContainer'>
          <div margin='40px'>
            <img
              onClick={onClose}
              src='/images/circle-x-icon-white.svg'
              alt='close-icon'
              styleName='closeButton'
            />
            {leftChild}
          </div>
        </div>
        <div styleName='rightChildContainer'>
          {rightChild}
        </div>
      </div>
    </DarkModal>
  );
};

ModalSplitView.propTypes = {
  leftChild: PropTypes.node.isRequired,
  rightChild: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ModalSplitView;

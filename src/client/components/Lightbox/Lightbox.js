import React, { Component } from 'react';
import ReactImages from 'react-images';
import PropTypes from 'prop-types';

class Lightbox extends Component {
  static propTypes = {
    photoUrls: PropTypes.array.isRequired,
    currentImage: PropTypes.number.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onClickPrev: PropTypes.func.isRequired,
    onClickNext: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
  };

  render() {
    const {
      photoUrls,
      currentImage,
      isOpen,
      onClickPrev,
      onClickNext,
      onClose,
    } = this.props;

    const lightboxPhotoUrls = photoUrls.map((url) => {
      return { src: url };
    });

    return (
      <ReactImages
        images={lightboxPhotoUrls}
        currentImage={currentImage}
        isOpen={isOpen}
        onClickPrev={onClickPrev}
        onClickNext={onClickNext}
        onClose={onClose}
        showImageCount={false}
        backdropClosesModal
      />
    );
  }
}

export default Lightbox;

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Box from '#base/view/components/Box/Box.jsx';
import Flex from '#base/view/components/Flex/Flex.jsx';
import Text from '#base/view/components/Text/Text.jsx';
import DarkModal from '#base/view/components/DarkModal/DarkModal.jsx';
import ModalContent from '#base/view/components/ModalContent/ModalContent.jsx';

class MediaCarousel extends Component {
  static propTypes = {
    mediaList: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
    padding: PropTypes.string,
    type: PropTypes.string.isRequired,
    onMediaOpen: PropTypes.func,
    onMediaClose: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.state = {
      viewingMedia: null,
    };
  }

  _onCloseViewingMedia = () => {
    const { onMediaClose } = this.props;
    const { viewingMedia } = this.state;

    if (onMediaClose) {
      onMediaClose(viewingMedia);
    }

    this.setState({
      viewingMedia: null,
    });
  }

  _onMediaClick = (media) => {
    const { onMediaOpen } = this.props;
    if (onMediaOpen) {
      onMediaOpen(media);
    }
    this.setState({
      viewingMedia: media,
    });
  }

  render() {
    const { mediaList, padding, type } = this.props;
    const { viewingMedia } = this.state;

    const iconUrl = mediaList.length > 1
      ? '/images/play-white-shadow-small.svg'
      : '/images/play-white-shadow-large.svg';

    let mediaDOM;

    if (mediaList.length > 1) {
      mediaDOM = (
        <Box width='100%' padding={padding} overflowX='auto' whiteSpace='nowrap'>
          {mediaList.map((media) => (
            <Box
              cursor='pointer'
              verticalAlign='top'
              onClick={() => this._onMediaClick(media)}
              display='inlineBlock'
              marginRight='15px'
              width='160px'
              key={media.id}
            >
              <Box
                backgroundImage={`url("${media.thumbnailUrl}")`}
                backgroundSize='cover'
                width='160px'
                height='100px'
                position='relative'
                borderRadius='10px'
                boxShadow='0px 5px 13px rgba(25, 51, 64, 0.1)'
                overflow='hidden'
              >
                <Flex height='100%' align='center' justify='center'>
                  <img alt='cta-icon' src={iconUrl} />
                </Flex>
              </Box>
              <Box paddingTop='6px' width='160px' overflow='hidden' textOverflow='ellipsis'>
                <Text
                  weight='600'
                  size='16'
                >
                  {media.title}
                </Text>
              </Box>
              {media.description && (
                <Box width='160px' overflow='hidden' textOverflow='ellipsis'>
                  <Text
                    color='grey600'
                    weight='500'
                    size='12'
                    lineHeight='20px'
                  >
                    {media.description}
                  </Text>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      );
    }
    else {
      mediaDOM = mediaList.map((media) => (
        <Box padding={padding} key={media.id}>
          <Box
            cursor='pointer'
            onClick={() => this._onMediaClick(media)}
            backgroundImage={`url("${media.thumbnailUrl}")`}
            backgroundSize='cover'
            width='335px'
            height='215px'
            position='relative'
            borderRadius='10px'
            overflow='hidden'
            boxShadow='0px 5px 21px rgba(25, 51, 64, 0.1)'
            key={media.id}
          >
            <Box
              position='absolute'
              bottom='0'
              left='0'
              width='100%'
              padding='45px 15px 15px'
              backgroundImage='linear-gradient(to bottom, rgba(51, 41, 0, 0), rgba(51, 46, 0, 0.7))'
              boxSizing='border-box'
            >
              <Text
                color='white'
                weight='600'
                size='21'
                font='whitney-sc'
                display='block'
              >
                {media.title ? media.title.toLowerCase() : ''}
              </Text>
              {media.description && (
                <Text
                  color='white'
                  weight='500'
                  size='16'
                  display='block'
                  whiteSpace='nowrap'
                  textOverflow='ellipsis'
                  overflow='hidden'
                >
                  {media.description}
                </Text>
              )}
            </Box>
            <Flex height='100%' align='center' justify='center'>
              <img alt='cta-icon' src={iconUrl} />
            </Flex>
          </Box>
        </Box>
      ));
    }

    return (
      <div>
        <Box width='100%' overflow='hidden'>
          {mediaDOM}
        </Box>
        {viewingMedia && (
          <DarkModal>
            <ModalContent
              onCloseIconClick={this._onCloseViewingMedia}
              style={{
                width: '100%',
              }}
            >
              <iframe
                allowFullScreen
                allow='xr-spatial-tracking'
                src={viewingMedia.url}
                title='Video'
                frameBorder='0'
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
              />
            </ModalContent>
          </DarkModal>
        )}
      </div>
    );
  }
}

export default MediaCarousel;

import React, { useState } from 'react';
import PropTypes from 'prop-types';

import useBranch from '#white-room/client/hooks/useBranch.js';
import {
  makeProxiedS3FilePath,
} from '#white-room/client/lib/fileUploader.js';

import Box from '#app/view/components/Box/Box.jsx';

const S3FileDisplay = ({
  url,
  maxWidth,
  maxHeight,
  withRotateButton,
}) => {
  const [rotationDegrees, setRotationDegrees] = useState(0);
  const { appUrl } = useBranch({
    appUrl: ['env', 'APP_URL'],
  });

  const proxiedS3FilePath = makeProxiedS3FilePath(url, appUrl);
  // TODO(@d-oliveros): Render <img> only if has a valid image extension.
  if (!proxiedS3FilePath.toLowerCase().includes('.pdf')) {
    const imageStyle = {
      maxHeight,
      maxWidth,
    };

    if (rotationDegrees) {
      imageStyle.transform = `rotate(${rotationDegrees}deg)`;
    }

    const onRotateButtonClick = () => {
      setRotationDegrees(rotationDegrees + 90);
    };
    return (
      <Box position='relative'>
        <img
          src={proxiedS3FilePath}
          alt={proxiedS3FilePath}
          style={imageStyle}
        />
        {withRotateButton && (
          <div className='rotateButton' onClick={onRotateButtonClick}>
            rotate
          </div>
        )}
      </Box>
    );
  }

  if (proxiedS3FilePath.toLowerCase().includes('.pdf')) {
    if (!global.navigator.pdfViewerEnabled) {
      // The browser does not support inline viewing of PDF files.
      return (
        <span>
          The browser does not support inline viewing of PDF files.
        </span>
      );
    }

    return (
      <iframe
        title={proxiedS3FilePath}
        src={`/pdf-viewer?pdfUrl=${proxiedS3FilePath}`}
        style={{ width: maxWidth || '75vw', height: maxHeight || '700px' }}
      />
    );
  }

  return (
    <span>
      {`Unsupported file extension: ${proxiedS3FilePath}`}
    </span>
  );
};

S3FileDisplay.propTypes = {
  url: PropTypes.string.isRequired,
  maxWidth: PropTypes.string,
  maxHeight: PropTypes.string,
  withRotateButton: PropTypes.bool,
};

S3FileDisplay.defaultProps = {
  maxWidth: '100%',
  maxHeight: '100%',
};

export default S3FileDisplay;

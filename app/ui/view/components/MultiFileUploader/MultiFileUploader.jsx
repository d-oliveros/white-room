import React, { Component } from 'react';
import PropTypes from 'prop-types';
import logger from '#white-room/logger.js';
import pluralize from 'pluralize';

import {
  createFileObjToBeUploaded,
  uploadFileToS3,
} from '#white-room/client/lib/fileUploader.js';

class MultiFileUploader extends Component {
  static propTypes = {
    accept: PropTypes.string,
    filePath: PropTypes.string.isRequired,
    isPrivate: PropTypes.bool,
    uploadAs: PropTypes.number,
    onFilesUploaded: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    maxFiles: PropTypes.number,
    value: PropTypes.arrayOf(PropTypes.string),
    totalFiles: PropTypes.number,
    successMessage: PropTypes.string,
    hidePreview: PropTypes.bool,
    replaceFields: PropTypes.bool,
  }

  static defaultProps = {
    accept: '*',
    isPrivate: false,
  }

  constructor(props) {
    super(props);
    this.state = {
      uploading: false,
      successfulUpload: !!props.value || false,
    };
    this._onFileInputChange = this._onFileInputChange.bind(this);
    this._isUnmounting = false;
    this._uploadInputEl = null;
  }

  componentWillUnmount() {
    this._isUnmounting = true;
  }

  _onUploadInputRef = (el) => {
    this._uploadInputEl = el;
  }

  async _onFileInputChange(event) {
    const { onFilesUploaded, filePath, isPrivate, uploadAs, maxFiles, totalFiles } = this.props;
    const { files } = event.target;

    if (maxFiles) {
      if (totalFiles > maxFiles) {
        global.alert(`Photo limit exceeded, upload fewer than ${maxFiles} photos`);
        return;
      }
    }

    this.setState({
      uploading: true,
    });

    try {

      // NOTE(@d-oliveros): FileList is not an array, so we can't use normal array methods.
      const fileUploadPromises = [];
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        fileUploadPromises.push(
          uploadFileToS3(
            createFileObjToBeUploaded(file),
            {
              filePath,
              isPrivate,
              uploadAs,
            },
          )
        );
      }
      const uploadResponses = await Promise.all(fileUploadPromises);
      onFilesUploaded(uploadResponses);
    }
    catch (error) {
      logger.error(error);
    }
    if (this._isUnmounting) {
      return;
    }
    this.setState({
      uploading: false,
      successfulUpload: true,
    });
  }

  _onReUploadButtonClick = () => {
    this.setState({
      successfulUpload: null,
      uploading: false,
    });
  }

  render() {
    const { accept, placeholder, successMessage, hidePreview, totalFiles, replaceFields } = this.props;
    const { uploading, successfulUpload } = this.state;
    const successCopy = successMessage
    || `Total of ${pluralize('file', totalFiles, true)} uploaded`;
    return (
      <div>
        <label // eslint-disable-line jsx-a11y/label-has-associated-control
          className='fileUpload upload'
          style={uploading || (successfulUpload && replaceFields) ? { display: 'none' } : null}
        >
          <span className='text'>
            {placeholder || 'tap to upload'}
          </span>
          <input
            ref={this._onUploadInputRef}
            type='file'
            accept={accept}
            multiple
            onChange={this._onFileInputChange}
          />
        </label>
        {uploading && (
          <span className='fileUpload uploading'>
            <span className='text'>uploading, please wait...</span>
          </span>
        )}
        {!uploading && hidePreview && successfulUpload && (
          <>
            <span
              className='fileUpload successMessage'
              onClick={this._onReUploadButtonClick}
            >
              <span className='text'>{successCopy}</span>
              <span className='subtext'>Tap to upload a different file</span>
            </span>
          </>
        )}
      </div>
    );
  }
}

export default MultiFileUploader;

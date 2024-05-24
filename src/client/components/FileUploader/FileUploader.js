import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { isImageFileUrl } from 'common/util/imageExtensions';
import log from 'client/lib/log';
import {
  isPDFFile,
  createFileObjToBeUploaded,
  uploadFileToS3,
  makeProxiedS3FilePath,
  getFileValidationError,
} from 'client/lib/fileUploader';

import ButtonDeprecated, {
  BUTTON_THEME_WHITE_ADOBE_SMALL,
} from 'client/components/ButtonDeprecated/ButtonDeprecated';
import S3FileDisplay from 'client/components/S3FileDisplay/S3FileDisplay';
import Checkbox from 'client/components/Checkbox/Checkbox';
import Box from 'client/components/Box/Box';
import Text from 'client/components/Text/Text';

class FileUploader extends Component {
  static propTypes = {
    value: PropTypes.string,
    accept: PropTypes.string,
    isPrivate: PropTypes.bool,
    uploadAs: PropTypes.number,
    minWidth: PropTypes.number,
    minHeight: PropTypes.number,
    filePath: PropTypes.string.isRequired,
    onFileUploaded: PropTypes.func.isRequired,
    onFileRemoved: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    warning: PropTypes.node,
    checkmarks: PropTypes.array,
    successMessage: PropTypes.string,
    downloadButtonLabel: PropTypes.string,
    requirePDFDocs: PropTypes.bool,
  }

  static defaultProps = {
    accept: '*',
    placeholder: 'tap to upload',
    isPrivate: false,
  }

  constructor(props) {
    super(props);
    this.state = {
      s3FileUrl: props.value || null,
      uploading: false,
      checks: props.value && props.checkmarks
        ? props.checkmarks.reduce((memo, check) => ({ ...memo, [check]: true }), {})
        : {},
    };
    this._onFileInputChange = this._onFileInputChange.bind(this);
    this._isUnmounting = false;
    this._uploadInputEl = null;
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      this.props.value
      && nextProps.value
      && this.props.value !== nextProps.value
    ) {
      this.setState({
        s3FileUrl: nextProps.value || null,
        uploading: false,
        checks: nextProps.value && nextProps.checkmarks
          ? nextProps.checkmarks.reduce((memo, check) => ({ ...memo, [check]: true }), {})
          : {},
      });
    }
    else if (
      !this.props.value
      && nextProps.value
      && !this.state.uploading
      && this.state.s3FileUrl !== nextProps.value
    ) {
      this.setState({
        s3FileUrl: nextProps.value,
      });
    }
  }

  componentWillUnmount() {
    this._isUnmounting = true;
  }

  _onUploadInputRef = (el) => {
    this._uploadInputEl = el;
  }

  async _onFileInputChange(event) {
    try {
      const {
        filePath,
        isPrivate,
        uploadAs,
        minWidth,
        minHeight,
      } = this.props;
      const file = event.target.files[0];
      const fileObjectToBeUploaded = createFileObjToBeUploaded(file);

      const validationError = await getFileValidationError(fileObjectToBeUploaded, {
        minWidth, minHeight,
      });
      if (validationError) {
        this.setState({
          s3FileUrl: null,
          uploading: false,
          validationError,
        }, this._validateUpload);
        return;
      }

      this.setState({
        s3FileUrl: null,
        uploading: true,
        validationError,
      });

      const uploadResponse = await uploadFileToS3(fileObjectToBeUploaded, {
        filePath,
        isPrivate,
        uploadAs,
      });
      if (this._isUnmounting) {
        return;
      }
      this.setState({
        s3FileUrl: uploadResponse.s3FileUrl,
        uploading: false,
        validationError,
      }, this._validateUpload);
    }
    catch (error) {
      log.error(error);
    }
  }

  _validateUpload = () => {
    const { checkmarks, onFileUploaded } = this.props;
    const { s3FileUrl, checks, validationError } = this.state;

    // If has any validation error
    if (validationError) {
      onFileUploaded({ s3FileUrl: null });
      return;
    }

    // Update file url if there are no checkmarks
    if (!checkmarks) {
      onFileUploaded({ s3FileUrl });
      return;
    }

    // Check if all the checkmarks are checked
    const allCheckmarksChecked = checkmarks.every((checkmark) => checks[checkmark]);
    onFileUploaded({ s3FileUrl: allCheckmarksChecked ? s3FileUrl : null });
  }

  _onClickCheckbox = (checkmark) => {
    const checks = {
      ...this.state.checks,
      [checkmark]: !this.state.checks[checkmark],
    };

    this.setState({ checks }, this._validateUpload);
  };

  _onReUploadButtonClick = () => {
    const { onFileRemoved } = this.props;
    this.setState({
      s3FileUrl: null,
      uploading: false,
    });

    if (this._uploadInputEl) {
      this._uploadInputEl.click();
    }
    onFileRemoved();
  }

  render() {
    const {
      accept,
      placeholder,
      warning,
      checkmarks,
      successMessage,
      downloadButtonLabel,
      isPrivate,
      requirePDFDocs,
    } = this.props;
    const {
      s3FileUrl,
      uploading,
      checks,
      validationError,
    } = this.state;

    return (
      <div onClick={(e) => e.stopPropagation()}>
        <label // eslint-disable-line jsx-a11y/label-has-associated-control
          className='fileUpload upload'
          style={uploading || s3FileUrl ? { display: 'none' } : null}
        >
          <span className='text'>{placeholder}</span>
          <input
            ref={this._onUploadInputRef}
            type='file'
            accept={accept}
            onChange={this._onFileInputChange}
          />
        </label>
        {uploading && (
          <span className='fileUpload upload'>
            <span className='text'>uploading...</span>
          </span>
        )}
        {!uploading && s3FileUrl && successMessage && (
          <>
            <span
              className='fileUpload successMessage'
              onClick={this._onReUploadButtonClick}
            >
              <span className='text'>{successMessage}</span>
              <span className='subtext'>Tap to upload a different file</span>
            </span>
            {downloadButtonLabel && (
              <Box marginTop='14px'>
                <ButtonDeprecated
                  theme={BUTTON_THEME_WHITE_ADOBE_SMALL}
                  href={s3FileUrl}
                  download
                >
                  {downloadButtonLabel}
                </ButtonDeprecated>
              </Box>
            )}
          </>
        )}
        {!uploading && s3FileUrl && !successMessage && (
          <span
            className='fileUpload success'
            onClick={this._onReUploadButtonClick}
          >
            {isImageFileUrl(s3FileUrl) ? (
              <div
                className='uploadThumbnail'
                style={{
                  backgroundImage: `url("${isPrivate ? makeProxiedS3FilePath(s3FileUrl) : s3FileUrl}")`,
                }}
              />
            ) : (
              <S3FileDisplay url={s3FileUrl} />
            )}
          </span>
        )}
        {s3FileUrl && requirePDFDocs && !isPDFFile(s3FileUrl) && (
          <Box padding='0px 19px 10px'>
            <Text color='red' weight='bold'>
              The document provided is not a PDF. Please upload a PDF instead, if possible.
            </Text>
          </Box>
        )}
        {validationError && (
          <Box padding='0px 19px'>
            <Text color='red' weight='bold'>
              {validationError}
            </Text>
          </Box>
        )}
        {warning && (
          <div className='fileUploadWarningChecklistHeader'>
            {warning}
          </div>
        )}
        {Array.isArray(checkmarks) && checkmarks.map((checkmark) => (
          <div className='fileUploadWarningCheckmark' key={checkmark}>
            <Checkbox
              onClick={() => this._onClickCheckbox(checkmark)}
              checked={checks[checkmark]}
            >
              {checkmark}
            </Checkbox>
          </div>
        ))}
      </div>
    );
  }
}

export default FileUploader;

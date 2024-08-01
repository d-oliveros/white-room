import React from 'react';
import { useParams } from 'react-router-dom';
import parseJSON from '#white-room/util/parseJSON.js';
import logger from '#white-room/logger.js';

const getPdfComponentFromComponentId = (componentId) => {
  switch (componentId) {
    default: {
      const error = new Error(`Component ID ${componentId} not supported.`);
      error.name = 'PdfGeneratorComponentIdNotSupportedError';
      error.details = { componentId };
      throw error;
    }
  }
};

const PdfGeneratorPage = () => {
  const { pdfComponentId } = useParams();
  const PdfComponent = getPdfComponentFromComponentId(pdfComponentId);
  let props;

  try {
    props = parseJSON(global.atob(/* locationQuery.props */));
  }
  catch (error) {
    log.warn(`Failed to parse props object: ${props}`);
  }

  return (
    <PdfComponent {...(props || {})} />
  );
};

PdfGeneratorPage.getMetadata = () => ({
  title: 'PDF Generator',
});

export default PdfGeneratorPage;

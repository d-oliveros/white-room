import React from 'react';
import { useParams } from 'react-router-dom';
import parseJSON from '#common/util/parseJSON.js';
import { SCREEN_ID_PDF_GENERATOR } from '#client/constants/screenIds.js';
import log from '#client/lib/log.js';
import useTransitionHook from '#client/hooks/useTransitionHook.js';
import useScreenId from '#client/hooks/useScreenId.jsx';
import useScrollToTop from '#client/hooks/useScrollToTop.jsx';

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
  useScrollToTop();
  useTransitionHook();
  useScreenId(SCREEN_ID_PDF_GENERATOR);

  const { pdfComponentId } = useParams();
  const PdfComponent = getPdfComponentFromComponentId(pdfComponentId);
  let props;

  try {
    props = parseJSON(global.atob(/* locationQuery.props */));
  } catch (error) {
    log.warn(`Failed to parse props object: ${props}`);
  }

  return <PdfComponent {...(props || {})} />;
};

PdfGeneratorPage.getPageMetadata = () => ({
  pageTitle: 'PDF Generator',
});

export default PdfGeneratorPage;

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import Box from '#client/components/Box/Box.js';
import Card from '#client/components/Card/Card.js';
import DarkModal from '#client/components/DarkModal/DarkModal.js';
import S3FileDisplay from '#client/components/S3FileDisplay/S3FileDisplay.js';
import InitialsCircle, {
  INITIALS_CIRCLE_THEME_PURPLE,
  INITIALS_CIRCLE_THEME_YELLOW,
} from '#client/components/InitialsCircle/InitialsCircle.js';
import Button, {
  BUTTON_THEME_ADOBE_BLUE,
} from '#client/components/Button/Button.js';

import './ModalDocsSplitView.less';

function getInitialState(groups) {
  const item = ((groups[0] || {}).items || [])[0] || null;
  if (!item) {
    return null;
  }
  return {
    title: `${groups[0].title}: ${item.title} ${item.subtitle || ''}`.trim(),
    value: item.value,
  };
}

const ModalDocsSplitView = ({
  navbarTitle,
  sidebarTitle,
  ctaText,
  ctaClick,
  groups,
  onClose,
}) => {
  const [viewingItem, setViewingItem] = useState(getInitialState(groups));

  return (
    <DarkModal>
      <Box styleName='ModalDocsSplitView'>
        <Box styleName='navbar'>
          <img
            onClick={onClose}
            src='/images/x-circle-gray-dark.svg'
            alt='close-icon'
            styleName='closeButton'
            width='40px'
            height='40px'
          />
          {navbarTitle}
        </Box>
        <Box styleName='body'>
          <Box styleName='leftChildContainer'>
            <Box styleName='leftChildInner'>
              <Box styleName='sidebarItemContainer'>
                <Box styleName='sidebarTitle'>
                  {sidebarTitle}
                </Box>
                {groups.map((group, index) => (
                  <Card
                    // eslint-disable-next-line react/no-array-index-key
                    key={`${group.title}-${index}`}
                    margin={index === 0 ? '0 0 10px' : '10px 0'}
                    padding='15px'
                  >
                    {group.title && (
                      <Box styleName='sidebarGroupTitle'>
                        <Box display='inlineBlock' paddingRight='10px'>
                          <InitialsCircle
                            name={group.title}
                            theme={index % 2 === 0
                              ? INITIALS_CIRCLE_THEME_PURPLE
                              : INITIALS_CIRCLE_THEME_YELLOW
                            }
                          />
                        </Box>
                        {group.title}
                      </Box>
                    )}
                    {(group.items || []).map(({ title, subtitle, value }, index) => {
                      const isActive = viewingItem?.value === value;
                      return (
                        <Box
                          // eslint-disable-next-line react/no-array-index-key
                          key={`${value}-${index}`}
                          styleName={classnames('itemRow', isActive && 'itemRowActive')}
                          onClick={() => {
                            setViewingItem({
                              title: `${group.title}: ${title} ${subtitle || ''}`.trim(),
                              value: value,
                            });
                          }}
                        >
                          <Box>
                            <span styleName='sidebarItemTitle'>
                              {title}
                            </span>
                            {subtitle && (
                              <span styleName='sidebarItemSubtitle'>
                                {subtitle}
                              </span>
                            )}
                          </Box>
                          <Box styleName='sidebarItemViewCta'>
                            {isActive ? 'viewing' : 'View'}
                          </Box>
                        </Box>
                      );
                    })}
                  </Card>
                ))}
              </Box>
              {ctaText && ctaClick && (
                <Box styleName='sidebarFooter'>
                  <Button
                    theme={BUTTON_THEME_ADOBE_BLUE}
                    hasBoxShadow
                    minWidth='100%'
                    onClick={ctaClick}
                  >
                    {ctaText}
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
          <Box styleName='rightChildContainer'>
            {viewingItem && (
              <>
                <Box styleName='fileTitle'>
                  {viewingItem.title}
                </Box>
                <Box styleName='fileContent'>
                  <S3FileDisplay
                    url={viewingItem.value}
                  />
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </DarkModal>
  );
};

ModalDocsSplitView.propTypes = {
  navbarTitle: PropTypes.string.isRequired,
  sidebarTitle: PropTypes.string.isRequired,
  groups: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  ctaText: PropTypes.string,
  ctaClick: PropTypes.func,
};

export default ModalDocsSplitView;

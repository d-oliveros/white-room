import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import S3FileDisplay from '#ui/view/components/S3FileDisplay/S3FileDisplay.jsx';
import InitialsCircle, {
  INITIALS_CIRCLE_THEME_PURPLE,
  INITIALS_CIRCLE_THEME_YELLOW,
} from '#ui/view/components/InitialsCircle/InitialsCircle.jsx';
import Button, {
  BUTTON_THEME_ADOBE_BLUE,
} from '#ui/view/components/Button/Button.jsx';

import './ModalDocsSplitView.css';

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
    <div styleName='ModalDocsSplitView'>
      <div styleName='navbar'>
        <img
          onClick={onClose}
          src='/images/x-circle-gray-dark.svg'
          alt='close-icon'
          styleName='closeButton'
          width='40px'
          height='40px'
        />
        {navbarTitle}
      </div>
      <div styleName='body'>
        <div styleName='leftChildContainer'>
          <div styleName='leftChildInner'>
            <div styleName='sidebarItemContainer'>
              <div styleName='sidebarTitle'>
                {sidebarTitle}
              </div>
              {groups.map((group, index) => (
                <div
                  // eslint-disable-next-line react/no-array-index-key
                  key={`${group.title}-${index}`}
                  margin={index === 0 ? '0 0 10px' : '10px 0'}
                  padding='15px'
                >
                  {group.title && (
                    <div styleName='sidebarGroupTitle'>
                      <div display='inlineBlock' paddingRight='10px'>
                        <InitialsCircle
                          name={group.title}
                          theme={index % 2 === 0
                            ? INITIALS_CIRCLE_THEME_PURPLE
                            : INITIALS_CIRCLE_THEME_YELLOW
                          }
                        />
                      </div>
                      {group.title}
                    </div>
                  )}
                  {(group.items || []).map(({ title, subtitle, value }, index) => {
                    const isActive = viewingItem?.value === value;
                    return (
                      <div
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
                        <div>
                          <span styleName='sidebarItemTitle'>
                            {title}
                          </span>
                          {subtitle && (
                            <span styleName='sidebarItemSubtitle'>
                              {subtitle}
                            </span>
                          )}
                        </div>
                        <div styleName='sidebarItemViewCta'>
                          {isActive ? 'viewing' : 'View'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            {ctaText && ctaClick && (
              <div styleName='sidebarFooter'>
                <Button
                  theme={BUTTON_THEME_ADOBE_BLUE}
                  hasdivShadow
                  minWidth='100%'
                  onClick={ctaClick}
                >
                  {ctaText}
                </Button>
              </div>
            )}
          </div>
        </div>
        <div styleName='rightChildContainer'>
          {viewingItem && (
            <>
              <div styleName='fileTitle'>
                {viewingItem.title}
              </div>
              <div styleName='fileContent'>
                <S3FileDisplay
                  url={viewingItem.value}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
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

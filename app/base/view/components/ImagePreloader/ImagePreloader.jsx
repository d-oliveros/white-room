import { Component } from 'react';
import PropTypes from 'prop-types';

export default class ImagePreloader extends Component {
  static propTypes = {
    imageUrls: PropTypes.array.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      preloadedImageUrls: [],
    };
  }

  componentDidMount() {
    this._preloadImages(this.props.imageUrls);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this._preloadImages(nextProps.imageUrls);
  }

  _preloadImages(imageUrls) {
    const { preloadedImageUrls } = this.state;
    const newPreloadedImageUrls = [];

    for (const imageUrl of imageUrls) {
      if (!preloadedImageUrls.includes(imageUrl)) {
        if (process.browser) {
          const image = new Image();
          image.src = imageUrl;
        }
        newPreloadedImageUrls.push(imageUrl);
      }
    }

    if (newPreloadedImageUrls) {
      this.setState({
        preloadedImageUrls: [
          ...preloadedImageUrls,
          ...newPreloadedImageUrls,
        ],
      });
    }
  }

  render() {
    return null;
  }
}

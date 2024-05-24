export default function closeAskForReviewDialog({ state }) {
  state.set(['mobileApp', 'askForReview'], false);
}

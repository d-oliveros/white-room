export default function closeAskForReviewDialog({ state }) {
  state.set(['client', 'mobileApp', 'askForReview'], false);
}

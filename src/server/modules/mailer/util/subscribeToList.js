import {map} from 'lodash';
import mailchimp from '../clients/mailchimp';

export default function subscribeToList(emails, list) {
  mailchimp.call(
    'lists',
    'batch-subscribe', {
      id: list,
      batch: map(emails, (email) => {
        return {email};
      }),
      send_welcome: false,
      double_optin: false
    },
    function(err) {
      if (err) __log.error(err);
    }
  );
}

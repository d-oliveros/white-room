import Intercom from 'intercom.io';

let intercom = null;

if (__config.integrations.intercom) {
  intercom = new Intercom(__config.integrations.intercom);
}

export default intercom;

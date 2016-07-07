import request from 'superagent';
import { noop, extend } from 'lodash';
import moment from 'moment';

const { endpoint, channel } = __config.integrations.slack;

const DEFAULT = {
  'username': 'Archimedes',
  'icon_url': 'https://avatars3.githubusercontent.com/u/11918585',
  'channel': channel
};

export function newItem(item, user) {
  const urlItem = `${__config.server.host}/${item.path}`;
  let text = `New item: <${urlItem}|${item.title}>`;

  if (user) {
    const joined = moment(user.created).utcOffset('-0700').format('MMM D YYYY, h:mm a');
    const urlUser = `${__config.server.host}/${user.path}`;
    text += `\n<${urlUser}|${user.name}>, Joined ${joined}`;
  }

  const attachments = [{
    fallback: `New question: ${item.title} - ${urlItem}`,
    color: '#077db0',
    text
  }];

  const data = extend({ attachments }, DEFAULT);

  // Send this message to the slack endpoint
  if (endpoint) {
    sendMessage(endpoint, data);
  }
}

export function signUp(user) {
  if (!endpoint) return;

  const urlUser = `${__config.server.host}/${user.path}`;

  const text = `New User: ` +
    `<${urlUser}|${user.name}>, Joined ${moment(user.created).utcOffset('-0700').format('MMM D YYYY, h:mm a')}`;

  const attachments = [{
    fallback: `New User: ${user.name} - ${urlUser}`,
    color: '#077db0',
    text
  }];

  const data = extend({ attachments }, DEFAULT);
  sendMessage(endpoint, data);
}

function sendMessage(endpoint, data, callback = noop) {
  request.post(endpoint)
    .set('Content-Type', 'application/json')
    .send(data)
    .end(callback);
}

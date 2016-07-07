import Verifalia from 'verifalia';
import invariant from 'invariant';
import dns from 'dns';
import { uniq, compact, difference, isArray } from 'lodash';
import { isEmail } from 'cd-common';

const { VERIFALIA_ID, VERIFALIA_KEY } = process.env;
const debug = __log.debug('mailer:verifyEmails');
let verifalia;

if (VERIFALIA_ID && VERIFALIA_KEY) {
  verifalia = Verifalia.client(VERIFALIA_ID, VERIFALIA_KEY);
}

/**
 * Checks if hostname has MX records.
 *
 * @param  {String}  hostname  Hostname to check.
 * @return {String|Boolean}    The same hostname if it has valid MX records,
 *                             or "false" if the hostname doesn't have MX records.
 */
async function checkMxRecords(hostname) {
  return await new Promise((resolve) => {
    dns.resolveMx(hostname, (err, addresses) => {
      resolve(!err && addresses.length ? hostname : false);
    });
  });
}

async function getValidHostnames(hostnames) {
  return compact(await Promise.all(hostnames.map(checkMxRecords)));
}

export default async function verifyEmails(emails) {
  invariant(isArray(emails), 'Emails is not an array');

  debug(`Verifying emails: ${emails.length} emails`);

  emails = emails.filter(isEmail);

  const hostnames = uniq(emails.map((email) => email.split('@')[1]));
  const validHostnames = await getValidHostnames(hostnames);

  // Remove emails from hosts that do not have valid MX records set
  emails = emails.filter((email) => {
    return validHostnames.indexOf(email.split('@')[1]) > -1;
  });

  if (!verifalia || emails.length === 0) {
    return emails;
  }

  return await new Promise((resolve, reject) => {
    verifalia.emailValidations.submit(emails, {
      waitForCompletion: true,
      callback(err, data) {
        if (!data) err = err || new Error(`No data received`);

        else if (data.status !== 'completed' || !data.entries[0]) {
          err = err || new Error(`Operation status is not completed`);
        }

        if (err) {
          return reject(err);
        }

        debug(`Data is: ${JSON.stringify(data, null, 3)}`);

        const invalid = data.entries.reduce((invalid, entry) => {
          if (!entry.isSuccess) {
            invalid.push(entry.emailAddress);
          }

          return invalid;
        }, []);

        emails = difference(emails, invalid);
        resolve(emails);
      }
    });
  });
}

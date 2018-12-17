/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file at
 * https://github.com/facebookincubator/create-react-app/blob/master/LICENSE
 */

import url from 'url';
import chalk from 'chalk';
const address = require('address');

export function prepareUrls(protocol: string, host: string, port: string, pathname = '/') {
  const formatUrl = (hostname: string) =>
    url.format({
      protocol,
      hostname,
      port,
      pathname,
    });
  const prettyPrintUrl = (hostname: string) =>
    url.format({
      protocol,
      hostname,
      port: chalk.bold(port),
      pathname,
    });

  const isUnspecifiedHost = host === '0.0.0.0' || host === '::';

  let prettyHost: string;
  let lanUrlForConfig: string | undefined;
  let lanUrlForTerminal = chalk.gray('unavailable');
  if (isUnspecifiedHost) {
    prettyHost = 'localhost';
    try {
      // This can only return an IPv4 address
      lanUrlForConfig = address.ip();
      if (lanUrlForConfig) {
        // Check if the address is a private ip
        // https://en.wikipedia.org/wiki/Private_network#Private_IPv4_address_spaces
        if (/^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(lanUrlForConfig)) {
          // Address is private, format it for later use
          lanUrlForTerminal = prettyPrintUrl(lanUrlForConfig);
        } else {
          // Address is not private, so we will discard it
          lanUrlForConfig = undefined;
        }
      }
    } catch (_) {
      // ignored
    }
  } else {
    prettyHost = host;
    lanUrlForConfig = host;
    lanUrlForTerminal = prettyPrintUrl(lanUrlForConfig);
  }
  const localUrlForTerminal = prettyPrintUrl(prettyHost);
  const localUrlForBrowser = formatUrl(prettyHost);
  return {
    lanUrlForConfig,
    lanUrlForTerminal,
    localUrlForTerminal,
    localUrlForBrowser,
  };
}

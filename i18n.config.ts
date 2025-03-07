import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({locale}) => ({
  messages: (await import(`./messages/${locale}.json`)).default,
  timeZone: 'America/New_York',
  now: new Date()
}));

// Public Turnstile sitekey. The server secret is supplied only at version upload.
export const contactSitekey = "0x4AAAAAAGOM9h9tAXIuKUKF";
export const contactOrigin = 'https://kenshi.wiki';
export function contactSettings(env={}) {
  if(env.WIKI_CONTACT_SIMULATION||env.WIKI_CONTACT_MODE==='simulation'||env.PUBLIC_CONTACT_SIMULATION)throw Error('Contact simulation is local-only');
  if(env.WIKI_CONTACT_ENABLED&&!['true','false'].includes(env.WIKI_CONTACT_ENABLED))throw Error('Invalid contact enable setting');
  const enabled=env.WIKI_CONTACT_ENABLED ? env.WIKI_CONTACT_ENABLED==='true' : env.WIKI_RELEASE_TARGET==='production';
  const sitekey=(env.PUBLIC_TURNSTILE_SITE_KEY??contactSitekey).trim();
  if(sitekey&&(!/^0x[A-Za-z0-9_-]+$/.test(sitekey)||/^[123]x0/.test(sitekey)))throw Error('Only a real Turnstile sitekey can be packaged');
  if(enabled&&!sitekey)throw Error('Live intake requires a production Turnstile sitekey');
  return {enabled,sitekey:enabled?sitekey:'',origin:contactOrigin};
}

export const CONTACT_RECIPIENT = 'admin@kenshi.wiki';
export const CONTACT_SENDER = 'forms@kenshi.wiki';
export const CONTACT_ENDPOINT = '/api/contact';
export const MAX_BODY_BYTES = 64 * 1024;
export const fields = {name:100,email:254,affected:4000,message:10000,token:2048,website:200};
export const forms = {
  general: {action:'wiki_contact',topics:{question:'General question',correction:'Correction',contribution:'Proposed contribution'}},
  copyright: {action:'wiki_copyright',topics:{copyright:'Copyright concern',permission:'Permission information',removal:'Removal request'}}
};

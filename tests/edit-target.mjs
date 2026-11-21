import assert from 'node:assert/strict';
import {editableSource} from '../src/lib/page-source.mjs';
export const editBranch=process.env.WIKI_EDIT_BRANCH?.trim()||'';
export function expectEditable($,file) {
  if(editBranch){assert.equal($('.wide-tools a').last().attr('href'),editableSource(file,editBranch).url);assert.equal($('.edit-file').length,0);}
  else assert.equal($('.edit-file code').first().text(),file);
}

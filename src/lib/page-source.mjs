export const repo = 'https://github.com/mattresspad/kenshi-wiki';

export const moddingPortalFiles = {editableFile: 'src/data/modding.json', sourceFile: 'src/data/portals/modding.yaml'};

function gitPath(path) {
  return path.split('/').map(encodeURIComponent).join('/');
}

export function recordedSource(file, revision, historyRevision = revision) {
  const at = gitPath(revision) + '/' + gitPath(file);
  return {markdown: repo + '/blob/' + at, history: repo + '/commits/' + gitPath(historyRevision) + '/' + gitPath(file)};
}

export function correctionLink(canonicalUrl) {
  const link = new URL(repo + '/issues/new');
  link.search = new URLSearchParams({template:'article-correction.yml', article:canonicalUrl}).toString();
  return link.href;
}

export function editableSource(file, branch) {
  return {file, url: branch ? repo + '/edit/' + gitPath(branch) + '/' + gitPath(file) : null};
}

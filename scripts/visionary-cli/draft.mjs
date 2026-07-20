import { readFile } from 'node:fs/promises';
import { getCurrentUser, getResolvedBaseUrl, request } from './api.mjs';
import { normalizeTags, output, parseTags, requireOption, stripLeadingH1 } from './shared.mjs';

export async function handleDraftCommand(subcommand, options) {
  if (subcommand === 'create') return createDraft(options);
  if (subcommand === 'get') return getDraft(options);
  if (subcommand === 'update') return updateDraft(options);
  if (subcommand === 'publish') return publishDraft(options);
  throw new Error(`Unknown draft subcommand: ${subcommand}`);
}

async function readDraft(options, id) {
  const response = await request(`/api/drafts/${Number(id)}`, options, { method: 'GET' });

  if (response?.ok !== true) {
    throw new Error(response?.error?.message || 'Failed to read draft.');
  }

  return response.data;
}

async function saveDraft(options, draft) {
  const isNewDraft = draft.draftId === 'new';
  const response = await request(isNewDraft ? '/api/drafts' : `/api/drafts/${Number(draft.draftId)}`, options, {
    method: isNewDraft ? 'POST' : 'PATCH',
    body: JSON.stringify(draft),
  });

  if (response?.ok !== true) {
    throw new Error(response?.error?.message || 'Failed to save draft.');
  }

  return response.data;
}

async function publishDraftRequest(options, draftId) {
  const response = await request(`/api/drafts/${Number(draftId)}/publish`, options, {
    method: 'POST',
  });

  if (response?.ok !== true) {
    throw new Error(response?.error?.message || 'Failed to publish draft.');
  }

  return response.data;
}

async function loadContent(options, existingContent = '') {
  if (!options.contentFile) return existingContent;
  const content = await readFile(options.contentFile, 'utf8');
  return options.keepTitle ? content : stripLeadingH1(content);
}

async function createDraft(options) {
  const title = requireOption(options, 'title');
  requireOption(options, 'contentFile');

  const [user, content] = await Promise.all([
    getCurrentUser(options),
    loadContent(options),
  ]);

  const data = await saveDraft(options, {
    draftId: 'new',
    title,
    content,
    summary: options.summary || '',
    tags: parseTags(options.tags),
    author_id: user.id,
    author_nickname: user.nick_name,
    cover: options.cover || '',
  });

  const draftId = data?.insertId;
  output({
    success: true,
    action: 'draft.create',
    draftId,
    editUrl: draftId ? `${getResolvedBaseUrl()}/editor/draft/v2/${draftId}` : undefined,
    data,
  });
}

async function getDraft(options) {
  const id = requireOption(options, 'id');
  const draft = await readDraft(options, id);
  output({ success: true, action: 'draft.get', draft });
}

async function updateDraft(options) {
  const id = requireOption(options, 'id');
  const existingDraft = await readDraft(options, id);
  const content = await loadContent(options, existingDraft.content || '');

  const data = await saveDraft(options, {
    draftId: Number(id),
    title: options.title ?? existingDraft.title ?? '',
    content,
    summary: options.summary ?? existingDraft.summary ?? '',
    tags: parseTags(options.tags, existingDraft.tags),
    author_id: existingDraft.author_id,
    author_nickname: existingDraft.author_nickname,
    cover: options.cover ?? existingDraft.cover ?? '',
  });

  output({
    success: true,
    action: 'draft.update',
    draftId: Number(id),
    editUrl: `${getResolvedBaseUrl()}/editor/draft/v2/${id}`,
    data,
  });
}

async function publishDraft(options) {
  if (!options.confirm) {
    throw new Error('Publishing requires --confirm to avoid accidental release.');
  }

  const id = requireOption(options, 'id');
  const draft = await readDraft(options, id);
  validatePublishableDraft(draft);

  const data = await publishDraftRequest(options, id);
  const articleId = data?.article_id;

  output({
    success: true,
    action: 'draft.publish',
    draftId: data?.draft_id ?? Number(id),
    reviewId: data?.review_id,
    articleId,
    articleUrl: articleId ? `${getResolvedBaseUrl()}/reader/${articleId}` : undefined,
    note: 'The backend marks the article published after its async review step completes.',
    data,
  });
}

function validatePublishableDraft(draft) {
  const missing = [];
  if (!draft.title) missing.push('title');
  if (!draft.content) missing.push('content');
  if (!draft.summary) missing.push('summary');
  if (!normalizeTags(draft.tags).length) missing.push('tags');

  if (missing.length) {
    throw new Error(`Draft is not publishable. Missing: ${missing.join(', ')}.`);
  }
}

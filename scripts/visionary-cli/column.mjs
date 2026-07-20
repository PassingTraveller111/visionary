import { getCurrentUser, getResolvedBaseUrl, request, uploadFileRequest } from './api.mjs';
import { output, parseIds, requireOption } from './shared.mjs';

export async function handleColumnCommand(subcommand, options) {
  if (subcommand === 'list') return listColumns(options);
  if (subcommand === 'get') return getColumn(options);
  if (subcommand === 'create') return createColumn(options);
  if (subcommand === 'update') return updateColumn(options);
  if (subcommand === 'delete') return deleteColumn(options);
  if (subcommand === 'articles') return getColumnArticles(options);
  if (subcommand === 'set-articles') return setColumnArticles(options);
  if (subcommand === 'candidates') return getColumnCandidates(options);
  if (subcommand === 'cover-upload') return uploadColumnCover(options);
  throw new Error(`Unknown column subcommand: ${subcommand}`);
}

async function readColumns(options, userId) {
  const response = await request(`/api/users/${Number(userId)}/columns`, options, { method: 'GET' });

  if (response?.ok !== true) {
    throw new Error(response?.error?.message || 'Failed to read columns.');
  }

  return response.data;
}

async function readColumn(options, id) {
  const response = await request(`/api/columns/${Number(id)}`, options, { method: 'GET' });

  if (response?.ok !== true) {
    throw new Error(response?.error?.message || 'Failed to read column.');
  }

  return response.data;
}

async function saveColumn(options, column) {
  const isNewColumn = column.column_id === undefined;
  const response = await request(isNewColumn ? '/api/columns' : `/api/columns/${Number(column.column_id)}`, options, {
    method: isNewColumn ? 'POST' : 'PATCH',
    body: JSON.stringify(column),
  });

  if (response?.ok !== true) {
    throw new Error(response?.error?.message || 'Failed to save column.');
  }

  return response.data;
}

async function deleteColumnRequest(options, id) {
  const response = await request(`/api/columns/${Number(id)}`, options, { method: 'DELETE' });

  if (response?.ok !== true) {
    throw new Error(response?.error?.message || 'Failed to delete column.');
  }

  return response.data;
}

async function readColumnArticles(options, id) {
  const response = await request(`/api/columns/${Number(id)}/articles`, options, { method: 'GET' });

  if (response?.ok !== true) {
    throw new Error(response?.error?.message || 'Failed to read column articles.');
  }

  return response.data;
}

async function updateColumnArticles(options, id, articleIds) {
  const response = await request(`/api/columns/${Number(id)}/articles`, options, {
    method: 'PUT',
    body: JSON.stringify({ article_ids: articleIds }),
  });

  if (response?.ok !== true) {
    throw new Error(response?.error?.message || 'Failed to update column articles.');
  }

  return response.data;
}

async function readColumnCandidates(options) {
  const response = await request('/api/articles/column-candidates', options, { method: 'GET' });

  if (response?.ok !== true) {
    throw new Error(response?.error?.message || 'Failed to read column candidate articles.');
  }

  return response.data;
}

async function listColumns(options) {
  const userId = options.userId || (await getCurrentUser(options)).id;
  const columns = await readColumns(options, userId);
  output({ success: true, action: 'column.list', userId: Number(userId), columns });
}

async function getColumn(options) {
  const id = requireOption(options, 'id');
  const [column, articles] = await Promise.all([
    readColumn(options, id),
    readColumnArticles(options, id),
  ]);

  output({
    success: true,
    action: 'column.get',
    column,
    articles,
    columnUrl: `${getResolvedBaseUrl()}/userCenter/Columns/${id}`,
    manageUrl: `${getResolvedBaseUrl()}/creator/content/columns/manage/${id}`,
  });
}

async function createColumn(options) {
  const name = requireOption(options, 'name');
  const description = requireOption(options, 'description');

  const data = await saveColumn(options, {
    column_name: name,
    description,
    ...(options.cover ? { cover_image: options.cover } : {}),
  });

  const columnId = data?.insertId;
  output({
    success: true,
    action: 'column.create',
    columnId,
    columnUrl: columnId ? `${getResolvedBaseUrl()}/userCenter/Columns/${columnId}` : undefined,
    manageUrl: columnId ? `${getResolvedBaseUrl()}/creator/content/columns/manage/${columnId}` : undefined,
    data,
  });
}

async function updateColumn(options) {
  const id = requireOption(options, 'id');
  const existingColumn = await readColumn(options, id);

  const data = await saveColumn(options, {
    column_id: Number(id),
    column_name: options.name ?? existingColumn.column_name ?? '',
    description: options.description ?? existingColumn.description ?? '',
    cover_image: options.cover ?? existingColumn.cover_image ?? '',
  });

  output({
    success: true,
    action: 'column.update',
    columnId: Number(id),
    columnUrl: `${getResolvedBaseUrl()}/userCenter/Columns/${id}`,
    manageUrl: `${getResolvedBaseUrl()}/creator/content/columns/manage/${id}`,
    data,
  });
}

async function deleteColumn(options) {
  if (!options.confirm) {
    throw new Error('Deleting a column requires --confirm to avoid accidental removal.');
  }

  const id = requireOption(options, 'id');
  const data = await deleteColumnRequest(options, id);
  output({ success: true, action: 'column.delete', columnId: Number(id), data });
}

async function getColumnArticles(options) {
  const id = requireOption(options, 'id');
  const articles = await readColumnArticles(options, id);
  output({ success: true, action: 'column.articles', columnId: Number(id), articles });
}

async function setColumnArticles(options) {
  const id = requireOption(options, 'id');
  if (options.articleIds === undefined) throw new Error('Missing required option --article-ids');
  const articleIds = parseIds(options.articleIds);
  const data = await updateColumnArticles(options, id, articleIds);
  output({ success: true, action: 'column.set-articles', columnId: Number(id), articleIds, data });
}

async function getColumnCandidates(options) {
  const articles = await readColumnCandidates(options);
  output({ success: true, action: 'column.candidates', articles });
}

async function uploadColumnCover(options) {
  const filePath = requireOption(options, 'file');
  const data = await uploadFileRequest(options, '/api/columns/cover', filePath);
  output({
    success: true,
    action: 'column.cover-upload',
    cover: data?.Location ? `https://${data.Location}` : undefined,
    data,
  });
}

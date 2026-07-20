import { getCurrentUser, getResolvedBaseUrl, request, uploadFileRequest } from './api.mjs';
import { buildQuery, output, parseIntegerOption, requireOption } from './shared.mjs';

export async function handleArticleCommand(subcommand, options) {
  if (subcommand === 'list') return listArticles(options);
  if (subcommand === 'public-list') return listPublishedArticles(options);
  if (subcommand === 'search') return searchArticles(options);
  if (subcommand === 'get') return getArticle(options);
  if (subcommand === 'delete') return deleteArticle(options);
  if (subcommand === 'cover-upload') return uploadArticleCover(options);
  if (subcommand === 'image-upload') return uploadArticleImage(options);
  throw new Error(`Unknown article subcommand: ${subcommand}`);
}

async function readUserArticles(options, userId) {
  const response = await request(`/api/users/${Number(userId)}/articles`, options, { method: 'GET' });

  if (response?.ok !== true) {
    throw new Error(response?.error?.message || 'Failed to read user articles.');
  }

  return response.data;
}

async function readPublishedArticles(options) {
  const pageNum = parseIntegerOption(options, 'pageNum', 0);
  const pageSize = parseIntegerOption(options, 'pageSize', 8);
  const sort = options.sort || 'new';
  const response = await request(`/api/articles${buildQuery({ pageNum, pageSize, sort })}`, options, { method: 'GET' });

  if (response?.ok !== true) {
    throw new Error(response?.error?.message || 'Failed to read published articles.');
  }

  return response.data;
}

async function searchArticlesRequest(options) {
  const keyword = requireOption(options, 'keyword');
  const pageNum = parseIntegerOption(options, 'pageNum', 0);
  const pageSize = parseIntegerOption(options, 'pageSize', 8);
  const response = await request(`/api/articles${buildQuery({ keyword, pageNum, pageSize })}`, options, { method: 'GET' });

  if (response?.ok !== true) {
    throw new Error(response?.error?.message || 'Failed to search articles.');
  }

  return response.data;
}

async function readArticle(options, id) {
  const response = await request(`/api/articles/${Number(id)}`, options, { method: 'GET' });

  if (response?.ok !== true) {
    throw new Error(response?.error?.message || 'Failed to read article.');
  }

  return response.data;
}

async function deleteArticleRequest(options, id) {
  const response = await request(`/api/articles/${Number(id)}`, options, { method: 'DELETE' });

  if (response?.ok !== true) {
    throw new Error(response?.error?.message || 'Failed to delete article.');
  }

  return response.data;
}

async function listArticles(options) {
  const userId = options.userId || (await getCurrentUser(options)).id;
  const limit = parseIntegerOption(options, 'limit', 0);
  let articles = await readUserArticles(options, userId);

  if (options.publishedOnly) {
    articles = articles.filter((article) => article.is_published === 1);
  }

  if (limit > 0) {
    articles = articles.slice(0, limit);
  }

  output({ success: true, action: 'article.list', userId: Number(userId), count: articles.length, articles });
}

async function listPublishedArticles(options) {
  const data = await readPublishedArticles(options);
  output({ success: true, action: 'article.public-list', ...data });
}

async function searchArticles(options) {
  const data = await searchArticlesRequest(options);
  output({ success: true, action: 'article.search', keyword: options.keyword, ...data });
}

async function getArticle(options) {
  const id = requireOption(options, 'id');
  const article = await readArticle(options, id);
  output({
    success: true,
    action: 'article.get',
    article,
    articleUrl: `${getResolvedBaseUrl()}/reader/${id}`,
  });
}

async function deleteArticle(options) {
  if (!options.confirm) {
    throw new Error('Deleting an article requires --confirm to avoid accidental removal.');
  }

  const id = requireOption(options, 'id');
  const data = await deleteArticleRequest(options, id);
  output({ success: true, action: 'article.delete', articleId: Number(id), data });
}

async function uploadArticleCover(options) {
  const filePath = requireOption(options, 'file');
  const data = await uploadFileRequest(options, '/api/articles/cover', filePath);
  output({
    success: true,
    action: 'article.cover-upload',
    cover: data?.Location ? `https://${data.Location}` : undefined,
    data,
  });
}

async function uploadArticleImage(options) {
  const filePath = requireOption(options, 'file');
  const data = await uploadFileRequest(options, '/api/articles/images', filePath);
  output({
    success: true,
    action: 'article.image-upload',
    image: data?.Location ? `https://${data.Location}` : undefined,
    data,
  });
}

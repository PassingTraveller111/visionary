CREATE INDEX idx_articles_public_updated
    ON articles (is_published, view_permission, updated_time, id);

CREATE INDEX idx_article_likes_article_id
    ON article_likes (article_id);

CREATE INDEX idx_article_reading_records_article_id
    ON article_reading_records (article_id);

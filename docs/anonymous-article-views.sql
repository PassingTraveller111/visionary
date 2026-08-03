ALTER TABLE article_reading_records
    MODIFY COLUMN user_id INT NULL,
    ADD COLUMN visitor_id CHAR(64) NULL AFTER user_id;

CREATE INDEX idx_article_reading_records_anonymous
    ON article_reading_records (article_id, visitor_id, read_time);

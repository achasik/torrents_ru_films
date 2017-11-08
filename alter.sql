ALTER TABLE films ADD tmdb INT;
ALTER TABLE films ADD tmdb_poster TEXT;
CREATE INDEX tmdbIdx ON films (tmdb);
DELETE FROM notfound;
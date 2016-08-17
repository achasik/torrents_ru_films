DROP TABLE IF EXISTS  data;
DROP TABLE IF EXISTS  torrents;
DROP TABLE IF EXISTS  films;
DROP TABLE IF EXISTS  feeds;
DROP TABLE IF EXISTS  trackers;

CREATE TABLE trackers(
	id INTEGER PRIMARY KEY,
	name TEXT NOT NULL,
	active INTEGER DEFAULT 1
);

CREATE TABLE feeds(
	id INTEGER PRIMARY KEY,
    trackerId  INTEGER NOT NULL,
	name TEXT NOT NULL,
	url  TEXT NOT NULL,
	active INTEGER DEFAULT 1,
	updated INTEGER,
	FOREIGN KEY(trackerId) REFERENCES trackers(id)
);
CREATE TABLE films(
	id INTEGER NOT NULL,
	name TEXT,
	nameRu TEXT,
	year INTEGER NOT NULL,
	desc TEXT,
	updated INTEGER,
	PRIMARY KEY (id)
);
CREATE INDEX nameIndex ON films (name, year);
CREATE INDEX nameRuIndex ON films (nameRu, year);

CREATE TABLE torrents(
	trackerId  INTEGER NOT NULL,
	id INTEGER NOT NULL,
	kinopoisk INTEGER NOT NULL,
	title TEXT NOT NULL,
	url  TEXT NOT NULL,
	magnet TEXT NOT NULL,
	description TEXT,
	PRIMARY KEY (trackerId, id),
	FOREIGN KEY(trackerId) REFERENCES trackers(id),
	FOREIGN KEY(kinopoisk) REFERENCES films(id)
);

INSERT INTO trackers(name, active)  VALUES ('Rutracker',1),('RuTor',1),('Kinozal',1);
INSERT INTO feeds(trackerId,name,url, active) VALUES (1,'Классика мирового кинематографа','http://feed.rutracker.cc/atom/f/187.atom',1);
INSERT INTO feeds(trackerId,name,url, active) VALUES (1,'Фильмы 2016','http://feed.rutracker.cc/atom/f/2200.atom',1);

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

INSERT INTO trackers(name, active)  VALUES ('Rutracker',1),('RuTor',1),('Kinozal',1);
INSERT INTO feeds(trackerId,name,url, active) VALUES (1,'Классика мирового кинематографа','http://feed.rutracker.cc/atom/f/187.atom',1);
INSERT INTO feeds(trackerId,name,url, active) VALUES (1,'Фильмы 2016','http://feed.rutracker.cc/atom/f/2200.atom',1);

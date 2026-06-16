TRUNCATE alerts, sightings, pets, profiles, users RESTART IDENTITY CASCADE;

INSERT INTO users (username, password)
VALUES
  ('testuser1', '$2b$10$dH3GSlYRo38HGzbAS1kf.OxU3JGOq9DeXH8b2a3zQz1gsL/Bjraiq'),
  ('testuser2', '$2b$10$dH3GSlYRo38HGzbAS1kf.OxU3JGOq9DeXH8b2a3zQz1gsL/Bjraiq')
ON CONFLICT DO NOTHING;

INSERT INTO pets (users_id, name, species, breed, colour, description, last_seen_location, lat, lng, status)
VALUES
  (1, 'Fluffy', 'cat', 'Persian', 'white', 'fluffy white cat', 'London', 51.5074, -0.1278, 'lost'),
  (2, 'Rex', 'dog', 'Labrador', 'black', 'big black dog', 'Manchester', 53.4808, -2.2426, 'lost')
ON CONFLICT DO NOTHING;

INSERT INTO sightings (pets_id, users_id, sighting_description, location_description, lat, lng)
VALUES
  (1, 2, 'Saw a white cat near the park', 'Hyde Park', 51.5074, -0.1278);
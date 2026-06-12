DROP TABLE IF EXISTS alerts;
DROP TABLE IF EXISTS sightings;
DROP TABLE IF EXISTS pets;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    users_id INT GENERATED ALWAYS AS IDENTITY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (users_id)
);

CREATE TABLE profiles (
    profiles_id INT GENERATED ALWAYS AS IDENTITY,
    users_id INT NOT NULL,
    full_name VARCHAR(150),
    phone VARCHAR(30),
    postcode VARCHAR(20),
    lat DECIMAL(9,6),
    lng DECIMAL(9,6),
    alert_radius INT DEFAULT 5000,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (profiles_id),
    FOREIGN KEY (users_id) REFERENCES users(users_id)
);

CREATE TABLE pets (
    pets_id INT GENERATED ALWAYS AS IDENTITY,
    users_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    species VARCHAR(50) NOT NULL,
    breed VARCHAR(100),
    colour VARCHAR(100),
    description TEXT,
    last_seen_location TEXT,
    lat DECIMAL(9,6) NOT NULL,
    lng DECIMAL(9,6) NOT NULL,
    image_url TEXT,
    status VARCHAR(20) DEFAULT 'lost',
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (pets_id),
    FOREIGN KEY (users_id) REFERENCES users(users_id)
);

CREATE TABLE sightings (
    sightings_id INT GENERATED ALWAYS AS IDENTITY,
    pets_id INT,
    users_id INT,
    guest_contact TEXT,
    sighting_description TEXT NOT NULL,
    location_description TEXT,
    lat DECIMAL(9,6) NOT NULL,
    lng DECIMAL(9,6) NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (sightings_id),
    FOREIGN KEY (pets_id) REFERENCES pets(pets_id),
    FOREIGN KEY (users_id) REFERENCES users(users_id)
);

CREATE TABLE alerts (
    alerts_id INT GENERATED ALWAYS AS IDENTITY,
    users_id INT NOT NULL,
    pets_id INT NOT NULL,
    radius INT,
    postcode VARCHAR(20),
    lat DECIMAL(9,6),
    lng DECIMAL(9,6),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (alerts_id),
    FOREIGN KEY (pets_id) REFERENCES pets(pets_id),
    FOREIGN KEY (users_id) REFERENCES users(users_id)
);

-- Users (passwords are bcrypt hashed version of 'password123')
INSERT INTO users (username, password) VALUES
('sarah_jones', '$2b$10$rK8ZX5vQmN3pL9wE2hY4OeJ6fGdA1bC7kM0nP5qR8sT3uV6xW9yZ2'),
('mike_chen', '$2b$10$aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ5aB6cD7eF8gH9iJ'),
('emma_wilson', '$2b$10$xY9zA8bC7dE6fG5hI4jK3lM2nO1pQ0rS9tU8vW7xY6zA5bC4dE3fG'),
('james_taylor', '$2b$10$mN7oP8qR9sT0uV1wX2yZ3aB4cD5eF6gH7iJ8kL9mN0oP1qR2sT3uV'),
('lisa_brown', '$2b$10$gH1iJ2kL3mN4oP5qR6sT7uV8wX9yZ0aB1cD2eF3gH4iJ5kL6mN7oP');

-- Profiles
INSERT INTO profiles (users_id, full_name, phone, postcode, lat, lng, alert_radius) VALUES
(1, 'Sarah Jones', '07700900123', 'N4 3AB', 51.566691, -0.119936, 3000),
(2, 'Mike Chen', '07700900456', 'SW3 4CD', 51.487811, -0.169140, 5000),
(3, 'Emma Wilson', '07700900789', 'E1 6EF', 51.515419, -0.072640, 2000),
(4, 'James Taylor', '07700900321', 'SE1 7GH', 51.503300, -0.086700, 4000),
(5, 'Lisa Brown', '07700900654', 'W1T 8IJ', 51.520700, -0.135600, 5000);

-- Pets (mix of lost and reunited, various London areas)
INSERT INTO pets (users_id, name, species, breed, colour, description, last_seen_location, lat, lng, image_url, status) VALUES

-- Sarah's pets
(1, 'Luna', 'Cat', 'Domestic Shorthair', 'Black', 
'Small black cat with a white patch on her chest. Very friendly but gets scared easily. Wearing a red collar with a bell.', 
'Thorpedale Road, near the park entrance', 
51.566691, -0.119936,
'https://images.unsplash.com/photo-1760488923118-8e84ffb53c3b?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
'lost'),

(1, 'Mochi', 'Cat', 'Ragdoll', 'Grey and white',
'Large fluffy grey and white cat. Very docile and will likely approach people. No collar.',
'Stroud Green Road',
51.569500, -0.115200,
'https://images.unsplash.com/photo-1625708699050-03f79a63c979?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHJhZ2RvbGwlMjBjYXR8ZW58MHx8MHx8fDA%3D',
'reunited'),

-- Mike's pets
(2, 'Buddy', 'Dog', 'Golden Retriever', 'Golden',
'Large golden retriever, very friendly and energetic. Responds to Buddy. Wearing a blue collar with contact details.',
'Chelsea Embankment near Albert Bridge',
51.487811, -0.169140,
'https://images.unsplash.com/photo-1734966213753-1b361564bab4?q=80&w=1242&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
'lost'),

(2, 'Pepper', 'Dog', 'Jack Russell Terrier', 'White and brown',
'Small white and brown Jack Russell. Very fast runner. Has a green collar.',
'Battersea Park near the bandstand',
51.479500, -0.156700,
'https://images.unsplash.com/photo-1599908758973-b02eb044e5ab?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8amFjayUyMHJ1c3NlbGwlMjB3aXRoJTIwY29sbGFyfGVufDB8fDB8fHww',
'lost'),

-- Emma's pets
(3, 'Noodle', 'Cat', 'Siamese', 'Cream and brown',
'Siamese cat with dark face and ears. Very vocal, will meow loudly. Microchipped.',
'Whitechapel Road near the market',
51.515419, -0.072640,
'https://images.unsplash.com/photo-1568152950566-c1bf43f4ab28?q=80&w=765&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
'lost'),

-- James's pets
(4, 'Bear', 'Dog', 'Labrador', 'Chocolate brown',
'Large chocolate lab, very friendly. Wearing a red collar. Responds to Bear.',
'Borough Market area',
51.505600, -0.091200,
'https://images.unsplash.com/photo-1676545698080-4e4a62be107b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
'lost'),

(4, 'Willow', 'Cat', 'Persian', 'White',
'White Persian cat with blue eyes. Very distinctive. Usually stays close to home.',
'Bermondsey Street',
51.499800, -0.081500,
NULL,
'reunited'),

-- Lisa's pets
(5, 'Ziggy', 'Dog', 'Border Collie', 'Black and white',
'Black and white border collie, extremely intelligent and active. Missing collar.',
'Fitzrovia near BT Tower',
51.521200, -0.138900,
'https://images.unsplash.com/photo-1577928639586-ed3cc71579d3?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzJ8fGJvcmRlciUyMGNvbGxpZXxlbnwwfHwwfHx8MA%3D%3D',
'lost'),

(5, 'Cleo', 'Cat', 'Tabby', 'Orange tabby',
'Orange tabby with distinctive striped markings. Very friendly with strangers.',
'Great Portland Street area',
51.522400, -0.143600,
'https://images.unsplash.com/photo-1593483316242-efb5420596ca?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8b3JhbmdlJTIwdGFiYnklMjBjYXR8ZW58MHx8MHx8fDA%3D',
'lost');

-- Sightings
INSERT INTO sightings (pets_id, users_id, guest_contact, sighting_description, location_description, lat, lng, image_url) VALUES

-- Sightings of Luna (pets_id: 1)
(1, 2, NULL,
'Spotted a small black cat near the basketball courts. She ran away when I approached but definitely had a red collar.',
'Finsbury Park near the basketball courts',
51.565200, -0.117800,
NULL),

(1, NULL, 'neighbour@email.com',
'saw this cat in my garden last night around 11pm. She was eating food I left out for foxes.',
'Garden on Tollington Park',
51.567400, -0.118600,
'https://images.unsplash.com/photo-1770941979972-6e953f2856f4?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmxhY2slMjBjYXQlMjBvdXRzaWRlJTIwYXQlMjBuaWdodHxlbnwwfHwwfHx8MA%3D%3D'),

-- Sightings of Buddy (pets_id: 3)
(3, 3, NULL,
'Saw a golden retriever running loose near the river. He seemed friendly and was wagging his tail. Tried to catch him but he ran off towards the bridge.',
'Chelsea Embankment near Cheyne Walk',
51.486900, -0.171200,
NULL),

(3, NULL, 'dogwalker_chelsea@gmail.com',
'Golden retriever spotted in the gardens, no owner in sight. He was playing with other dogs. Very friendly.',
'Chelsea Physic Garden area',
51.484600, -0.167800,
'https://images.unsplash.com/photo-1714247084434-49bbc3ebf577?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z29sZGVuJTIwcmV0cmlldmVyJTIwcGFya3xlbnwwfHwwfHx8MA%3D%3D'),

-- Sightings of Pepper (pets_id: 4)
(4, 1, NULL,
'Small white and brown terrier spotted near the cafe. Looked well but was alone.',
'Battersea Park cafe near the lake',
51.480200, -0.155400,
NULL),

-- Sightings of Noodle (pets_id: 5)
(5, 4, NULL,
'Heard a very loud meowing coming from behind some bins. Looked in and saw what I think is this cat. She looked scared and ran when I got close.',
'Vallance Road near the junction',
51.516800, -0.069300,
NULL),

(5, NULL, 'east_london_cats@outlook.com',
'Found a Siamese cat wandering outside our shop. Very vocal. We gave her some water and she stayed for about an hour then disappeared.',
'Commercial Road',
51.513200, -0.071600,
NULL),

-- Sightings of Bear (pets_id: 6)
(6, 5, NULL,
'Large brown lab spotted near the market, no owner visible. He was sniffing around the food stalls. Very friendly when approached.',
'Borough Market entrance on Stoney Street',
51.505100, -0.090800,
NULL),

-- Sightings of Ziggy (pets_id: 8)
(8, 2, NULL,
'Black and white collie spotted running along the street at speed. Looked like he knew where he was going! Yellow collar visible.',
'Euston Road near Warren Street station',
51.524600, -0.139200,
NULL),

-- Sightings of Cleo (pets_id: 9)
(9, 3, NULL,
'Orange tabby cat sitting on a garden wall looking very comfortable. Came over for a stroke. No collar but very friendly.',
'Riding House Street',
51.521800, -0.141300,
NULL),

(9, NULL, 'w1_resident@hotmail.com',
'This cat has been coming to our back door for the past two mornings. We have been giving her a little food. She seems healthy.',
'Nassau Street area',
51.522100, -0.142700,
'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400');


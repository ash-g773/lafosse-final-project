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
    pets_id INT NOT NULL,
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
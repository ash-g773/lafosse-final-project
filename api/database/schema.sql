DROP TABLE IF EXISTS alerts;
DROP TABLE IF EXISTS sightings;
DROP TABLE IF EXISTS pets;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT GENERATED ALWAYS AS IDENTITY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (id)
);

CREATE TABLE profiles (
    id INT GENERATED ALWAYS AS IDENTITY,
    user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(150),
    phone VARCHAR(30),
    postcode VARCHAR(20),
    lat DECIMAL(9,6),
    lng DECIMAL(9,6),
    alert_radius INT DEFAULT 5000,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (id)
);

CREATE TABLE pets (
    id INT GENERATED ALWAYS AS IDENTITY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
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
    PRIMARY KEY (id)
);

CREATE TABLE sightings (
    id INT GENERATED ALWAYS AS IDENTITY,
    pet_id INT REFERENCES pets(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    guest_contact TEXT,
    description TEXT NOT NULL,
    location_description TEXT,
    lat DECIMAL(9,6) NOT NULL,
    lng DECIMAL(9,6) NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (id)
);

CREATE TABLE alerts (
    id INT GENERATED ALWAYS AS IDENTITY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    pet_id INT REFERENCES pets(id) ON DELETE CASCADE,
    radius INT,
    postcode VARCHAR(20),
    lat DECIMAL(9,6),
    lng DECIMAL(9,6),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (id)
);
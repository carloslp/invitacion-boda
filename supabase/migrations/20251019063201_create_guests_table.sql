/*
  # Wedding Guests Table

  1. New Tables
    - `guests`
      - `id` (uuid, primary key) - Unique identifier for each guest
      - `hash` (text, unique, not null) - MD5 hash used in invitation URLs
      - `name` (text, not null) - Full name of the guest or family
      - `confirmed` (boolean, default false) - RSVP confirmation status
      - `confirmed_at` (timestamptz, nullable) - Timestamp of confirmation
      - `created_at` (timestamptz, default now()) - Record creation timestamp

  2. Security
    - Enable RLS on `guests` table
    - Add policy for public read access (guests need to see their names)
    - No write policies needed as confirmations will be handled via external API

  3. Important Notes
    - The hash field stores MD5 hashes that uniquely identify each guest
    - Public read access is allowed as this data is not sensitive
    - The confirmed field tracks RSVP status
*/

CREATE TABLE IF NOT EXISTS guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hash text UNIQUE NOT NULL,
  name text NOT NULL,
  confirmed boolean DEFAULT false,
  confirmed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to guests"
  ON guests
  FOR SELECT
  TO anon
  USING (true);

-- Create an index on the hash field for faster lookups
CREATE INDEX IF NOT EXISTS idx_guests_hash ON guests(hash);
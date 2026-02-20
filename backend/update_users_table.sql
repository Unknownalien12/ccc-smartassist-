-- SQL Migration Script to update the users table
-- Run this if you already have the system installed and want to add the new profile fields.
USE ccc_smartassist;
ALTER TABLE users
ADD COLUMN email VARCHAR(100)
AFTER full_name,
    ADD COLUMN student_id VARCHAR(50)
AFTER email,
    ADD COLUMN course VARCHAR(100)
AFTER student_id,
    ADD COLUMN year_level VARCHAR(20)
AFTER course;
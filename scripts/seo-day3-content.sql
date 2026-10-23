-- Day-three copy, checked against the manuscript and existing Chapter 1 sample.
-- Backup: ../seo-day3-2026-10-24/content-before.json (public content only).
-- Targeted update; no lead, access, retailer, or biography changes.
UPDATE books
SET synopsis = 'How To Have a Financial Heart Attack follows Lamont D. McLeod from a ten-dollar childhood allowance to payday spending and work in debt collection. He looks back at choices he repeated and advice he struggled to put into practice.

The story moves through early jobs, borrowed money, a move to Atlanta, and conversations with a colleague named Craig. McLeod describes earning more while still spending what came in. Learning about money gives him questions to work through, but changing his habits takes more than knowing the answers.

Its fifteen short chapters focus on personal experiences and reflection. Read the opening chapter to decide whether McLeod’s direct, conversational style is for you.',
    updated_at = '2026-10-23T20:06:34Z'
WHERE slug = 'how-to-have-a-financial-heart-attack';

-- The author page now has a revised introduction, book section and reading links.
UPDATE authors
SET updated_at = '2026-10-23T20:06:34Z'
WHERE slug = 'lamont-mcleod';

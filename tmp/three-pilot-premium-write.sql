-- Transaction ownership is delegated to the harness that executes this SQL body.

-- Bind the three pilot destinations to the provided existing catalog IDs without changing slugs or other legacy content.
UPDATE public.destinations_catalog
SET destination_key = CASE id
  WHEN 'f65b8c56-0a75-4e83-8b41-533444f0eff2' THEN 'lisbon-pt'
  WHEN '63a56797-164d-49bd-9969-9b539ce7e57d' THEN 'new-braunfels-tx-us'
  WHEN '32b10339-a202-48bb-b1eb-2798735b7ed3' THEN 'summerlin-nv-us'
  ELSE destination_key
END
WHERE id IN ('f65b8c56-0a75-4e83-8b41-533444f0eff2', '63a56797-164d-49bd-9969-9b539ce7e57d', '32b10339-a202-48bb-b1eb-2798735b7ed3');

INSERT INTO public.premium_destination_profiles (destination_id, destination_key, profile_status, identity_name, currency, primary_language, time_zone, profile_storage_version)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'draft', 'Lisbon', 'EUR', 'Portuguese', 'Europe/Lisbon', 1),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'draft', 'New Braunfels', 'USD', 'English', 'America/Chicago', 1),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'draft', 'Summerlin', 'USD', 'English', 'America/Los_Angeles', 1);


INSERT INTO public.premium_destination_module_presence (destination_id, destination_key, module_key)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'facts'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'scores'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'neighborhoods'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'places'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'resources'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'media'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'propertyResources'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'moveChecklist'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'eventsSeasonality'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'sources'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'costOfLiving'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'climateMonthly'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'housing'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'healthcare'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'visaResidency'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'taxesFinance'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lgbtqInclusivity'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'safetyRisks'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'transportation'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'remoteWork'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'languageIntegration'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'pets'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'familyEducation'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'communitySocial'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'accessibility'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'bureaucracySetup'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'workBusiness'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'retirementAging'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lifestyleLaws'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'realityCheck'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'environmentQuality'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'dailyLifePracticality'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'facts'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'scores'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'neighborhoods'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'places'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'resources'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'media'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'propertyResources'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'moveChecklist'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'eventsSeasonality'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'sources'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'costOfLiving'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'climateMonthly'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'housing'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'healthcare'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'visaResidency'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'taxesFinance'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'lgbtqInclusivity'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'safetyRisks'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'transportation'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'remoteWork'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'languageIntegration'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'pets'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'familyEducation'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'communitySocial'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'accessibility'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'bureaucracySetup'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'workBusiness'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'retirementAging'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'lifestyleLaws'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'realityCheck'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'environmentQuality'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'dailyLifePracticality'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'facts'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'scores'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'neighborhoods'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'places'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'resources'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'media'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'propertyResources'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'moveChecklist'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'eventsSeasonality'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sources'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'costOfLiving'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'climateMonthly'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'housing'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'healthcare'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'visaResidency'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'taxesFinance'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'lgbtqInclusivity'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'safetyRisks'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'transportation'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'remoteWork'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'languageIntegration'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'pets'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'familyEducation'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'communitySocial'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'accessibility'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'bureaucracySetup'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'workBusiness'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'retirementAging'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'lifestyleLaws'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'realityCheck'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'environmentQuality'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'dailyLifePracticality');


INSERT INTO public.premium_destination_facts (destination_id, destination_key, fact_key, fact_type, title, body, source_ref)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'climate', 'climate', 'Climate', 'Mediterranean climate with warm dry summers and mild wetter winters.', 'Workbook editorial research'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'walkability', 'mobility', 'Walkability', 'Highly walkable central districts; hills and historic paving materially affect mobility.', 'Workbook editorial research'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'transit', 'mobility', 'Transit', 'Metro, trams, buses and rail make car-light living realistic in many districts.', 'Metropolitano de Lisboa'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'climate', 'climate', 'Climate', 'Humid subtropical; very hot summers, mild winters and a long river-recreation season.', 'Workbook editorial research'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'walkability', 'mobility', 'Walkability', 'Downtown and Gruene are the strongest walkable pockets; most residential areas are car-dependent.', 'Workbook editorial research'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'airport', 'mobility', 'Airport access', 'San Antonio International and Austin-Bergstrom are the main commercial-air options.', 'Workbook editorial research'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'healthcare', 'health', 'Healthcare', 'Local hospital care plus deeper specialist networks in San Antonio and Austin.', 'Baptist Health System'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'climate', 'climate', 'Climate', 'Hot desert climate with very hot summers, mild winters and abundant sunshine.', 'Workbook editorial research'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'walkability', 'mobility', 'Walkability', 'Village centers and Downtown Summerlin offer walkable pockets; overall it is car-oriented.', 'Workbook editorial research'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'healthcare', 'health', 'Healthcare', 'Summerlin Hospital and the Las Vegas Valley provide broad hospital and specialist access.', 'Summerlin Hospital');


INSERT INTO public.premium_destination_scores (destination_id, destination_key, score_key, score_name, score_value, weight, higher_is_better)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'retirement', 'Excellent', '90', NULL, true),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'walkability', 'Excellent', '91', NULL, true),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lifestyle', 'Excellent', '94', NULL, true),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'retirement', 'Very Good', '82', NULL, true),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'walkability', 'Mixed', '58', NULL, true),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'lifestyle', 'Excellent', '88', NULL, true),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'retirement', 'Excellent', '89', NULL, true),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'walkability', 'Mixed', '55', NULL, true),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'lifestyle', 'Excellent', '87', NULL, true);


INSERT INTO public.premium_neighborhoods (destination_id, destination_key, neighborhood_key, neighborhood_name, area_type, summary)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'principe-real-lis', 'Príncipe Real', 'central neighborhood', 'Cosmopolitan central neighborhood with gardens, mansions, restaurants, antiques and independent shopping.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'campo-ourique-lis', 'Campo de Ourique', 'residential urban', 'Residential neighborhood with a strong local high street, market, cafés and a calmer rhythm than the tourist core.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'estrela-lis', 'Estrela / Lapa', 'residential historic', 'Elegant residential area around Jardim da Estrela and the basilica, with access toward Lapa and the river.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'alfama-lis', 'Alfama', 'historic neighborhood', 'Lisbon’s historic hillside core of narrow streets, viewpoints, fado and traditional urban fabric.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'baixa-chiado-lis', 'Baixa / Chiado', 'historic-commercial center', 'Central historic and commercial core with dense transit, shops, restaurants and major attractions.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'cais-sodre-lis', 'Cais do Sodré / Santos', 'transport-nightlife district', 'Major metro/train/ferry hub with Mercado da Ribeira, nightlife and river access.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'parque-nacoes-lis', 'Parque das Nações', 'modern riverfront', 'Modern, flatter riverfront district with newer buildings, parks, offices, shopping and major transport connections.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'belem-lis', 'Belém / Restelo', 'historic riverfront', 'Western Lisbon district known for monuments, museums, gardens and riverfront space.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'downtown-nb', 'Downtown New Braunfels', 'historic center', 'Original 1845 core around Main Plaza with German-influenced architecture, boutiques, restaurants and civic life.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'gruene-nb', 'Gruene Historic District', 'historic district', 'Historic district centered on Gruene Hall and the Guadalupe River, with restaurants, shops and a strong visitor economy.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'veramendi-nb', 'Veramendi', 'master-planned community', '2,400-acre mixed-use master-planned community with neighborhood parks, schools and extensive planned green space.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'oak-run-nb', 'Oak Run / Loop 337 West', 'residential area', 'Established residential area west/northwest of downtown with access to Loop 337, schools and daily services.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'mission-hills-nb', 'Mission Hills Ranch', 'residential neighborhood', 'Established west-side neighborhood with Hill Country feel and practical access to town.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'town-creek-nb', 'Town Creek', 'new urbanist neighborhood', 'New-urbanist style development near downtown mixing housing forms with access to central New Braunfels.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'creekside-nb', 'Creekside / FM 306', 'commercial-residential district', 'Fast-growing northeast area near major retail, healthcare and I-35 access.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'river-chase-nb', 'River Chase / FM 306 West', 'acreage community', 'Large-lot Hill Country residential area northwest of the urban core, popular with buyers seeking more land.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'downtown-summerlin', 'Downtown Summerlin', 'mixed-use district', 'Summerlin’s primary urban-style commercial core with restaurants, retail, events and Las Vegas Ballpark nearby.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'ridges-summerlin', 'The Ridges', 'luxury gated village', 'Guard-gated luxury village known for desert contemporary homes and premium views.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'cliffs-summerlin', 'The Cliffs', 'village', 'Southern Summerlin village shaped by the Spring Mountains ridgeline and contemporary architecture.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'paseos-summerlin', 'The Paseos', 'village', 'Western village known for Paseos Park, Fox Hill Park and direct connection to Summerlin trails.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'stonebridge-summerlin', 'Stonebridge', 'village', 'Western-edge village with Prairie Highland-inspired architecture, parks and mountain proximity.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sun-city-summerlin', 'Sun City Summerlin', '55+ community', 'Large established 55+ community with multiple golf courses, recreation centers and clubs.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'redpoint-summerlin', 'Redpoint / Redpoint Square', 'new village district', 'Newer Summerlin West district combining detached and attached housing with a more connected street pattern.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'kestrel-summerlin', 'Kestrel / Kestrel Commons', 'new village district', 'Newer western villages at higher elevation with contemporary attached and detached housing.');


INSERT INTO public.premium_places (destination_id, destination_key, place_key, category_key, place_name, description)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'ramiro', 'restaurant', 'Cervejaria Ramiro', 'Famous Lisbon seafood cervejaria known for shellfish and a lively, no-frills dining room.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'belcanto', 'restaurant', 'Belcanto', 'José Avillez''s fine-dining restaurant in Chiado and one of Lisbon''s best-known destination restaurants.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'prado', 'restaurant', 'Prado', 'Contemporary farm-to-table restaurant near the cathedral focused on seasonal Portuguese ingredients.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'cantinho', 'restaurant', 'Cantinho do Avillez', 'Approachable José Avillez restaurant in Chiado with contemporary Portuguese cooking.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'time-out', 'restaurant', 'Time Out Market Lisboa', 'Large food hall in Mercado da Ribeira bringing many Lisbon food concepts into one destination.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'pasteis-belem', 'bakery', 'Pastéis de Belém', 'Historic Belém bakery serving its famous custard tarts since the 19th century.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'fabrica-coffee', 'coffee_shop', 'Fábrica Coffee Roasters', 'Lisbon specialty-coffee roaster with central cafés and a strong espresso/filter focus.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'copenhagen-coffee', 'coffee_shop', 'Copenhagen Coffee Lab', 'Specialty coffee and bakery group with multiple Lisbon locations popular for coffee and light work sessions.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'gulbenkian', 'museum', 'Calouste Gulbenkian Museum', 'Major Lisbon art collection and cultural foundation set within a notable garden campus.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'maat', 'museum', 'MAAT', 'Museum of Art, Architecture and Technology on the Belém riverfront.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'castelo', 'attraction', 'Castelo de São Jorge', 'Hilltop castle and major viewpoint above Lisbon''s historic center.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'belem-tower', 'attraction', 'Belém Tower', 'UNESCO-listed Manueline riverfront monument and Lisbon icon.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'oceanario', 'attraction', 'Oceanário de Lisboa', 'Large public aquarium in Parque das Nações and one of Lisbon''s strongest family attractions.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'cuf-tejo', 'hospital', 'Hospital CUF Tejo', 'Major private hospital in Lisbon with 24-hour adult urgent care and broad specialist services.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'hospital-luz', 'hospital', 'Hospital da Luz Lisboa', 'Large private hospital and medical complex in Lisbon.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'jardim-estrela', 'park', 'Jardim da Estrela', 'Historic central garden opposite the Estrela Basilica, popular for walking and neighborhood daily life.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'parque-nacoes-gardens', 'park', 'Jardim do Parque das Nações', 'Network of modern riverfront green spaces and promenades in eastern Lisbon.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'belcanto-lis', 'restaurant', 'Belcanto', 'José Avillez''s contemporary Portuguese restaurant in Chiado, positioned as a special-occasion culinary experience.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'ramiro-lis', 'restaurant', 'Cervejaria Ramiro', 'Long-established Lisbon seafood restaurant known for shellfish and a lively, no-frills dining experience.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'coach-museum-lis', 'museum', 'National Coach Museum', 'Major Belém museum devoted to historic royal and ceremonial coaches, useful for Lisbon''s culture/museum depth.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'monsanto-lis', 'park', 'Monsanto Forest Park', 'Large forested green area overlooking Lisbon, useful for hiking, cycling, viewpoints and access to nature within the city.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'cafe-sao-bento-lis', 'restaurant', 'Café de São Bento', 'Long-running Lisbon restaurant known for steak and a classic late-night dining atmosphere.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'dear-breakfast-lis', 'coffee_shop', 'Dear Breakfast - Alfama', 'All-day breakfast and coffee concept with multiple Lisbon locations; Alfama is a useful neighborhood anchor.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'hello-kristof-lis', 'coffee_shop', 'Hello, Kristof', 'Lisbon specialty-coffee shop known for coffee and independent-magazine culture.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'cph-sao-paulo-lis', 'coffee_shop', 'Copenhagen Coffee Lab - São Paulo', 'Cais do Sodré-area Copenhagen Coffee Lab location serving hand-roasted specialty coffee.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'cuf-descobertas-lis', 'hospital', 'CUF Descobertas Hospital', 'Major private hospital in Parque das Nações with adult and pediatric urgent-care capability.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'hospital-luz-lis', 'hospital', 'Hospital da Luz Lisboa', 'Major private Lisbon hospital offering broad specialist consultations, exams and hospital care.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lux-fragil-lis', 'nightlife', 'Lux Frágil', 'Long-running Lisbon nightlife institution in Santa Apolónia known for electronic music, club nights and rooftop programming.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'pensao-amor-lis', 'nightlife', 'Pensão Amor', 'Cais do Sodré nightlife venue with themed rooms, live music, performances and late-night social atmosphere.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'mcadoos', 'restaurant', 'McAdoo''s Seafood Company', 'Seafood and Cajun-influenced dining in New Braunfels'' historic former post office; a signature downtown dinner choice.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'muck-fuss', 'restaurant', 'Muck & Fuss', 'Chef-driven burgers, craft beer and a lively downtown patio atmosphere.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'gristmill', 'restaurant', 'Gristmill River Restaurant & Bar', 'Large historic Gruene restaurant overlooking the Guadalupe River, known for Texas comfort food and atmosphere.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'gruene-river-grill', 'restaurant', 'Gruene River Grill', 'Popular Gruene restaurant serving steaks, seafood and Texas/Southwestern dishes near the river.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'krauses', 'restaurant', 'Krause''s Cafe & Biergarten', 'German-Texas restaurant and biergarten reflecting New Braunfels'' German heritage, with live music and a broad beer selection.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'huisache', 'restaurant', 'Huisache Grill', 'Long-running locally known grill near downtown with wine, steaks, seafood and a shaded courtyard feel.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'myrons', 'restaurant', 'Myron''s Prime Steakhouse', 'Upscale steakhouse in downtown New Braunfels for prime steaks and special-occasion dining.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'buttermilk', 'restaurant', 'Buttermilk Cafe', 'Local breakfast and lunch favorite known for hearty brunch-style dishes.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'adobe', 'restaurant', 'Adobe Cafe', 'Casual Tex-Mex institution serving New Braunfels for decades.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'clear-springs', 'restaurant', 'Clear Springs Restaurant', 'Texas-style seafood, catfish and famous onion rings east of the central city.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-coffee', 'coffee_shop', 'New Braunfels Coffee', 'Downtown specialty coffee shop operating since 1992 with indoor/outdoor seating and Wi-Fi.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'gruene-coffee', 'coffee_shop', 'Gruene Coffee Haus', 'Specialty coffee shop and roastery in Gruene, open daily.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', '2tarts', 'bakery', '2tarts Bakery', 'Downtown bakery known for pastries, cakes and desserts.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'landa', 'park', 'Landa Park', 'Iconic 50+ acre city park at the Comal Springs with trails, playgrounds, aquatic facilities, miniature train, paddleboats and golf.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'fischer', 'park', 'Fischer Park', 'New Braunfels'' largest city park, with trails, fishing ponds, splashpad, playgrounds, nature education and amphitheater.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'landa-golf', 'golf', 'Landa Park Golf Course', 'Public 18-hole municipal course along the Comal River in Landa Park.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'bandit', 'golf', 'The Bandit Golf Club', 'Hill Country public-access course near New Braunfels and Lake McQueeney, known for a more demanding layout.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'gruene-hall', 'live_music', 'Gruene Hall', 'Texas'' oldest continually operating dance hall and the cultural anchor of Gruene''s live-music scene.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'schlitterbahn', 'attraction', 'Schlitterbahn New Braunfels', 'Major waterpark built around New Braunfels'' spring-fed river identity.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'resolute', 'hospital', 'Resolute Baptist Hospital', 'Full-service hospital with emergency care, cardiology, orthopedics, women''s services and Level II NICU.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'zipp-sports-nb', 'park', 'Zipp Family Sports Park', 'Approximately 150-acre multi-sport complex designed as a regional hub for youth tournaments and community recreation.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'puppy-playland-nb', 'pet_service', 'Puppy Playland Dog Park', 'City dog park with separate small-dog, large-dog and agility sections, shade and drinking fountains.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'kora-kora-nb', 'coffee_shop', 'Kora Kora Coffee', 'Locally owned New Braunfels/Gruene coffee shop serving espresso, tea and pastries.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', '2tarts-nb', 'coffee_shop', '2Tarts Bakery', 'Downtown bakery/cafe serving scratch-made pastries plus gourmet coffee and espresso.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'kinnor-nb', 'coffee_shop', 'Kinnor Coffee & Cocktails', 'Coffee-and-cocktail gathering spot in a restored historic house, known for house-made syrups and espresso drinks.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'christus-santa-rosa-nb', 'hospital', 'CHRISTUS Santa Rosa Hospital - New Braunfels', 'Full-service New Braunfels hospital with 24/7 emergency care and broad specialty services.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'christus-urgent-nb', 'urgent_care', 'CHRISTUS Urgent Care - New Braunfels', 'Walk-in urgent care for non-life-threatening illness and injury with extended hours.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'christus-creekside-nb', 'hospital', 'CHRISTUS Santa Rosa Emergency Center Creekside', '24/7 emergency center serving the Creekside side of New Braunfels.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'sophienburg-nb', 'museum', 'Sophienburg Museum & Archives', 'Museum and archives focused on New Braunfels'' German-settler history and local heritage.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'handmade-furniture-nb', 'museum', 'Museum of Texas Handmade Furniture', 'Heritage Village museum showcasing Texas-German Biedermeier furniture and immigrant craftsmanship.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'sidecar-nb', 'nightlife', 'Sidecar', 'Vintage speakeasy inside the Prince Solms Inn with cocktails, whiskey, live jazz and piano.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'railroad-museum-nb', 'museum', 'New Braunfels Railroad Museum', 'Downtown museum focused on New Braunfels and Comal County railroad history, artifacts and model railroading.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'mckenna-kids-nb', 'museum', 'McKenna Children''s Museum', 'Hands-on children''s learning museum with indoor and outdoor exhibits designed for young families.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'brauntex-nb', 'theater', 'Brauntex Theatre', 'Historic downtown performing-arts venue presenting concerts, film, educational programming and touring acts.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'outdoor-art-nb', 'attraction', 'Historic Outdoor Art Museum', 'Public-art organization and outdoor heritage-art experience in New Braunfels, listed by the official destination directory.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'pour-haus-nb', 'nightlife', 'Pour Haus', 'Downtown open-air bar and rooftop venue with frequent live music and late-night programming.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'harlo', 'restaurant', 'Harlo Steakhouse & Bar', 'Upscale steakhouse in Downtown Summerlin.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'jing', 'restaurant', 'JING Las Vegas', 'Contemporary Asian restaurant and lounge in Downtown Summerlin.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'true-food', 'restaurant', 'True Food Kitchen', 'Health-focused restaurant in Downtown Summerlin with broad dietary options.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'fine-company', 'restaurant', 'Fine Company', 'Contemporary neighborhood restaurant in Downtown Summerlin.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'public-school', 'restaurant', 'Public School 702', 'Gastropub-style restaurant in Downtown Summerlin.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'mothership', 'coffee_shop', 'Mothership Coffee Roasters', 'Local Las Vegas specialty-coffee roaster with a Downtown Summerlin location.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'fox-hill', 'park', 'Fox Hill Park', 'Adventure-themed Summerlin park in The Paseos with climbing, zipline and disc-golf features.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'paseos-park', 'park', 'The Paseos Park', 'Large village park with sports fields, courts, playground areas and trail connections.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'gardens-park', 'park', 'The Gardens Park', '18-acre village park with courts, lawns, community center and gardens.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'oak-leaf', 'park', 'Oak Leaf Park', 'The Cliffs park known for pickleball, playgrounds, lawns and walking paths.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'eagle-crest', 'golf', 'Eagle Crest Golf Club', 'Public mountain-side Summerlin golf course with elevated Las Vegas views.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'highland-falls', 'golf', 'Highland Falls Golf Club', 'Public Summerlin course with elevation changes and broad valley views.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'palm-valley', 'golf', 'Palm Valley Golf Club', 'Longest and most challenging of Golf Summerlin''s three Sun City courses.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'siena-golf', 'golf', 'Siena Golf Club', 'Public-access desert course in the Summerlin area designed by Schmidt-Curley.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'tpc-las-vegas', 'golf', 'TPC Las Vegas', 'Public-access championship desert golf course west of the Strip.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'tpc-summerlin', 'golf', 'TPC Summerlin', 'Private PGA TOUR-caliber club and host course for the Shriners Children''s Open.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'red-rock-cc', 'golf', 'Red Rock Country Club', 'Private country club with the Mountain Course and public-access Arroyo course in the Summerlin area.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-hospital', 'hospital', 'Summerlin Hospital Medical Center', '496-bed hospital with cardiac, surgical, children''s, maternity and oncology services.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'downtown-summerlin-shopping', 'shopping', 'Downtown Summerlin', 'Major open-air shopping, dining, entertainment and event district serving Summerlin.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'red-rock-canyon', 'trail', 'Red Rock Canyon National Conservation Area', 'National conservation area immediately west of Summerlin with scenic drives, hiking and climbing.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'mothership-sum', 'coffee_shop', 'Mothership Coffee Roasters - Downtown Summerlin', 'Specialty coffee shop in Downtown Summerlin with pastries, sandwiches, Wi-Fi, group seating and a dog-friendly patio.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'la-strega-sum', 'restaurant', 'La Strega', 'Chef-driven neighborhood Italian restaurant in the Summerlin area focused on regional Italian dishes, pasta, pizza and wine.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'vistas-park-sum', 'park', 'The Vistas Park', 'Summerlin community park known for broad open space, trails and recreation amenities.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'paseos-park-sum', 'park', 'The Paseos Park', 'Large neighborhood park in The Paseos with open space and trail connections near the western edge of Summerlin.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-library', 'theater', 'Summerlin Library and Performing Arts Center', 'Public library and performing-arts resource serving the Summerlin area and broader west Las Vegas Valley.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'las-vegas-ballpark', 'sports', 'Las Vegas Ballpark', 'Triple-A baseball stadium in Downtown Summerlin, home of the Las Vegas Aviators and a major local entertainment anchor.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'naxos-sum', 'restaurant', 'Naxos Taverna', 'Coastal Greek seafood restaurant at Red Rock Resort serving the Summerlin area.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'tbones-sum', 'restaurant', 'T-Bones Chophouse', 'Upscale chophouse at Red Rock Resort and a major special-occasion dining option for Summerlin.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'makers-finders-sum', 'coffee_shop', 'Makers & Finders - Downtown Summerlin', 'Downtown Summerlin coffee bar/cafe built around specialty coffee, Latin-inspired food and brunch.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'bagel-nook-sum', 'coffee_shop', 'The Bagel Nook - Summerlin', 'Summerlin cafe/bagel shop with Nook Coffee and a large breakfast selection.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'carenow-durango-sum', 'urgent_care', 'CareNow Urgent Care - Durango & Flamingo', 'Walk-in clinic near the Summerlin community for non-emergency illness and injury.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'er-south-sum', 'hospital', 'ER at South Summerlin', 'Summerlin Hospital''s 24/7 freestanding emergency department in South Summerlin.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'rocks-lounge-sum', 'nightlife', 'Rocks Lounge', 'Red Rock Resort lounge with nightly live music, cocktails and VIP seating.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'onyx-bar-sum', 'nightlife', 'Onyx Bar', 'Refined Red Rock Resort cocktail bar focused on whiskey, signature cocktails and live entertainment.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'bake-coffee-sum', 'coffee_shop', 'Bake the Cookie Shoppe - Downtown Summerlin', 'Downtown Summerlin dessert shop with dine-in seating and a coffee program added to its cookie-focused concept.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'city-national-arena', 'sports', 'City National Arena', 'Official practice facility of the Vegas Golden Knights with public skating and hockey programming near Downtown Summerlin.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'red-rock-lanes-sum', 'attraction', 'Red Rock Lanes', 'Large bowling and entertainment center at Red Rock Resort with 72 lanes, game room and VIP suites.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-festival-arts-place', 'attraction', 'Summerlin Festival of Arts', 'Annual juried fine-arts festival at The Lawn at Downtown Summerlin featuring more than 100 artists plus family activities and entertainment.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'rouge-room-sum', 'nightlife', 'Rouge Room', 'Indoor/outdoor cocktail lounge at Red Rock Resort with nightlife-oriented programming and cabana experience.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'red-rock-resort-entertainment', 'attraction', 'Red Rock Resort Entertainment', 'Major west-valley entertainment anchor adjacent to Summerlin with lounges, live concerts, bowling, dining and casino entertainment.');


INSERT INTO public.premium_resources (destination_id, destination_key, resource_key, resource_category, resource_name, url)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-tourism', 'tourism', 'Visit Lisboa', 'https://www.visitlisboa.com/en'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-gov-reside', 'visa_residency', 'Portugal Government: Reside in Portugal', 'https://www.gov.pt/guias/residir-em-portugal'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-health-gov', 'healthcare', 'Portugal Government: Migrant Healthcare', 'https://www.gov.pt/guias/migrantes-cuidados-de-saude-em-portugal'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-nif', 'banking_tax', 'Portuguese Tax Authority: NIF', 'https://info.portaldasfinancas.gov.pt/en/tax-information/getting-started-in-portugal/tax-identification-number/apply-for-your-nif/Pages/default.aspx'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-idealista-buy', 'property_buy', 'Idealista Lisbon - Buy', 'https://www.idealista.pt/en/comprar-casas/lisboa/'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-idealista-rent', 'property_rent', 'Idealista Lisbon - Rent', 'https://www.idealista.pt/en/arrendar-casas/lisboa/'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-cuf', 'healthcare', 'CUF', 'https://www.cuf.pt/'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-cigna', 'global_insurance', 'Cigna Global', 'https://www.cignaglobal.com/'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-geoblue', 'global_insurance', 'GeoBlue', 'https://www.geobluetravelinsurance.com/'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-city', 'official', 'City of New Braunfels', 'https://www.newbraunfels.gov/'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-tourism', 'tourism', 'New Braunfels Tourism', 'https://www.playinnewbraunfels.com/'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-homes', 'property_buy', 'Realtor.com New Braunfels', 'https://www.realtor.com/realestateandhomes-search/New-Braunfels_TX'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-rent', 'property_rent', 'Apartments.com New Braunfels', 'https://www.apartments.com/new-braunfels-tx/'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-health', 'healthcare', 'Resolute Baptist Hospital', 'https://www.baptisthealthsystem.com/locations/detail/resolute-baptist-hospital'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sum-official', 'official', 'Summerlin', 'https://summerlin.com/'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sum-homes', 'property_buy', 'Summerlin Find a Home', 'https://summerlin.com/live/'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sum-realtor', 'property_buy', 'Realtor.com Summerlin', 'https://www.realtor.com/realestateandhomes-search/Summerlin_Las-Vegas_NV'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sum-rent', 'property_rent', 'Apartments.com Summerlin', 'https://www.apartments.com/summerlin-las-vegas-nv/'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sum-health', 'healthcare', 'Summerlin Hospital Medical Center', 'https://www.summerlinhospital.com/'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sum-redrock', 'outdoors', 'Red Rock Canyon NCA', 'https://www.blm.gov/programs/national-conservation-lands/nevada/red-rock-canyon');


INSERT INTO public.premium_media (destination_id, destination_key, media_key, media_type, url, caption, alt_text)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-praca1', 'image', 'https://commons.wikimedia.org/wiki/Special:FilePath/Lisbona_praca_do_comercio.jpg', 'Praça do Comércio and Lisbon waterfront core', 'Praça do Comércio'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-praca2', 'image', 'https://commons.wikimedia.org/wiki/Special:FilePath/Praca_do_Comercio_Lisbon.jpg', 'Praça do Comércio from above', 'Historic central Lisbon'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-praca3', 'image', 'https://commons.wikimedia.org/wiki/Special:FilePath/Praça_do_Comércio,_Lisboa.jpg', 'Praça do Comércio in Baixa', 'Baixa and riverfront'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-landa', 'image', 'https://commons.wikimedia.org/wiki/Special:FilePath/New_Braunfels_Texas_Landa_Park.jpg', 'Comal River at Landa Park', 'Landa Park and river life'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-gruene', 'image', 'https://commons.wikimedia.org/wiki/Special:FilePath/Gruene_July_2017_1_(Gruene_Hall).jpg', 'Gruene Hall in the historic Gruene district', 'Gruene historic district'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-downtown', 'image', 'https://commons.wikimedia.org/wiki/Special:FilePath/Downtown_New_Braunfels_on_rainy_morning_IMG_3258.JPG', 'Historic Downtown New Braunfels streetscape', 'Downtown New Braunfels'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-courthouse', 'image', 'https://commons.wikimedia.org/wiki/Special:FilePath/Comal_County_Courthouse5.jpg', 'Comal County Courthouse in New Braunfels', 'Civic architecture and downtown'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-sunset', 'image', 'https://commons.wikimedia.org/wiki/Special:FilePath/SunsetNewBraunfels-Apr2011_(33667556666).jpg', 'Sunset in New Braunfels', 'New Braunfels lifestyle imagery'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sum-dts', 'image', 'https://commons.wikimedia.org/wiki/Special:FilePath/Overlooking_Downtown_Summerlin,_2015.jpg', 'Downtown Summerlin area', 'Downtown Summerlin'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sum-redrock', 'image', 'https://commons.wikimedia.org/wiki/Special:FilePath/Red_Rock_Canyon_From_Summerlin_Parkway.jpg', 'Red Rock Canyon viewed from Summerlin', 'Red Rock proximity'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sum-library', 'image', 'https://commons.wikimedia.org/wiki/Special:FilePath/Summerlin_Library_and_Performing_Arts_Center.jpg', 'Summerlin Library and Performing Arts Center', 'Community amenities');


INSERT INTO public.premium_cost_of_living (destination_id, destination_key, record_key, category, monthly_low, monthly_high, currency)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-cost-of-living-lisbon-pt-single-housing', 'housing', '1300', '2200', 'EUR'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-cost-of-living-lisbon-pt-single-utilities', 'utilities', '120', '220', 'EUR'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-cost-of-living-lisbon-pt-single-groceries', 'groceries', '280', '450', 'EUR'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-cost-of-living-lisbon-pt-single-dining', 'dining', '250', '500', 'EUR'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-cost-of-living-lisbon-pt-single-transport', 'transport', '50', '120', 'EUR'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-cost-of-living-lisbon-pt-single-healthcare', 'healthcare', '80', '250', 'EUR'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-cost-of-living-lisbon-pt-single-internet-mobile', 'internet_mobile', '50', '90', 'EUR'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-cost-of-living-lisbon-pt-single-entertainment', 'entertainment', '150', '350', 'EUR'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-cost-of-living-lisbon-pt-single-fitness', 'fitness', '35', '80', 'EUR'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-cost-of-living-lisbon-pt-single-miscellaneous', 'miscellaneous', '180', '350', 'EUR'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-cost-of-living-new-braunfels-tx-us-single-housing', 'housing', '1400', '2200', 'USD'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-cost-of-living-new-braunfels-tx-us-single-utilities', 'utilities', '180', '320', 'USD'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-cost-of-living-new-braunfels-tx-us-single-groceries', 'groceries', '350', '550', 'USD'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-cost-of-living-new-braunfels-tx-us-single-dining', 'dining', '250', '500', 'USD'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-cost-of-living-new-braunfels-tx-us-single-transport', 'transport', '450', '850', 'USD'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-cost-of-living-new-braunfels-tx-us-single-healthcare', 'healthcare', '250', '700', 'USD'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-cost-of-living-new-braunfels-tx-us-single-internet-mobile', 'internet_mobile', '120', '200', 'USD'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-cost-of-living-new-braunfels-tx-us-single-entertainment', 'entertainment', '150', '350', 'USD'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-cost-of-living-new-braunfels-tx-us-single-fitness', 'fitness', '40', '120', 'USD'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-cost-of-living-new-braunfels-tx-us-single-miscellaneous', 'miscellaneous', '200', '400', 'USD'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-cost-of-living-summerlin-nv-us-single-housing', 'housing', '1700', '2800', 'USD'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-cost-of-living-summerlin-nv-us-single-utilities', 'utilities', '180', '350', 'USD'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-cost-of-living-summerlin-nv-us-single-groceries', 'groceries', '350', '600', 'USD'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-cost-of-living-summerlin-nv-us-single-dining', 'dining', '300', '650', 'USD'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-cost-of-living-summerlin-nv-us-single-transport', 'transport', '500', '900', 'USD'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-cost-of-living-summerlin-nv-us-single-healthcare', 'healthcare', '250', '700', 'USD'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-cost-of-living-summerlin-nv-us-single-internet-mobile', 'internet_mobile', '120', '220', 'USD'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-cost-of-living-summerlin-nv-us-single-entertainment', 'entertainment', '200', '500', 'USD'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-cost-of-living-summerlin-nv-us-single-fitness', 'fitness', '40', '150', 'USD'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-cost-of-living-summerlin-nv-us-single-miscellaneous', 'miscellaneous', '200', '450', 'USD');


INSERT INTO public.premium_climate_monthly (destination_id, destination_key, record_key, month_key, avg_high_temp, avg_low_temp, precipitation_mm, humidity_pct)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-climate-1', '1', '15.1', '8.6', '103.8', NULL),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-climate-2', '2', '16.4', '9.1', '77.8', NULL),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-climate-3', '3', '18.9', '11', '68.7', NULL),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-climate-4', '4', '20.4', '12.3', '71.8', NULL),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-climate-5', '5', '23.1', '14.4', '57.8', NULL),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-climate-6', '6', '26.1', '16.8', '14.1', NULL),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-climate-7', '7', '28.2', '18.2', '2.6', NULL),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-climate-8', '8', '28.8', '18.8', '5.4', NULL),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-climate-9', '9', '26.6', '17.6', '38.6', NULL),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-climate-10', '10', '22.8', '15.3', '110.6', NULL),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-climate-11', '11', '18.1', '11.8', '133.9', NULL),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-climate-12', '12', '15.4', '9.4', '108.5', NULL),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-climate-1', '1', '17.9', '5.4', '44.4', NULL),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-climate-2', '2', '20', '7.2', '45.5', NULL),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-climate-3', '3', '23.5', '10.9', '58.7', NULL),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-climate-4', '4', '27', '14.7', '61.5', NULL),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-climate-5', '5', '30.3', '19.1', '111.8', NULL),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-climate-6', '6', '33.2', '22.2', '83.3', NULL),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-climate-7', '7', '34.9', '23.4', '45.5', NULL),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-climate-8', '8', '35.7', '23.6', '53.8', NULL),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-climate-9', '9', '32.5', '20.7', '87.9', NULL),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-climate-10', '10', '27.9', '15.3', '95.2', NULL),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-climate-11', '11', '22.4', '9.7', '55.4', NULL),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-climate-12', '12', '18.2', '5.7', '48.5', NULL),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-climate-1', '1', '14.7', '3.9', '14.2', NULL),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-climate-2', '2', '16.9', '5.7', '20.3', NULL),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-climate-3', '3', '21.4', '9', '10.7', NULL),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-climate-4', '4', '25.9', '12.9', '5.1', NULL),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-climate-5', '5', '31.4', '17.8', '1.8', NULL),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-climate-6', '6', '37.8', '23.3', '1', NULL),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-climate-7', '7', '40.3', '26.8', '9.7', NULL),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-climate-8', '8', '39.2', '26.1', '8.1', NULL),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-climate-9', '9', '34.8', '21.3', '8.1', NULL),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-climate-10', '10', '27.1', '14.2', '6.3', NULL),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-climate-11', '11', '19.1', '7.3', '7.9', NULL),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-climate-12', '12', '13.8', '3.5', '10.2', NULL);


INSERT INTO public.premium_housing_property (destination_id, destination_key, record_key, restrictions_summary, buying_process_summary, rental_rules_notes)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-housing-1', NULL, NULL, NULL),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-housing-1', NULL, NULL, NULL),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-housing-1', NULL, NULL, NULL);


INSERT INTO public.premium_property_resources (destination_id, destination_key, record_key, resource_type, resource_name, url)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-property-resource-lis-idealista-buy', 'for_sale', 'Idealista', 'https://www.idealista.pt/en/comprar-casas/lisboa/'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-property-resource-lis-idealista-rent', 'rental', 'Idealista', 'https://www.idealista.pt/en/arrendar-casas/lisboa/'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-property-resource-lis-remax', 'brokerage', 'RE/MAX Portugal', 'https://www.remax.pt/en'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-property-resource-nb-realtor', 'for_sale', 'Realtor.com', 'https://www.realtor.com/realestateandhomes-search/New-Braunfels_TX'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-property-resource-nb-veramendi', 'new_homes', 'Veramendi', 'https://veramenditx.com/'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-property-resource-nb-apts', 'rental', 'Apartments.com', 'https://www.apartments.com/new-braunfels-tx/'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-property-resource-sum-official-homes', 'new_homes', 'Summerlin Find a Home', 'https://summerlin.com/live/'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-property-resource-sum-realtor', 'for_sale', 'Realtor.com', 'https://www.realtor.com/realestateandhomes-search/Summerlin_Las-Vegas_NV'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-property-resource-sum-apts', 'rental', 'Apartments.com', 'https://www.apartments.com/summerlin-las-vegas-nv/');


INSERT INTO public.premium_healthcare_insurance (destination_id, destination_key, record_key, system_summary, public_access_foreigners, international_insurance_notes)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-healthcare-1', NULL, NULL, NULL),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-healthcare-1', NULL, NULL, NULL),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-healthcare-1', NULL, NULL, NULL);


INSERT INTO public.premium_visa_residency (destination_id, destination_key, record_key, visa_type, permanent_residency_path, citizenship_path)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-visa-1', NULL, NULL, 'Separate naturalization rules apply'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-visa-2', NULL, NULL, 'Citizenship subject to current Portuguese law'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-visa-1', NULL, NULL, 'N/A'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-visa-1', NULL, NULL, 'N/A');


INSERT INTO public.premium_taxes_finance (destination_id, destination_key, record_key, summary, notes)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-taxes-1', 'Portuguese treatment depends on residence, income type and current law; U.S. citizens retain U.S. filing obligations.', 'Depends on status/income'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-taxes-1', 'Texas has no state individual income tax; property tax is a meaningful ownership cost.', 'No Texas individual income tax'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-taxes-1', 'Nevada has no state individual income tax; federal rules still apply.', 'No Nevada individual income tax');


INSERT INTO public.premium_safety_risks (destination_id, destination_key, record_key, topic, severity, summary)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-safety-risk-lis-quake', 'Earthquake', 'medium', 'Lisbon has meaningful seismic history and building age varies widely.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-safety-risk-nb-flood', 'Flooding', 'high', 'Flood exposure matters near rivers, creeks and low-lying areas.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-safety-risk-nb-heat', 'Extreme heat', 'high', 'Long hot summers affect outdoor activity and utility costs.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-safety-risk-sum-heat', 'Extreme heat', 'high', 'Summer heat is the dominant environmental risk.');


INSERT INTO public.premium_transport_airports (destination_id, destination_key, record_key, summary, name, public_transit_available)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-transport-1', 'Major international airport inside the Lisbon urban area with metro/taxi/rideshare access and a broad network spanning Europe, Africa, North America, South America and the Middle East.', NULL, NULL),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-transport-2', 'Dense multimodal system makes car-free living realistic in many central neighborhoods.', NULL, NULL),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-transport-1', 'Primary major airport south of New Braunfels; practical for most national trips.', NULL, NULL),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-transport-2', 'Major airport north of New Braunfels; useful alternative depending on route and traffic.', NULL, NULL),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-transport-3', 'Downtown/Gruene can be explored on foot, but most residential and shopping trips are car-oriented.', NULL, NULL),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-transport-1', 'Major domestic/international airport serving the Las Vegas Valley, with extensive nonstop U.S. service plus international links including Europe, Canada, Mexico, Central America and Asia.', NULL, NULL),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-transport-2', 'Excellent internal trail system but daily errands are generally easiest by car; Downtown Summerlin is the strongest walkable node.', NULL, NULL);


INSERT INTO public.premium_connectivity_remote_work (destination_id, destination_key, record_key, remote_work_notes, avg_download_mbps, us_time_zone_fit)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-remote-work-1', NULL, NULL, NULL),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-remote-work-1', NULL, NULL, NULL),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-remote-work-1', NULL, NULL, NULL);


INSERT INTO public.premium_reality_check (destination_id, destination_key, record_key, title, detail, severity)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-reality-check-lisbon-pt-reality-1', 'Housing is the pressure point', 'Central Lisbon rents and purchase prices are high relative to local incomes and no longer fit the old ''cheap Europe'' stereotype.', 'high'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-reality-check-lisbon-pt-reality-2', 'The hills are real', 'Steep grades and polished calçada paving can be difficult for mobility, strollers and some older residents.', 'medium'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-reality-check-lisbon-pt-reality-3', 'Old buildings vary dramatically', 'Elevators, insulation, heating/cooling and soundproofing should never be assumed in historic housing.', 'medium'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-reality-check-lisbon-pt-reality-4', 'Bureaucracy rewards preparation', 'NIF, residency, banking and document processes are manageable but can involve appointments and changing procedures.', 'medium'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-reality-check-lisbon-pt-reality-5', 'Tourist Lisbon is not daily-life Lisbon', 'Neighborhood choice changes the experience; central nightlife/tourist zones can be noisy and crowded.', 'medium'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-reality-check-new-braunfels-tx-us-reality-1', 'Summer heat is not a footnote', 'Long stretches of 90s–100°F weather materially affect outdoor routines and utility use.', 'high'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-reality-check-new-braunfels-tx-us-reality-2', 'Flood exposure matters', 'River and flash-flood risk varies by property; buyers and renters should check parcel-specific flood information.', 'high'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-reality-check-new-braunfels-tx-us-reality-3', 'Growth has changed traffic', 'Rapid population growth and I-35/FM corridors can make short distances slower than the map suggests.', 'medium'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-reality-check-new-braunfels-tx-us-reality-4', 'Tourism changes the feel', 'Gruene and river corridors can be crowded during peak weekends and summer.', 'medium'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-reality-check-new-braunfels-tx-us-reality-5', 'Most neighborhoods require a car', 'Downtown and Gruene are exceptions; the broader city remains automobile-oriented.', 'medium'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-reality-check-summerlin-nv-us-reality-1', 'Summer heat dictates the calendar', 'Extreme desert heat makes midday outdoor activity impractical for part of the year.', 'high'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-reality-check-summerlin-nv-us-reality-2', 'It is still a car-oriented suburb', 'Trails are excellent, but most errands and regional trips are easier by car.', 'medium'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-reality-check-summerlin-nv-us-reality-3', 'You pay a location premium', 'Summerlin housing often costs more than many other Las Vegas Valley neighborhoods.', 'medium'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-reality-check-summerlin-nv-us-reality-4', 'Water is a long-term desert issue', 'Landscaping and conservation rules matter in Southern Nevada.', 'medium'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-reality-check-summerlin-nv-us-reality-5', 'Village choice matters', 'A 55+ golf community, luxury gated enclave and Downtown Summerlin apartment produce very different lifestyles.', 'medium');


INSERT INTO public.premium_sources (destination_id, destination_key, source_key, source_name, source_url, source_type)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-tourism', 'Visit Lisboa', 'https://www.visitlisboa.com/en', 'official tourism'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-gov-residency', 'Portugal Government - Reside in Portugal', 'https://www.gov.pt/guias/residir-em-portugal', 'government'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-gov-health', 'Portugal Government - Migrant Healthcare', 'https://www.gov.pt/guias/migrantes-cuidados-de-saude-em-portugal', 'government'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-tax', 'Portuguese Tax Authority', 'https://info.portaldasfinancas.gov.pt/en/', 'government'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-cuf', 'CUF', 'https://www.cuf.pt/', 'healthcare'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-ilga', 'ILGA Portugal', 'https://ilga-portugal.pt/', 'community organization'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-air-quality', 'QualAr / Air Quality', 'https://apambiente.pt/ar-e-ruido/qualidade-do-ar-0', 'government'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-events', 'Lisbon Festivities', 'https://www.visitlisboa.com/en/events/lisbon-festivities-1', 'official tourism'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-airport', 'Lisbon Airport Airlines & Destinations', 'https://www.ana.pt/en/content-topic/airlines', 'airport'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-pets-dgav', 'DGAV - Dogs and Cats Entry', 'https://www.dgav.pt/vaiviajar/conteudo/conteudo-animais-de-companhia/entrar-em-portugal-a-partir-de-um-pais-fora-da-ue-inclui-o-reino-unido-exceto-a-irlanda-do-norte/caes-e-gatos/', 'government'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-pet-arrival', 'DGAV - Arrival Notice Dogs and Cats', 'https://www.dgav.pt/vaiviajar/conteudo/conteudo-animais-de-companhia/entrar-em-portugal-a-partir-de-um-pais-fora-da-ue-inclui-o-reino-unido-exceto-a-irlanda-do-norte/caes-e-gatos/aviso-de-chegada-como-fazer/', 'government'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-moving-home', 'ePortugal - Moving to a New Home', 'https://eportugal.gov.pt/en/guias/moving-to-a-new-home', 'government'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-climate', 'IPMA Lisboa / Instituto Geofísico 1991-2020', 'https://www.ipma.pt/bin/file.data/climate-normal/cn_91-20_LISBOA_GEOFISICO.pdf', 'government'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-cuf-2', 'CUF Lisbon Hospitals', 'https://www.cuf.pt/en', 'healthcare'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-luz', 'Hospital da Luz Lisboa', 'https://www.hospitaldaluz.pt/lisboa/en/', 'healthcare'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-nightlife', 'Lux Frágil', 'https://www.luxfragil.com/en/antes-durante-depois', 'venue'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-city', 'City of New Braunfels', 'https://www.newbraunfels.gov/', 'government'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-census', 'U.S. Census QuickFacts', 'https://www.census.gov/quickfacts/fact/table/newbraunfelscitytexas', 'government'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-tourism', 'New Braunfels Tourism', 'https://www.playinnewbraunfels.com/', 'official tourism'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-veramendi', 'Veramendi', 'https://veramenditx.com/', 'official community'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-baptist', 'Resolute Baptist Hospital', 'https://www.baptisthealthsystem.com/locations/detail/resolute-baptist-hospital', 'healthcare'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-watershed', 'New Braunfels Watershed Protection', 'https://newbraunfels.gov/1914/Watershed-Protection', 'government'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-parking', 'Downtown Parking', 'https://www.newbraunfels.gov/4070/Downtown-Parking', 'government'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-emergency', 'Emergency Communication', 'https://www.newbraunfels.gov/4107/Emergency-Communication', 'government'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-wurstfest', 'Wurstfest', 'https://wurstfest.com/', 'official event'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-pets', 'Animal Welfare Resources', 'https://www.newbraunfels.gov/QuickLinks.aspx?CID=224', 'government'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-dogpark', 'Puppy Playland Dog Park', 'https://newbraunfels.gov/facilities/facility/details/Puppy-Playland-Dog-Park-31', 'government'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-park-rules', 'Park Rules and Policies', 'https://www.newbraunfels.gov/3615/Park-Rules-and-Policies', 'government'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-parks', 'Parks & Recreation', 'https://www.newbraunfels.gov/3286/Parks-Recreation', 'government'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-zipp', 'Zipp Family Sports Park', 'https://newbraunfels.gov/4192/Zipp-Family-Sports-Park', 'government'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-climate-proxy', 'NWS Austin/San Antonio Climate Normals', 'https://www.weather.gov/ewx/climate', 'government'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-christus', 'CHRISTUS Health New Braunfels', 'https://www.christushealth.org/locations/santa-rosa-hospital-new-braunfels', 'healthcare'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-culture', 'Visit New Braunfels Arts & Culture', 'https://www.visitnbtx.com/directory/category/things-to-do/arts-culture', 'official tourism'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sum-official', 'Summerlin', 'https://summerlin.com/', 'official community'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sum-hospital', 'Summerlin Hospital', 'https://www.summerlinhospital.com/', 'healthcare'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sum-blm', 'Red Rock Canyon NCA', 'https://www.blm.gov/programs/national-conservation-lands/nevada/red-rock-canyon', 'government'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sum-water', 'Las Vegas Valley Water District', 'https://www.lvvwd.com/', 'utility'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sum-water-quality', 'LVVWD Water Quality Reports', 'https://www.lvvwd.com/water-quality/reports/index.html', 'utility'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sum-explore', 'Summerlin Explore', 'https://summerlin.com/explore/', 'official community'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sum-events', 'Summerlin Events', 'https://summerlin.com/experience/events/', 'official community'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sum-festival-arts', 'Summerlin Festival of Arts', 'https://summerlin.com/experience/events/festival-of-arts/', 'official event'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sum-airport', 'Harry Reid International Airport Airlines', 'https://www.harryreidairport.com/flights/airlines?menu=true', 'airport'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sum-animal', 'Animal Protection Services', 'https://www.lasvegasnevada.gov/Government/Departments/Public-Safety/Animal-Protection-Services', 'government'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sum-parks', 'Summerlin Parks', 'https://summerlin.com/explore/parks/', 'official community'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sum-downtown', 'Summerlin Experience', 'https://summerlin.com/experience/', 'official community'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sum-amenities', 'Summerlin Amenities', 'https://summerlin.com/amenities/', 'official community'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sum-climate-proxy', 'NOAA/NCEI Las Vegas McCarran AP 1991-2020', 'https://www.ncei.noaa.gov/access/services/data/v1?dataset=normals-monthly-1991-2020&endDate=9996-12-31&format=pdf&startDate=0001-01-01&stations=USW00023169', 'government'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sum-hospital-er', 'ER at South Summerlin', 'https://www.summerlinhospital.com/services/emergency-department/er-at-south-summerlin', 'healthcare'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sum-dining', 'Red Rock Resort Restaurants', 'https://redrockresort.com/eat-and-drink/restaurants/', 'official venue'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sum-nightlife', 'Red Rock Resort Bars & Lounges', 'https://redrockresort.com/eat-and-drink/bars-and-lounges/', 'official venue'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sum-coffee', 'Summerlin Coffee / Dining Directory', 'https://summerlin.com/experience/', 'official community');


INSERT INTO public.premium_move_checklist (destination_id, destination_key, checklist_key, summary, checklist_notes)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-move-1', 'Confirm legal stay route', 'Use current Portuguese government guidance for the applicable visa/residence pathway.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-move-2', 'Obtain NIF / tax guidance', 'Coordinate NIF, Portuguese tax residency and U.S. cross-border obligations before a permanent move.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-move-3', 'Inspect building realities', 'Confirm elevator, insulation, heating/cooling, noise, stairs and accessibility in person before signing.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-move-4', 'Plan utility transfers', 'Arrange electricity, water, gas where applicable, telecom and address changes using current provider/government guidance.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-move-5', 'Set up healthcare coverage', 'Confirm public-system eligibility/registration and maintain private/international cover as needed during transition.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-move-6', 'Plan banking and payments', 'Check documentation requirements for banking and keep an interim payment method while accounts are established.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-move-7', 'Test neighborhood mobility', 'Walk hills, transit connections and daily errands from the exact building, not just the neighborhood center.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-move-8', 'Complete DGAV pet-entry steps', 'If bringing pets from outside the EU, complete microchip/rabies/document requirements and arrival notification where required.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-move-9', 'Create a document file', 'Keep passport, visa/residence, tax, housing, insurance and certified/translated documents organized before appointments.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-move-10', 'Trial the city in different seasons', 'If possible, experience both summer crowd/heat conditions and wetter winter months before a permanent neighborhood decision.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-move-1', 'Compare workbook neighborhoods', 'Match walkability, river/flood exposure, schools, golf, commute and housing type before choosing an area.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-move-2', 'Check flood exposure', 'Verify property-specific FEMA flood maps and insurance before signing or buying.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-move-3', 'Test I-35 commute at real hours', 'Drive likely commute/shopping routes during weekday peaks and tourist weekends.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-move-4', 'Review downtown/river parking rules', 'Understand paid downtown parking and seasonal river-parking permits before relying on central parking.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-move-5', 'Confirm pet rules', 'Check landlord/HOA pet terms, rabies/registration requirements and preferred vet/emergency-vet access.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-move-6', 'Choose primary healthcare anchors', 'Map preferred hospital, urgent care and primary-care options before moving.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-move-7', 'Prepare for heat and flood season', 'Plan cooling, river/weather alerts and severe-weather procedures before summer.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-move-8', 'Set up address-specific utilities', 'Confirm water/electric/internet providers and activation timing for the exact address.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-move-9', 'Complete Texas resident vehicle steps', 'Verify current Texas DPS/DMV requirements for license, insurance and registration.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-move-10', 'Visit during river/event season', 'Experience the city during a busy river or festival period before committing to a neighborhood near visitor corridors.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sum-move-1', 'Compare villages and HOA rules', 'Match golf, age restrictions, schools, trails, new-build/resale and HOA costs.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sum-move-2', 'Test summer conditions', 'Experience Summerlin during peak heat before committing if heat tolerance is uncertain.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sum-move-3', 'Review water/landscape rules', 'Understand LVVWD conservation rules and HOA landscape requirements before buying or remodeling.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sum-move-4', 'Test real drive times', 'Drive likely routes to airport, medical care, work and the Strip during normal peak periods.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sum-move-5', 'Map healthcare anchors', 'Choose preferred hospital, specialists, urgent care and pharmacy access from the selected village.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sum-move-6', 'Complete Nevada resident vehicle steps', 'Verify current Nevada DMV requirements for license, insurance and vehicle registration.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sum-move-7', 'Check pet/HOA rules', 'Confirm landlord/HOA pet restrictions, nearby veterinary care and dog-park/trail rules.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sum-move-8', 'Compare age-restricted options', 'If 55+, compare Sun City Summerlin and other age-qualified communities against unrestricted villages.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sum-move-9', 'Check amenity proximity', 'Map parks, trails, golf, groceries, dining and community centers from the exact address.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sum-move-10', 'Set up utilities / cooling readiness', 'Confirm providers, HVAC condition, energy costs and emergency cooling plan before summer occupancy.');


INSERT INTO public.premium_events_seasonality (destination_id, destination_key, event_seasonality_key, summary, seasonality_notes)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-festas', 'Citywide festivities centered on June and St. Anthony, with street entertainment, concerts, neighborhood parties and the Avenida da Liberdade parade.', 'Warm early-summer conditions; crowded historic neighborhoods.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lis-summer-peak', 'Central Lisbon experiences strong visitor demand, fuller attractions and higher pressure on popular districts during summer.', 'Warm to hot, dry conditions; heat waves possible.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-wurstfest', 'Ten-day German/Texan cultural festival near the Comal River with food, music, dancing and entertainment.', 'Pleasant fall conditions are typical, but verify forecast.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'nb-river-season', 'Warm-weather river recreation drives visitor activity around the Comal and Guadalupe corridors.', 'Hot weather makes water recreation attractive; heat exposure is significant.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sum-festival-arts', 'Annual juried fine-arts festival at Downtown Summerlin; the 2026 event is scheduled for October 9–11 and features 100+ artists.', 'Fall temperatures are substantially more comfortable than midsummer.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'sum-summer-heat', 'Summer heat materially changes outdoor routines; residents often shift exercise and recreation to early morning, evening or indoor/pool settings.', 'Extreme desert heat is the defining seasonal constraint.');


INSERT INTO public.premium_lgbtq_inclusivity (destination_id, destination_key, position, summary, cultural_notes)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 1, 'Legal framework plus visible community infrastructure supports a strong qualitative rating', 'Visible community and social scene, especially around Príncipe Real and central Lisbon'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 1, 'Best presented with current legal and community sources rather than a fake numeric score', 'Local scene is smaller than major metros'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 1, 'Strong metro access, but Summerlin should not be described as the center of the scene', 'Most dedicated nightlife/community venues are elsewhere in the Las Vegas Valley');


INSERT INTO public.premium_language_integration (destination_id, destination_key, position, summary, english_support)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 1, 'Long-term integration improves with Portuguese.', 'Yes, especially centrally'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 1, 'English is the everyday operating language.', 'Yes'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 1, 'English is the everyday operating language.', 'Yes');


INSERT INTO public.premium_pets (destination_id, destination_key, position, summary, pet_friendly_notes)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 1, 'Pet-friendly rental availability varies by landlord/building; confirm written pet permission before signing.', 'Lisbon has urban parks and dog-friendly outdoor space, but local leash/access rules vary by municipality/site.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 1, 'Pet policies vary by landlord/HOA; verify breed/size/deposit restrictions before signing.', 'Puppy Playland Dog Park has separate small-dog, large-dog and agility sections; city parks generally require leashes and restrict pets from certain waterways.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 1, 'HOA and landlord pet restrictions vary materially by village/building; confirm in writing.', 'Summerlin''s park/trail network supports pet owners; exact leash and dog-park rules depend on the facility/jurisdiction.');


INSERT INTO public.premium_family_education (destination_id, destination_key, position, summary, schools_summary)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 1, 'Large-city education, culture, parks and international-school options.', 'Multiple universities'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 1, 'Family-oriented city with parks, river recreation, schools and access to larger metro resources.', 'Regional access in San Antonio/Austin'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 1, 'Master-planned neighborhoods, parks, schools, sports and Valley amenities.', 'UNLV in metro');


INSERT INTO public.premium_community_social (destination_id, destination_key, position, summary, social_notes)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 1, 'Large international population plus strong neighborhood culture.', 'Extensive'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 1, 'Strong local identity around rivers, German-Texas heritage, music and civic events.', 'Many local/civic groups'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 1, 'Planned-village social life, golf, fitness and broader Las Vegas networks.', 'Many');


INSERT INTO public.premium_accessibility (destination_id, destination_key, position, summary, mobility_notes)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 1, 'Neighborhood/building selection is crucial for limited mobility.', 'Mixed'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 1, 'Car access is important outside central pockets.', 'Generally modern U.S. accessibility in newer/public facilities'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 1, 'Modern construction helps; driving is still important.', 'Generally strong in modern development');


INSERT INTO public.premium_bureaucracy_setup (destination_id, destination_key, position, summary, setup_notes)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 1, 'Obtain a Portuguese tax identification number because it is commonly needed for contracts, banking, property and tax administration.', 'Identity/passport; address and other documentation depending on status'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 2, 'Confirm the correct current visa/residence path before moving; immigration rules and responsible agencies can change.', 'Passport; visa/residence documents; proof required by route'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 3, 'After securing housing, arrange electricity, water, gas where applicable, communications and address updates. ePortugal provides a moving-home checklist.', 'Lease/property documents; ID; account information'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 4, 'Confirm eligibility and registration for public healthcare and maintain appropriate private/international cover as needed during transition.', 'Identity; residence documentation; healthcare/insurance documents'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 5, 'For pets arriving from outside the EU, complete DGAV health-entry requirements and notify the Traveller Entry Point in advance when required.', 'Microchip/vaccination/health documentation'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 1, 'Set up housing, utilities and local services after lease/purchase; exact utility providers depend on address.', 'Lease/closing documents; ID; account information'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 2, 'New Texas residents should verify current Texas DPS/DMV deadlines and documentation for license and vehicle registration.', 'Identity; residency; insurance; vehicle documents'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 3, 'Before buying or signing a long lease near waterways, check flood maps and insurance implications.', 'Property address; insurance quote'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 4, 'Understand downtown paid-parking rules and any resident river-parking permits relevant to your routine.', 'Vehicle information; residency proof where required'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 5, 'Register mobile numbers for regional emergency alerts, especially useful for flood and severe-weather events.', 'Phone/contact information'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 1, 'Review HOA, age restrictions, architectural standards, fees and community rules before buying or leasing.', 'HOA documents; lease/purchase documents'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 2, 'New Nevada residents should verify current DMV deadlines and required documents for license and registration.', 'Identity; residency; insurance; vehicle documents'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 3, 'Understand Southern Nevada water-conservation restrictions and landscaping realities before choosing or modifying a property.', 'Property/HOA information'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 4, 'Set up utility and communications accounts for the exact Summerlin address; providers depend on jurisdiction and property.', 'Lease/closing documents; ID'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 5, 'Plan cooling, vehicle, outdoor activity and emergency-preparedness routines before the first extreme-heat season.', 'No formal documents');


INSERT INTO public.premium_work_business (destination_id, destination_key, position, summary, remote_work_notes)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 1, 'International and Portuguese labor market', 'Excellent for remote work where status permits'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 1, 'Access to San Antonio/Austin labor markets', 'Good with reliable broadband'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 1, 'Part of Las Vegas Valley labor market', 'Excellent residential remote-work base');


INSERT INTO public.premium_retirement_aging (destination_id, destination_key, position, summary, aging_notes)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 1, 'Coordinate visa, tax, healthcare and accessibility planning.', 'Private/residential options exist'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 1, 'Strong Hill Country lifestyle with metro access.', 'Available locally/regionally'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 1, 'Strong retirement infrastructure; summer heat matters.', 'Extensive Valley market');


INSERT INTO public.premium_lifestyle_laws (destination_id, destination_key, position, summary, legal_notes)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 1, 'Non-commercial pet entry is allowed when current animal-health requirements are met.', 'Dogs/cats require identification and valid rabies compliance; origin-specific documentation/testing may apply; rules were updated effective 22 April 2026.'),
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 2, 'Long-term residence requires the appropriate current legal route.', 'Use current Portuguese government guidance for visa/residence status; do not rely on outdated expat summaries.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 1, 'Pets are allowed subject to city park rules.', 'Pets must remain leashed; city rules prohibit pets in specified waterways/areas including Comal Springs and waterways in Landa/Fischer parks.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 2, 'Local river rules regulate disposable containers during recreation.', 'City ordinance Chapter 86.14 prohibits beverages and food in disposable containers on the river; verify current river rules before recreation.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 1, 'Pet ownership is subject to local animal-protection rules in the applicable Las Vegas/Clark County jurisdiction.', 'Keep identification current; local animal-protection guidance strongly encourages tags and microchipping and enforces animal ordinances.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 2, 'Southern Nevada properties operate under regional water-conservation requirements.', 'Verify current seasonal watering days, turf/landscape rules and HOA standards before landscaping changes.');


INSERT INTO public.premium_environment_quality (destination_id, destination_key, summary, quality_notes)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'Portugal''s environmental agency operates the QualAr system for near-real-time monitoring and forecasting of air quality, with pollutant concentrations and indices available by monitoring station/zone.', NULL),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', NULL, 'The City of New Braunfels maintains a watershed-protection program for Dry Comal Creek and the Comal River after monitoring identified bacteria concerns; the EPA-approved plan uses ongoing monitoring and mitigation.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', NULL, 'Las Vegas Valley Water District states that Las Vegas drinking water meets or surpasses safety standards and publishes annual water-quality reports.');


INSERT INTO public.premium_daily_life_practicality (destination_id, destination_key, summary, practicality_notes)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'Strong grocery/market access in established neighborhoods, with neighborhood markets and supermarkets widely available.', 'A neighborhood that feels close on a map may involve steep grades; building age, elevators, insulation and noise can matter as much as square footage.'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'Strong everyday grocery access through local and major retail corridors.', 'New Braunfels is much more car-dependent outside Downtown/Gruene than its visitor image suggests; summer heat and tourism materially change day-to-day rhythms.'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'Strong grocery and daily-retail access through village centers, neighborhood shopping centers and Downtown Summerlin.', 'The polished landscaping can obscure the fact that this is still a water-constrained desert community; outdoor schedules shift dramatically in summer.');


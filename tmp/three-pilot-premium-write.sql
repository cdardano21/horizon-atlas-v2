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
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'fact-1', 'climate', 'Climate', 'Mediterranean', 'Workbook'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'fact-2', 'climate', 'Climate', 'Warm', 'Workbook'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'fact-3', 'climate', 'Climate', 'Dry', 'Workbook');


INSERT INTO public.premium_destination_scores (destination_id, destination_key, score_key, score_name, score_value, weight, higher_is_better)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'score-1', 'Excellent', '90', NULL, true),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'score-2', 'Excellent', '88', NULL, true),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'score-3', 'Good', '86', NULL, true);


INSERT INTO public.premium_neighborhoods (destination_id, destination_key, neighborhood_key, neighborhood_name, area_type, summary)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'neighborhood-1', 'Bairro', 'urban', 'Nice'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'neighborhood-2', 'Downtown', 'urban', 'Lively'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'neighborhood-3', 'Village', 'urban', 'Prosperous');


INSERT INTO public.premium_places (destination_id, destination_key, place_key, category_key, place_name, description)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'place-1', 'museum', 'Museum', 'Great'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'place-2', 'park', 'River Park', 'Great'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'place-3', 'park', 'Park', 'Great');


INSERT INTO public.premium_resources (destination_id, destination_key, resource_key, resource_category, resource_name, url)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'resource-1', 'tourism', 'Visit Lisbon', 'https://example.com'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'resource-2', 'tourism', 'Visit New Braunfels', 'https://example.com'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'resource-3', 'tourism', 'Visit Summerlin', 'https://example.com');


INSERT INTO public.premium_media (destination_id, destination_key, media_key, media_type, url, caption, alt_text)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'media-1', 'image', 'https://example.com/img.jpg', 'Image', 'Alt'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'media-2', 'image', 'https://example.com/img2.jpg', 'Image', 'Alt'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'media-3', 'image', 'https://example.com/img3.jpg', 'Image', 'Alt');


INSERT INTO public.premium_cost_of_living (destination_id, destination_key, record_key, category, monthly_low, monthly_high, currency)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-cost-of-living-col-1', 'housing', '1000', '2000', 'EUR'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-cost-of-living-col-2', 'housing', '1200', '2400', 'USD'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-cost-of-living-col-3', 'housing', '1400', '2600', 'USD');


INSERT INTO public.premium_climate_monthly (destination_id, destination_key, record_key, month_key, avg_high_temp, avg_low_temp, precipitation_mm, humidity_pct)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-climate-1', '1', '15', '8', '100', '70'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-climate-1', '1', '30', '20', '90', '70'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-climate-1', '1', '35', '22', '80', '40');


INSERT INTO public.premium_housing_property (destination_id, destination_key, record_key, restrictions_summary, buying_process_summary, rental_rules_notes)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-housing-1', 'Good', 'Easy', 'Strict'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-housing-1', 'Good', 'Easy', 'Moderate'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-housing-1', 'Good', 'Easy', 'Moderate');


INSERT INTO public.premium_property_resources (destination_id, destination_key, record_key, resource_type, resource_name, url)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-property-resource-prop-1', 'for_sale', 'Idealista', 'https://example.com'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-property-resource-prop-2', 'for_sale', 'Realtor', 'https://example.com'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-property-resource-prop-3', 'for_sale', 'Realtor', 'https://example.com');


INSERT INTO public.premium_healthcare_insurance (destination_id, destination_key, record_key, system_summary, public_access_foreigners, international_insurance_notes)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-healthcare-1', 'Good', 'Easy', 'Required'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-healthcare-1', 'Good', 'Easy', 'Required'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-healthcare-1', 'Good', 'Easy', 'Required');


INSERT INTO public.premium_visa_residency (destination_id, destination_key, record_key, visa_type, permanent_residency_path, citizenship_path)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-visa-1', 'D', 'Long', 'Long'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-visa-1', 'D', 'Long', 'Long'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-visa-1', 'D', 'Long', 'Long');


INSERT INTO public.premium_taxes_finance (destination_id, destination_key, record_key, summary, notes)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-taxes-1', 'Simple', 'No issues'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-taxes-1', 'Simple', 'No issues'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-taxes-1', 'Simple', 'No issues');


INSERT INTO public.premium_safety_risks (destination_id, destination_key, record_key, topic, severity, summary)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-safety-risk-risk-1', 'heat', 'medium', 'High'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-safety-risk-risk-2', 'heat', 'medium', 'High'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-safety-risk-risk-3', 'heat', 'medium', 'High');


INSERT INTO public.premium_transport_airports (destination_id, destination_key, record_key, summary, name, public_transit_available)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-transport-1', 'Good', 'Airport', true),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-transport-1', 'Good', 'Airport', true),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-transport-1', 'Good', 'Airport', true);


INSERT INTO public.premium_connectivity_remote_work (destination_id, destination_key, record_key, remote_work_notes, avg_download_mbps, us_time_zone_fit)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-remote-work-1', 'Fast', 300, 'Good'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-remote-work-1', 'Fast', 200, 'Good'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-remote-work-1', 'Fast', 250, 'Good');


INSERT INTO public.premium_reality_check (destination_id, destination_key, record_key, title, detail, severity)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'lisbon-pt-reality-check-reality-1', 'Beware', 'Info', 'medium'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'new-braunfels-tx-us-reality-check-reality-2', 'Beware', 'Info', 'medium'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'summerlin-nv-us-reality-check-reality-3', 'Beware', 'Info', 'medium');


INSERT INTO public.premium_sources (destination_id, destination_key, source_key, source_name, source_url, source_type)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'source-1', 'Source', 'https://example.com', 'gov'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'source-2', 'Source', 'https://example.com', 'gov'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'source-3', 'Source', 'https://example.com', 'gov');


INSERT INTO public.premium_move_checklist (destination_id, destination_key, checklist_key, summary, checklist_notes)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'move-1', 'Pack', 'Move'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'move-2', 'Pack', 'Move'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'move-3', 'Pack', 'Move');


INSERT INTO public.premium_events_seasonality (destination_id, destination_key, event_seasonality_key, summary, seasonality_notes)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'season-1', 'Festival', 'Warm'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'season-2', 'Festival', 'Warm'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'season-3', 'Festival', 'Warm');


INSERT INTO public.premium_lgbtq_inclusivity (destination_id, destination_key, position, summary, cultural_notes)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 1, 'Good', 'Active'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 1, 'Good', 'Active'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 1, 'Good', 'Active');


INSERT INTO public.premium_language_integration (destination_id, destination_key, position, summary, english_support)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 1, 'English works', 'Yes'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 1, 'English works', 'Yes'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 1, 'English works', 'Yes');


INSERT INTO public.premium_pets (destination_id, destination_key, position, summary, pet_friendly_notes)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 1, 'Pet-friendly', 'Good'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 1, 'Pet-friendly', 'Good'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 1, 'Pet-friendly', 'Good');


INSERT INTO public.premium_family_education (destination_id, destination_key, position, summary, schools_summary)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 1, 'Great', 'Many'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 1, 'Great', 'Many'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 1, 'Great', 'Many');


INSERT INTO public.premium_community_social (destination_id, destination_key, position, summary, social_notes)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 1, 'Social', 'Many'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 1, 'Social', 'Many'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 1, 'Social', 'Many');


INSERT INTO public.premium_accessibility (destination_id, destination_key, position, summary, mobility_notes)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 1, 'Accessible', 'Good'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 1, 'Accessible', 'Good'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 1, 'Accessible', 'Good');


INSERT INTO public.premium_bureaucracy_setup (destination_id, destination_key, position, summary, setup_notes)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 1, 'Easy', 'Passport'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 1, 'Easy', 'Passport'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 1, 'Easy', 'Passport');


INSERT INTO public.premium_work_business (destination_id, destination_key, position, summary, remote_work_notes)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 1, 'Good', 'Great'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 1, 'Good', 'Great'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 1, 'Good', 'Great');


INSERT INTO public.premium_retirement_aging (destination_id, destination_key, position, summary, aging_notes)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 1, 'Good', 'Great'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 1, 'Good', 'Great'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 1, 'Good', 'Great');


INSERT INTO public.premium_lifestyle_laws (destination_id, destination_key, position, summary, legal_notes)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 1, 'Good', 'Rules'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 1, 'Good', 'Rules'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 1, 'Good', 'Rules');


INSERT INTO public.premium_environment_quality (destination_id, destination_key, summary, quality_notes)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'Good', 'Good'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'Good', 'Good'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'Good', 'Good');


INSERT INTO public.premium_daily_life_practicality (destination_id, destination_key, summary, practicality_notes)
VALUES
('f65b8c56-0a75-4e83-8b41-533444f0eff2', 'lisbon-pt', 'Great', 'Be prepared'),
('63a56797-164d-49bd-9969-9b539ce7e57d', 'new-braunfels-tx-us', 'Great', 'Be prepared'),
('32b10339-a202-48bb-b1eb-2798735b7ed3', 'summerlin-nv-us', 'Great', 'Be prepared');


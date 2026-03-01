-- ============================================================
-- Security Hardening: Function Search Paths + RLS Policy Cleanup
--
-- Part 1: Fix search_path = public on all public functions
--   Prevents search path manipulation attacks (Supabase linter:
--   function_search_path_mutable).
--
-- Part 2: Replace overly-permissive USING (true) write policies
--   All app writes go through supabaseAdmin (service role key),
--   which bypasses RLS entirely — so ALL/INSERT/UPDATE policies
--   on the authenticated role are redundant and trigger the
--   rls_policy_always_true linter warning.
--   We keep SELECT USING (true) policies for read access via
--   authenticated PostgREST (the linter ignores SELECT policies).
-- ============================================================


-- ============================================================
-- Part 1: Fix Function Search Path (all public functions)
-- ============================================================

DO $$
DECLARE
  func_record RECORD;
  fixed_count INT := 0;
BEGIN
  FOR func_record IN
    SELECT n.nspname AS schema_name,
           p.proname AS func_name,
           p.oid,
           pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.prokind IN ('f', 'p')
      AND NOT EXISTS (
        SELECT 1 FROM unnest(COALESCE(p.proconfig, '{}')) AS config
        WHERE config LIKE 'search_path=%'
      )
  LOOP
    EXECUTE format(
      'ALTER FUNCTION %I.%I(%s) SET search_path = public',
      func_record.schema_name,
      func_record.func_name,
      func_record.args
    );
    fixed_count := fixed_count + 1;
    RAISE NOTICE 'Fixed search_path for %.%(%)',
      func_record.schema_name, func_record.func_name, func_record.args;
  END LOOP;
  RAISE NOTICE 'Total functions fixed: %', fixed_count;
END
$$;


-- ============================================================
-- Part 2: Replace permissive write policies with SELECT-only
-- ============================================================

-- admin_audit_logs
DROP POLICY IF EXISTS "Service role can access admin_audit_logs"    ON "public"."admin_audit_logs";
DROP POLICY IF EXISTS "Authenticated access admin_audit_logs"       ON "public"."admin_audit_logs";
CREATE POLICY "Authenticated read admin_audit_logs"                 ON "public"."admin_audit_logs"
  FOR SELECT TO authenticated USING (true);

-- ai_specials_ingredients
DROP POLICY IF EXISTS "Allow all operations"                        ON "public"."ai_specials_ingredients";
DROP POLICY IF EXISTS "Authenticated access ai_specials_ingredients" ON "public"."ai_specials_ingredients";
CREATE POLICY "Authenticated read ai_specials_ingredients"          ON "public"."ai_specials_ingredients"
  FOR SELECT TO authenticated USING (true);

-- compliance_records
DROP POLICY IF EXISTS "Allow all operations"                        ON "public"."compliance_records";
DROP POLICY IF EXISTS "Authenticated access compliance_records"     ON "public"."compliance_records";
CREATE POLICY "Authenticated read compliance_records"               ON "public"."compliance_records"
  FOR SELECT TO authenticated USING (true);

-- compliance_types
DROP POLICY IF EXISTS "Allow all operations"                        ON "public"."compliance_types";
DROP POLICY IF EXISTS "Authenticated access compliance_types"       ON "public"."compliance_types";
CREATE POLICY "Authenticated read compliance_types"                 ON "public"."compliance_types"
  FOR SELECT TO authenticated USING (true);

-- customers
DROP POLICY IF EXISTS "POS Insert Access"                           ON "public"."customers";
DROP POLICY IF EXISTS "POS Update Access"                           ON "public"."customers";
DROP POLICY IF EXISTS "Authenticated insert customers"              ON "public"."customers";
DROP POLICY IF EXISTS "Authenticated update customers"              ON "public"."customers";
DROP POLICY IF EXISTS "Authenticated read customers"                ON "public"."customers";
CREATE POLICY "Authenticated read customers"                        ON "public"."customers"
  FOR SELECT TO authenticated USING (true);

-- dish_sections
DROP POLICY IF EXISTS "Allow all operations"                        ON "public"."dish_sections";
DROP POLICY IF EXISTS "Authenticated access dish_sections"          ON "public"."dish_sections";
CREATE POLICY "Authenticated read dish_sections"                    ON "public"."dish_sections"
  FOR SELECT TO authenticated USING (true);

-- feature_tier_mapping
DROP POLICY IF EXISTS "Service role can access feature_tier_mapping" ON "public"."feature_tier_mapping";
DROP POLICY IF EXISTS "Authenticated access feature_tier_mapping"   ON "public"."feature_tier_mapping";
CREATE POLICY "Authenticated read feature_tier_mapping"             ON "public"."feature_tier_mapping"
  FOR SELECT TO authenticated USING (true);

-- kitchen_sections
DROP POLICY IF EXISTS "Allow all operations"                        ON "public"."kitchen_sections";
DROP POLICY IF EXISTS "Authenticated access kitchen_sections"       ON "public"."kitchen_sections";
CREATE POLICY "Authenticated read kitchen_sections"                 ON "public"."kitchen_sections"
  FOR SELECT TO authenticated USING (true);

-- menu_dishes
DROP POLICY IF EXISTS "Allow all operations"                        ON "public"."menu_dishes";
DROP POLICY IF EXISTS "Authenticated access menu_dishes"            ON "public"."menu_dishes";
CREATE POLICY "Authenticated read menu_dishes"                      ON "public"."menu_dishes"
  FOR SELECT TO authenticated USING (true);

-- order_items
DROP POLICY IF EXISTS "Allow all operations"                        ON "public"."order_items";
DROP POLICY IF EXISTS "Authenticated access order_items"            ON "public"."order_items";
CREATE POLICY "Authenticated read order_items"                      ON "public"."order_items"
  FOR SELECT TO authenticated USING (true);

-- pos_modifier_options
DROP POLICY IF EXISTS "Enable all access for anon"                  ON "public"."pos_modifier_options";
DROP POLICY IF EXISTS "Authenticated access pos_modifier_options"   ON "public"."pos_modifier_options";
CREATE POLICY "Authenticated read pos_modifier_options"             ON "public"."pos_modifier_options"
  FOR SELECT TO authenticated USING (true);

-- prep_list_items
DROP POLICY IF EXISTS "Allow all operations"                        ON "public"."prep_list_items";
DROP POLICY IF EXISTS "Authenticated access prep_list_items"        ON "public"."prep_list_items";
CREATE POLICY "Authenticated read prep_list_items"                  ON "public"."prep_list_items"
  FOR SELECT TO authenticated USING (true);

-- recipe_ingredients
DROP POLICY IF EXISTS "Allow all operations"                        ON "public"."recipe_ingredients";
DROP POLICY IF EXISTS "Authenticated access recipe_ingredients"     ON "public"."recipe_ingredients";
CREATE POLICY "Authenticated read recipe_ingredients"               ON "public"."recipe_ingredients"
  FOR SELECT TO authenticated USING (true);

-- recipe_items
DROP POLICY IF EXISTS "Allow all operations"                        ON "public"."recipe_items";
DROP POLICY IF EXISTS "Authenticated access recipe_items"           ON "public"."recipe_items";
CREATE POLICY "Authenticated read recipe_items"                     ON "public"."recipe_items"
  FOR SELECT TO authenticated USING (true);

-- sales_data
DROP POLICY IF EXISTS "Allow all operations"                        ON "public"."sales_data";
DROP POLICY IF EXISTS "Authenticated access sales_data"             ON "public"."sales_data";
CREATE POLICY "Authenticated read sales_data"                       ON "public"."sales_data"
  FOR SELECT TO authenticated USING (true);

-- shared_recipes
DROP POLICY IF EXISTS "Allow all operations"                        ON "public"."shared_recipes";
DROP POLICY IF EXISTS "Authenticated access shared_recipes"         ON "public"."shared_recipes";
CREATE POLICY "Authenticated read shared_recipes"                   ON "public"."shared_recipes"
  FOR SELECT TO authenticated USING (true);

-- system_settings
DROP POLICY IF EXISTS "Allow all operations"                        ON "public"."system_settings";
DROP POLICY IF EXISTS "Authenticated access system_settings"        ON "public"."system_settings";
CREATE POLICY "Authenticated read system_settings"                  ON "public"."system_settings"
  FOR SELECT TO authenticated USING (true);

-- tier_config_cache
DROP POLICY IF EXISTS "Service role can access tier_config_cache"   ON "public"."tier_config_cache";
DROP POLICY IF EXISTS "Authenticated access tier_config_cache"      ON "public"."tier_config_cache";
CREATE POLICY "Authenticated read tier_config_cache"                ON "public"."tier_config_cache"
  FOR SELECT TO authenticated USING (true);

-- tier_configurations
DROP POLICY IF EXISTS "Service role can access tier_configurations" ON "public"."tier_configurations";
DROP POLICY IF EXISTS "Authenticated access tier_configurations"    ON "public"."tier_configurations";
CREATE POLICY "Authenticated read tier_configurations"              ON "public"."tier_configurations"
  FOR SELECT TO authenticated USING (true);

-- transactions
DROP POLICY IF EXISTS "Enable all access for anon"                  ON "public"."transactions";
DROP POLICY IF EXISTS "Enable insert for all users"                 ON "public"."transactions";
DROP POLICY IF EXISTS "Enable update for all users"                 ON "public"."transactions";
DROP POLICY IF EXISTS "Authenticated access transactions"           ON "public"."transactions";
CREATE POLICY "Authenticated read transactions"                     ON "public"."transactions"
  FOR SELECT TO authenticated USING (true);

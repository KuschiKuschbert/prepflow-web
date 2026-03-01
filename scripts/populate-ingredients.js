require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample ingredients data (first 20 items for testing)
const ingredientsData = [
  {
    name: 'Burger Patties',
    brand: 'Angel Bay',
    pack_size: 45,
    unit: 'PC',
    cost_per_unit: 2.69,
    trim_peel_waste_percent: 1.0,
    yield_percent: 99.0,
    supplier: 'PFD',
    storage: 'FROZEN',
    product_code: '',
  },
  {
    name: 'Aioli',
    brand: '',
    pack_size: 2500,
    unit: 'ML',
    cost_per_unit: 0.009,
    trim_peel_waste_percent: 1.0,
    yield_percent: 99.0,
    supplier: 'BIDFOOD',
    storage: 'COLDROOM',
    product_code: '',
  },
  {
    name: 'Anchovy Fillets',
    brand: '',
    pack_size: 720,
    unit: 'GM',
    cost_per_unit: 0.018,
    trim_peel_waste_percent: 34.0,
    yield_percent: 66.0,
    supplier: 'PFD',
    storage: 'DRYSTORE',
    product_code: '',
  },
  {
    name: 'Apple Juice',
    brand: '',
    pack_size: 2000,
    unit: 'ML',
    cost_per_unit: 0.002,
    trim_peel_waste_percent: 8.0,
    yield_percent: 92.0,
    supplier: 'PFD',
    storage: 'DRYSTORE',
    product_code: '',
  },
  {
    name: 'Apples',
    brand: '',
    pack_size: 1000,
    unit: 'GM',
    cost_per_unit: 0.004,
    trim_peel_waste_percent: 5.0,
    yield_percent: 95.0,
    supplier: 'GROWERS',
    storage: 'COLDROOM',
    product_code: '',
  },
  {
    name: 'Avocado',
    brand: '',
    pack_size: 1,
    unit: 'PC',
    cost_per_unit: 2.3,
    trim_peel_waste_percent: 16.0,
    yield_percent: 84.0,
    supplier: 'GROWERS',
    storage: 'COLDROOM',
    product_code: '',
  },
  {
    name: 'Balsamic Glaze',
    brand: '',
    pack_size: 500,
    unit: 'GM',
    cost_per_unit: 0.023,
    trim_peel_waste_percent: 34.0,
    yield_percent: 66.0,
    supplier: 'PFD',
    storage: 'DRYSTORE',
    product_code: '',
  },
  {
    name: 'Balsamic Vinegar',
    brand: '',
    pack_size: 5000,
    unit: 'ML',
    cost_per_unit: 0.004,
    trim_peel_waste_percent: 25.0,
    yield_percent: 75.0,
    supplier: 'PFD',
    storage: 'DRYSTORE',
    product_code: '',
  },
  {
    name: 'Banana',
    brand: '',
    pack_size: 1000,
    unit: 'GM',
    cost_per_unit: 0.003,
    trim_peel_waste_percent: 19.0,
    yield_percent: 81.0,
    supplier: 'GROWERS',
    storage: 'FRUIT/VEG',
    product_code: '',
  },
  {
    name: 'Barramundi Fillet Skin Off',
    brand: '',
    pack_size: 5000,
    unit: 'GM',
    cost_per_unit: 0.016,
    trim_peel_waste_percent: 17.0,
    yield_percent: 83.0,
    supplier: 'PFD',
    storage: 'FISH FROZEN',
    product_code: '',
  },
];

async function populateIngredients() {
  try {
    console.log('Starting to populate ingredients...');

    // Insert ingredients in batches
    const { data, error } = await supabase.from('ingredients').insert(ingredientsData);

    if (error) {
      console.error('Error inserting ingredients:', error);
      return;
    }

    console.log(`Successfully inserted ${ingredientsData.length} ingredients!`);
    console.log('Sample ingredients added:');
    ingredientsData.forEach(ingredient => {
      console.log(
        `- ${ingredient.name} (${ingredient.brand || 'No brand'}) - $${ingredient.cost_per_unit}/${ingredient.unit}`,
      );
    });
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the population script
populateIngredients();

/**
 * Seed script — creates admin, categories, and sample products.
 * Usage: node utils/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Category = require('../models/Category');
const Product = require('../models/Product');

const ADMIN_NAME     = process.env.SEED_ADMIN_NAME     || 'Super Admin';
const ADMIN_EMAIL    = process.env.SEED_ADMIN_EMAIL    || 'admin@biolexpharmaceutical.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin@123456';

const CATEGORIES = [
  { name: 'Antibiotics',              description: 'Anti-bacterial and anti-infective pharmaceutical products' },
  { name: 'Ortho & Pain Management',  description: 'Analgesics, NSAIDs, muscle relaxants and orthopaedic products' },
  { name: 'Gastro & Liver Care',      description: 'Gastrointestinal and hepato-protective pharmaceutical products' },
  { name: 'Dermatology',              description: 'Skin care, anti-fungal and dermatological products' },
  { name: 'Pediatric',                description: 'Paediatric medicines, syrups and formulations for children' },
  { name: 'Gynecology',               description: "Gynaecological and women's health products" },
  { name: 'Cardiac & Diabetic',       description: 'Cardiovascular and anti-diabetic pharmaceutical products' },
  { name: 'General Medicine',         description: 'General purpose medicines, vitamins and supplements' },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // ── Admin ─────────────────────────────────────────────────────────────────
    const existing = await Admin.findOne({ email: ADMIN_EMAIL });
    if (!existing) {
      await Admin.create({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
      console.log(`✅ Admin created: ${ADMIN_EMAIL}`);
    } else {
      console.log(`ℹ️  Admin already exists: ${ADMIN_EMAIL}`);
    }

    // ── Categories ────────────────────────────────────────────────────────────
    const categoryMap = {};
    for (const cat of CATEGORIES) {
      let found = await Category.findOne({ name: cat.name });
      if (!found) {
        found = await Category.create(cat);
        console.log(`✅ Category created: ${cat.name}`);
      } else {
        console.log(`ℹ️  Category exists: ${cat.name}`);
      }
      categoryMap[cat.name] = found._id;
    }

    // ── Sample Products (only if DB is empty) ─────────────────────────────────
    const productCount = await Product.countDocuments();
    if (productCount > 0) {
      console.log(`ℹ️  Products already exist (${productCount}). Skipping sample products.`);
    } else {
      const PLACEHOLDER = (label) =>
        `https://placehold.co/400x400/e2e8f0/1e40af?text=${encodeURIComponent(label)}`;

      const sampleProducts = [
        {
          name: 'MOXIBEX-CV Dry Syrup',
          description: 'Amoxicillin and Clavulanate Potassium Dry Syrup — broad-spectrum antibiotic used to treat bacterial infections in children.',
          category: categoryMap['Antibiotics'],
          image: PLACEHOLDER('MOXIBEX-CV'),
          brand: 'Biolex', form: 'Syrup', packagingSize: '30 ml', countryOfOrigin: 'India', isFeatured: true,
        },
        {
          name: 'NAZOLEX PLUS Tablets',
          description: 'Naproxen + Domperidone combination tablet for relief of pain associated with migraines and general pain management.',
          category: categoryMap['Ortho & Pain Management'],
          image: PLACEHOLDER('NAZOLEX PLUS'),
          brand: 'Biolex', form: 'Tablet', packagingSize: '10x10 Blister', countryOfOrigin: 'India', isFeatured: true,
        },
        {
          name: 'NACBIO-MR Tablets',
          description: 'N-Acetylcysteine + Methyl Cobalamin combination tablet for neuro-protection and liver support therapy.',
          category: categoryMap['Gastro & Liver Care'],
          image: PLACEHOLDER('NACBIO-MR'),
          brand: 'Biolex', form: 'Tablet', packagingSize: '10x10 Blister', countryOfOrigin: 'India', isFeatured: false,
        },
        {
          name: 'MECOCLE-PLUS Injection',
          description: 'Methylcobalamin + Pyridoxine + Nicotinamide injection for the treatment of peripheral neuropathy and vitamin B deficiencies.',
          category: categoryMap['General Medicine'],
          image: PLACEHOLDER('MECOCLE-PLUS'),
          brand: 'Biolex', form: 'Injection', packagingSize: '2 ml Ampoule', countryOfOrigin: 'India', isFeatured: true,
        },
        {
          name: 'LYPLUS Syrup',
          description: 'Lycopene + Multivitamin + Multimineral syrup — a comprehensive nutritional supplement for overall health and immunity.',
          category: categoryMap['General Medicine'],
          image: PLACEHOLDER('LYPLUS'),
          brand: 'Biolex', form: 'Syrup', packagingSize: '200 ml', countryOfOrigin: 'India', isFeatured: true,
        },
      ];

      for (const p of sampleProducts) {
        await Product.create(p);
        console.log(`✅ Product created: ${p.name}`);
      }
    }

    console.log('\n🎉 Seed complete!');
    console.log(`   Admin Email   : ${ADMIN_EMAIL}`);
    console.log(`   Admin Password: ${ADMIN_PASSWORD}`);
    console.log('\n⚠️  Change the admin password immediately after first login.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();

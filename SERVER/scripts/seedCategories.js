const Category = require('../models/categories');

/**
 * Parent categories with their subcategories
 * Keep this explicit so it's easy to reason about
 */
const CATEGORIES = [
    {
        name: 'Fiction',
        subs: [
            'Literary Fiction',
            'Science Fiction',
            'Fantasy',
            'Historical Fiction',
            'Short Stories'
        ]
    },
    {
        name: 'Non-Fiction',
        subs: [
            'Biography',
            'Autobiography',
            'Memoir',
            'Essays',
            'Journalism'
        ]
    },
    {
        name: 'Poetry',
        subs: [
            'Free Verse',
            'Haiku',
            'Spoken Word',
            'Narrative Poetry'
        ]
    },
    {
        name: 'Philosophy',
        subs: [
            'Ethics',
            'Existentialism',
            'Political Philosophy',
            'Metaphysics'
        ]
    },
    {
        name: 'Science & Technology',
        subs: [
            'Computer Science',
            'Artificial Intelligence',
            'Physics',
            'Mathematics'
        ]
    },
    {
        name: 'Social Sciences',
        subs: [
            'Sociology',
            'Psychology',
            'Economics',
            'Anthropology'
        ]
    },
    {
        name: 'Education',
        subs: [
            'Academic Papers',
            'Study Guides',
            'Research Methods'
        ]
    },
    {
        name: 'Health & Wellbeing',
        subs: [
          'Mental Health',
          'Public Health',
          'Nutrition',
          'Lifestyle & Habits',
          'Health Essays'
        ]
      }      
];

async function seedCategories() {
    console.log('🌱 Seeding categories...');

    for (const category of CATEGORIES) {
        // 1. Upsert parent category
        const parent = await Category.findOneAndUpdate(
            { name: category.name },
            { name: category.name, parentId: null, enabled: true },
            { upsert: true, new: true }
        );

        console.log(`✔ Parent category: ${parent.name}`);

        // 2. Upsert subcategories
        for (const subName of category.subs) {
            const sub = await Category.findOneAndUpdate(
                { name: subName, parentId: parent._id },
                { name: subName, parentId: parent._id, enabled: true },
                { upsert: true, new: true }
            );

            console.log(`   ↳ Subcategory: ${sub.name}`);
        }
    }

    console.log('✅ Categories seeding completed');
}

module.exports = seedCategories;

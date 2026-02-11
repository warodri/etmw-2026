const Category = require('../models/categories');

/**
 * Parent categories with their subcategories
 * Keep this explicit so it's easy to reason about
 */
const CATEGORIES = [
    {
        name: 'Fiction',
        icon: '📚',
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
        icon: '🎓',
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
        icon: '📜',
        subs: [
            'Free Verse',
            'Haiku',
            'Spoken Word',
            'Narrative Poetry'
        ]
    },
    {
        name: 'Philosophy',
        icon: '🏛️',
        subs: [
            'Ethics',
            'Existentialism',
            'Political Philosophy',
            'Metaphysics'
        ]
    },
    {
        name: 'Science & Technology',
        icon: '🤖',
        subs: [
            'Computer Science',
            'Artificial Intelligence',
            'Physics',
            'Mathematics'
        ]
    },
    {
        name: 'Social Sciences',
        icon: '🧑‍🤝‍🧑',
        subs: [
            'Sociology',
            'Psychology',
            'Economics',
            'Anthropology'
        ]
    },
    {
        name: 'Education',
        icon: '📘',
        subs: [
            'Academic Papers',
            'Study Guides',
            'Research Methods'
        ]
    },
    {
        name: 'Health & Wellbeing',
        icon: '👨‍⚕️',
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
            { icon: category.icon },
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

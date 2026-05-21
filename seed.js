import mongoose from 'mongoose'
import dns from 'dns'
import dotenv from 'dotenv'
import { Product, User, Category, Blog } from './models/index.js'

dotenv.config()

if (process.env.MONGO_URI?.startsWith('mongodb+srv://')) {
  dns.setServers(['8.8.8.8', '8.8.4.4'])
}

const products = [
  { name: 'Desi Gota Biri (Urad Dal)', shortName: 'Desi Gota Biri', description: 'Premium whole urad dal sourced directly from Odisha farms. Rich in protein and fiber, perfect for dal makhani, idli batter and more.', price: 150, weight: '1kg', category: 'Dal', stock: 50, badge: 'Bestseller', isFeatured: true, rating: 4.9, numReviews: 320, color: '#1a1a1a', accent: '#888', image: '/gota-biri.png' },
  { name: 'Desi Red Rice (Kumara Chaula)', shortName: 'Desi Red Rice', description: 'Traditional Odia red rice packed with antioxidants and minerals. Nutty flavor with a chewy texture, ideal for everyday cooking.', price: 120, weight: '1kg', category: 'Rice', stock: 80, isFeatured: true, rating: 4.8, numReviews: 215, color: '#3a0808', accent: '#8B2014', image: '/red-rice.png' },
  { name: 'Desi Moong Dal (Split)', shortName: 'Desi Moong Dal', description: 'Light and easily digestible split moong dal from Odisha. Perfect for khichdi, soups, and a variety of healthy dishes.', price: 110, weight: '1kg', category: 'Dal', stock: 65, isFeatured: true, rating: 4.7, numReviews: 198, color: '#1a1800', accent: '#C4A200', image: '/moong-dal.png' },
  { name: 'Desi Toor Dal', shortName: 'Desi Toor Dal', description: 'Authentic Odia toor dal with rich earthy flavor. A kitchen staple for dal tadka, sambar and traditional Odia thali.', price: 130, weight: '1kg', category: 'Dal', stock: 70, isFeatured: true, rating: 4.8, numReviews: 175, color: '#1a0d00', accent: '#D4830A', image: '/toor-dal.png' },
  { name: 'Desi Kolatha (Horse Gram)', shortName: 'Desi Kolatha', description: 'Nutritious horse gram traditionally grown in Odisha. High in protein, iron and antioxidants — a true superfood dal.', price: 90, weight: '1kg', category: 'Dal', stock: 45, badge: 'Organic', rating: 4.6, numReviews: 142, color: '#1a0d08', accent: '#8B4513', image: '/kolatha.png' },
  { name: 'Desi Chana Dal', shortName: 'Desi Chana Dal', description: 'Freshly milled split bengal gram with vibrant yellow color. Adds richness to curries, halwa and snacks.', price: 115, weight: '1kg', category: 'Dal', stock: 55, rating: 4.7, numReviews: 160, color: '#1a1400', accent: '#D4A800', image: '/chana-dal.png' },
  { name: 'Desi Sona Masoori Rice', shortName: 'Desi Sona Masoori', description: 'Premium Sona Masoori rice — lightweight, low starch, and aromatic. Perfect for everyday meals and biryani.', price: 100, weight: '1kg', category: 'Rice', stock: 90, rating: 4.8, numReviews: 210, color: '#0d0d0d', accent: '#C8C8A0', image: '/sona-masoori.png' },
  { name: 'Desi Masur Dal (Red Lentil)', shortName: 'Desi Masur Dal', description: 'Tender red lentils that cook quickly. Rich in iron and folate, perfect for soups, dals and curries.', price: 105, weight: '1kg', category: 'Dal', stock: 60, badge: 'New', rating: 4.6, numReviews: 88, color: '#1a0600', accent: '#C04020', image: '/got-dal.png' },
]

const categories = [
  { categoryName: 'Dal', categoryImage: '/gota-biri.png' },
  { categoryName: 'Rice', categoryImage: '/red-rice.png' },
]

const blogs = [
  {
    title: 'The Golden Grain: Amazing Health Benefits of Odisha Gota Biri (Whole Urad Dal)',
    slug: 'benefits-of-gota-biri',
    category: 'Odisha Authentic Foods',
    shortDescription: 'Discover why whole black urad dal (Gota Biri) sourced from the heart of Odisha is a must-have superfood for your daily diet.',
    content: 'Odisha is known for its rich farming soils and traditional food culture that prioritizes natural health and pure nutrition. Among the staple foods grown in our beautiful village farms, Gota Biri (Whole Urad Dal) occupies a prime, revered position.\n\n### What is Gota Biri?\nGota Biri represents the whole, skinless black gram (urad dal). It is widely celebrated in Odia households for its premium texture, creamy consistency, and highly versatile culinary properties. From crafting the famous crispy Chhena Poda-accompanied Pithas to morning Chakuli Pithas and comforting Dalma, Gota Biri is a cornerstone of authentic Odia gastronomy.\n\n### Key Health Benefits:\n\n1. **Powerhouse of Plant-Based Protein:** Perfect for vegetarians and fitness enthusiasts, Gota Biri contains up to 25g of protein per 100g, aiding in muscle repair and daily strength.\n2. **Rich in Dietary Fiber:** The high soluble and insoluble fiber content improves digestion, prevents bloating, and promotes long-lasting gut health.\n3. **Sustained Energy & Iron Boost:** Feeling fatigued? Gota Biri is loaded with iron, which helps increase hemoglobin production and keeps you active throughout the day.\n4. **Heart and Bone Support:** Packed with essential minerals like magnesium, potassium, calcium, and phosphorus, it helps maintain healthy blood pressure and solidifies bone structure.\n\n### How to Add Gota Biri to Your Daily Meal:\n- **Authentic Odia Chakuli Pitha:** Soak Gota Biri and Rice together, grind into a smooth batter, and make healthy, oil-free crepes for breakfast.\n- **Traditional Dalma:** Mix cooked Gota Biri with raw papaya, pumpkin, brinjal, and local spices to create a nutritious single-pot meal.\n\nAt OdishaShop, we source our Gota Biri directly from local farmers who practice sustainable organic farming, ensuring that every grain is free of polishing chemicals and filled with genuine, rustic flavors.',
    image: '/gota-biri.png',
    tags: ['Gota Biri Recipes', 'Healthy Dal Benefits', 'Odisha Organic Products'],
    author: 'Sasmita Patra (Organic Food Blogger)',
    publishDate: new Date('2026-05-10'),
    metaTitle: 'Health Benefits of Odisha Gota Biri (Whole Urad Dal) - OdishaShop',
    metaDescription: 'Discover why unpolished Odisha Gota Biri (Whole Urad Dal) is a superfood. Learn about its protein, digestive fiber, and traditional Odia recipes.'
  },
  {
    title: 'The Ancient Superfood: Why Odisha Red Rice (Kumara Chaula) is Healthy',
    slug: 'why-odisha-red-rice-is-healthy',
    category: 'Red Rice Benefits',
    shortDescription: 'Unearth the incredible health benefits of traditional Odisha Red Rice, from rich antioxidants to low glycemic blood sugar control.',
    content: 'In an era dominated by heavily polished white rice, traditional whole grains are making a majestic comeback. Among them, Odisha Red Rice (historically known as Kumara Chaula) stands out as an ultimate nutritional powerhouse, direct from the rain-fed paddy fields of coastal and tribal Odisha.\n\n### What Makes Odisha Red Rice Special?\nThe striking reddish color of this rice comes from anthocyanin, a highly active antioxidant compound also found in blueberries and purple grapes. Unlike processed white rice, Odisha Red Rice undergoes minimal milling, leaving the nutrient-dense bran and germ layers completely intact.\n\n### Top Reasons to Switch to Odisha Red Rice:\n\n- **Extremely Low Glycemic Index (GI):** Odisha Red Rice digests slowly, causing a gradual release of glucose into the bloodstream. This makes it an ideal staple for managing diabetes and preventing sudden insulin spikes.\n- **Packed with Anthocyanin Antioxidants:** These compounds actively fight free radicals in the body, reduce cell inflammation, and lower the risk of chronic cardiovascular issues.\n- **High Zinc & Iron Content:** A single serving provides a healthy dose of essential minerals that boost immune response, combat anemia, and enhance daily brain focus.\n- **Rich in Vitamin B6:** Vitamin B6 is essential for serotonin production and maintaining a healthy nervous system, helping you stay happy and balanced.\n\n### The Perfect Odia Red Rice Pakhala Recipe:\nTo experience red rice at its traditional best, prepare **Red Rice Pakhala**:\n1. Boil the red rice until soft and let it cool completely.\n2. Add water, fresh curd, grated ginger, roasted cumin powder, and curry leaves.\n3. Ferment overnight or serve fresh for a highly cooling, gut-friendly lunch on hot summer days.\n\nAt OdishaShop, our goal is to deliver unpolished, premium quality Red Rice grown without chemical pesticides, preserving its signature nutty flavor and premium health benefits.',
    image: '/red-rice.png',
    tags: ['Red Rice Benefits', 'Traditional Odisha Food', 'Healthy Protein Rich Foods'],
    author: 'Prof. Ramesh Chandra (Agricultural Scientist)',
    publishDate: new Date('2026-05-15'),
    metaTitle: 'Why Odisha Red Rice (Kumara Chaula) is Healthy - OdishaShop',
    metaDescription: 'Discover the health benefits of unpolished Odisha Red Rice. Learn about low glycemic index, anthocyanin antioxidants, and rich zinc/iron content.'
  },
  {
    title: 'Sowing Sustainable Love: Traditional Odisha Village Farming Stories',
    slug: 'traditional-odisha-village-farming',
    category: 'Odisha Farming Culture',
    shortDescription: 'Journey into the lush green fields of Odisha to explore ancient organic farming techniques, crop rotation, and farmer stories.',
    content: 'Step into any village in Odisha during the monsoon, and you will be greeted by sweet earthy fragrances, chirping birds, and hardworking farmers singing folk songs while planting paddy. The farming culture of Odisha is not just an industry; it is a sacred relationship between the farmer and Mother Earth (Basudha).\n\n### The Ancient Wisdom of Natural Farming\nFor centuries, Odia farmers have relied on sustainable, chemical-free methods to maintain soil health. Here are the core pillars of their traditional agriculture:\n\n1. **Cow Dung & Organic Compost (Gobra Khata):** Instead of chemical nitrogen fertilizers, local farmers use aged cow dung, neem paste, and leaf mold to enrich the soil naturally.\n2. **Crop Rotation (Parjyaya Chasa):** Farmers alternate paddy cultivation with protein-rich lentils like Horse Gram (Kolatha) and Black Gram (Biri). This naturally fixes nitrogen in the soil, preventing depletion.\n3. **Rainwater Harvesting & Mixed Cropping:** Growing multiple crops together (like dal, oilseeds, and vegetables) protects against pest attacks and maximizes crop yield.\n4. **Native Heirloom Seeds:** Preserving indigenous, non-GMO seed varieties ensures resilience against extreme weather like floods and cyclones.\n\n### Meet Arjun Naik: A Village Farmer Story\nArjun, a 52-year-old farmer from Nayagarh district, has been supplying organic pulses to OdishaShop. "My grandfather taught me that if you poison the soil with chemicals, the food will poison your children," Arjun says with a smile. "By using natural neem compost, our Gota Biri and Moong Dal grow with an authentic sweet taste that you can never find in city markets."\n\nBy purchasing from OdishaShop, you are not only feeding your family highly nutritious, pesticide-free grains, but you are also actively supporting the livelihood of traditional farmers like Arjun who protect our agricultural heritage.',
    image: '/moong-dal.png',
    tags: ['Village Farming Stories', 'Odisha Farming Culture', 'Farmer Stories'],
    author: 'Debasish Mohanty (Rural Development Advocate)',
    publishDate: new Date('2026-05-18'),
    metaTitle: 'Traditional Odisha Village Farming and Organic Culture - OdishaShop',
    metaDescription: 'Learn about the natural organic farming techniques of rural Odisha. Discover sustainable crop rotation and the stories of local village farmers.'
  },
  {
    title: 'A Culinary Journey: Experiencing the Authentic Taste of Odisha',
    slug: 'authentic-taste-of-odisha',
    category: 'Authentic Taste of Odisha',
    shortDescription: 'Explore the rich culinary heritage of Odisha through sacred temple foods, wholesome dals, and unique rustic spices.',
    content: 'Odia cuisine is perhaps one of India\'s best-kept secrets. It is incredibly simple, relies heavily on local fresh produce, uses minimal oil and spices, and is deeply linked with the ancient temple traditions of Lord Jagannath.\n\n### The Simplicity and Pure Taste of Odia Food\nUnlike heavy curries filled with cream and excessive heat, authentic Odia food gets its flavors from subtle pancha phutana (a five-spice mix of mustard, cumin, fennel, fenugreek, and kalonji) and mustard oil. The dishes are designed to let the natural sweetness of organic lentils and vegetables shine.\n\n### Iconic Culinary Treasures:\n\n- **Jagannath Temple Mahaprasad:** Cooked solely in earthenware pots over wood fires, using only locally sourced organic ingredients (no potatoes, tomatoes, or green chilies are allowed!).\n- **Odisha Dalma:** A nutritious stew where yellow split lentils or moong dal are boiled along with raw banana, sweet potato, drumsticks, and pumpkin, finished with a tempering of ghee, cumin, and dry red chilies.\n- **Pakhala Bhata:** Cooked rice soaked in water, enjoyed with roasted vegetables (Saga Bhaja, Alu Badi Chura), curd, and green chilies.\n- **Chhena Poda:** The world\'s first baked cheese dessert, sweetened with caramelized sugar and cardamom, baked on sal leaves.\n\n### Bridging Heritage with Nutrition\nAt OdishaShop, we believe that cooking authentic food requires authentic ingredients. Our organic dals, red rice, and handcrafted spices are sourced from village cooperatives that prepare them in traditional stone-ground style to preserve their natural oils and rich taste.\n\nLet\'s celebrate the clean, medicinal, and soulful flavors of Odisha in our daily kitchen!',
    image: '/toor-dal.png',
    tags: ['Traditional Odisha Food', 'Food Recipes', 'Odisha Authentic Foods'],
    author: 'Tanmayee Mishra (Traditional Chef)',
    publishDate: new Date('2026-05-20'),
    metaTitle: 'The Authentic Taste and Culinary Heritage of Odisha - OdishaShop',
    metaDescription: 'Explore authentic Odia recipes, temple Mahaprasad, and organic ingredients. Wholesome, flavorful, and low-oil cooking traditions.'
  },
  {
    title: 'Plant Power: Wholesome Protein-Rich Dals to Fuel Your Day',
    slug: 'healthy-protein-rich-foods',
    category: 'Healthy Protein Rich Foods',
    shortDescription: 'Struggling to find clean, plant-based protein? Learn how traditional Odisha organic dals can supercharge your nutrition.',
    content: 'Protein is often called the building block of life. While many people associate protein with meat, traditional plant-based dals (lentils) offer an exceptionally clean, cholesterol-free, and high-fiber alternative that keeps you full and energized.\n\nIn Odisha, daily meals are incomplete without a warm, steaming bowl of dal. Let\'s look at the absolute best protein-rich dals you should stock in your kitchen:\n\n### The Ultimate Odisha Protein Dals:\n\n1. **Gota Biri (Whole Urad Dal):** With a whopping **25g of protein per 100g**, this dal is fantastic for muscle building and providing long-lasting stamina. It also contains high amounts of calcium, magnesium, and potassium.\n2. **Moong Dal (Split Yellow Gram):** Easy on the stomach and quick to cook, Moong Dal packs about **24g of protein**. It is widely used in cleansing diets (like Khichdi) and contains high amounts of folate and zinc.\n3. **Kolatha (Horse Gram):** Often called the "ultimate superfood," Horse Gram was historically used to feed high-performance horses! It contains **22g of protein** and is highly famous in Odisha for its warm potency, helping dissolve kidney stones and manage body weight.\n4. **Toor Dal (Arhar Dal):** A kitchen staple that provides **22g of protein**, along with high dietary fiber, iron, and folic acid. It forms the base of the nutritious Odia Dalma.\n\n### Why Choose Organic, Unpolished Dals?\nMost commercial supermarket dals undergo chemical water polishing to look shiny and bright. This process strips away the outer, highly nutritious bran layer and contaminates the pulse.\n\nAt OdishaShop, we sell only **100% unpolished, organic dals** that retain their rustic texture, full nutrient value, and natural taste. Try them today to feel the natural difference in your energy levels!',
    image: '/kolatha.png',
    tags: ['Healthy Dal Benefits', 'Food Recipes', 'Odisha Organic Products'],
    author: 'Dr. Alok Mohapatra (Clinical Nutritionist)',
    publishDate: new Date('2026-05-21'),
    metaTitle: 'Wholesome Protein Rich Organic Dals from Odisha - OdishaShop',
    metaDescription: 'Supercharge your protein intake with traditional, chemical-free dals from Odisha. Discover the values of Gota Biri, Moong, and Horse Gram.'
  }
]

const adminUser = {
  name: 'Admin',
  email: 'admin@odisha.shop',
  password: 'admin123456',
  role: 'admin',
  isVerified: true,
}

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 })
    console.log('✅ Connected to MongoDB')

    await Product.deleteMany({})
    await User.deleteMany({ email: adminUser.email })
    await Category.deleteMany({})
    await Blog.deleteMany({})

    await Product.insertMany(products)
    await User.create(adminUser)
    await Category.insertMany(categories)
    await Blog.insertMany(blogs)

    console.log('✅ Database seeded successfully!')
    console.log(`   ${products.length} products inserted`)
    console.log(`   ${categories.length} categories inserted`)
    console.log(`   ${blogs.length} blogs inserted`)
    console.log(`   Admin: admin@odisha.shop / admin123456`)
    process.exit(0)
  } catch (err) {
    console.error('❌ Seed error:', err.message)
    process.exit(1)
  }
}

seed()

const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://thenisubaiyas:Ramesh2007@ac-llkes11-shard-00-00.pb37tnm.mongodb.net:27017,ac-llkes11-shard-00-01.pb37tnm.mongodb.net:27017,ac-llkes11-shard-00-02.pb37tnm.mongodb.net:27017/theni-restaurant?ssl=true&replicaSet=atlas-ovlf6z-shard-0&authSource=admin&retryWrites=true&w=majority';

const MenuItemSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  imageUrl: String,
  category: String,
  isAvailable: Boolean
});

const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', MenuItemSchema);

const sampleData = [
  // --- STARTERS ---
  {
    name: 'Chicken 65',
    description: 'Classic spicy deep-fried chicken bites tossed with curry leaves and green chilies.',
    price: 160,
    imageUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?q=80&w=600&auto=format&fit=crop',
    category: 'Starters',
    isAvailable: true
  },
  {
    name: 'Mutton Chukka',
    description: 'Tender mutton pieces dry roasted with freshly ground black pepper and spices.',
    price: 240,
    imageUrl: 'https://images.unsplash.com/photo-1628296068364-740702caeacc?q=80&w=600&auto=format&fit=crop',
    category: 'Starters',
    isAvailable: true
  },
  {
    name: 'Fish Fry (Vanjaram)',
    description: 'Seer fish marinated in a fiery red masala and shallow fried on a tawa.',
    price: 280,
    imageUrl: 'https://images.unsplash.com/photo-1599487405270-880ea77a94b3?q=80&w=600&auto=format&fit=crop',
    category: 'Starters',
    isAvailable: true
  },
  {
    name: 'Prawn Masala Fry',
    description: 'Juicy prawns sautéed with onions, tomatoes, and Chettinad spices.',
    price: 260,
    imageUrl: 'https://images.unsplash.com/photo-1559742811-822873691df8?q=80&w=600&auto=format&fit=crop',
    category: 'Starters',
    isAvailable: true
  },
  {
    name: 'Gobi 65 (Veg)',
    description: 'Crispy cauliflower florets coated in a spiced batter and deep fried.',
    price: 120,
    imageUrl: 'https://images.unsplash.com/photo-1604544716766-3d2b2ba20ff6?q=80&w=600&auto=format&fit=crop',
    category: 'Starters',
    isAvailable: true
  },

  // --- BIRYANI ---
  {
    name: 'Mutton Seeraga Samba Biryani',
    description: 'Our signature, authentic South Indian Mutton Biryani cooked with fragrant seeraga samba rice.',
    price: 280,
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600&auto=format&fit=crop',
    category: 'Biryani',
    isAvailable: true
  },
  {
    name: 'Chicken Dum Biryani',
    description: 'Classic chicken biryani slowly cooked on dum with rich spices.',
    price: 200,
    imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93cb0?q=80&w=600&auto=format&fit=crop',
    category: 'Biryani',
    isAvailable: true
  },
  {
    name: 'Egg Biryani',
    description: 'Flavorful basmati rice biryani served with two boiled eggs.',
    price: 150,
    imageUrl: 'https://images.unsplash.com/photo-1522858547146-57bc13e01bc9?q=80&w=600&auto=format&fit=crop',
    category: 'Biryani',
    isAvailable: true
  },
  {
    name: 'Kuska (Plain Biryani)',
    description: 'Aromatic empty biryani rice without meat pieces, served with gravy and raita.',
    price: 120,
    imageUrl: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?q=80&w=600&auto=format&fit=crop',
    category: 'Biryani',
    isAvailable: true
  },

  // --- MEALS & MAIN COURSE ---
  {
    name: 'Non-Veg Meals',
    description: 'Unlimited rice served with Chicken, Mutton, and Fish gravies, along with rasam and curd.',
    price: 180,
    imageUrl: 'https://images.unsplash.com/photo-1626779870191-c167733fcd98?q=80&w=600&auto=format&fit=crop',
    category: 'Meals',
    isAvailable: true
  },
  {
    name: 'Special Veg Meals',
    description: 'Traditional full meals served on a banana leaf with rice, sambar, rasam, kootu, poriyal, appalam, and payasam.',
    price: 130,
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=600&auto=format&fit=crop',
    category: 'Meals',
    isAvailable: true
  },
  {
    name: 'Parotta (2 pcs)',
    description: 'Flaky, layered traditional South Indian flatbread, served with salna.',
    price: 50,
    imageUrl: 'https://images.unsplash.com/photo-1626509653294-1a221f062bf6?q=80&w=600&auto=format&fit=crop',
    category: 'Meals',
    isAvailable: true
  },
  {
    name: 'Mutton Kothu Parotta',
    description: 'Minced parotta scrambled with egg, spices, and tender mutton chukka.',
    price: 220,
    imageUrl: 'https://images.unsplash.com/photo-1596450514735-11002cf7f8db?q=80&w=600&auto=format&fit=crop',
    category: 'Meals',
    isAvailable: true
  },
  {
    name: 'Kal Dosa with Fish Curry',
    description: 'Two soft, thick dosas served with our signature tangy fish curry.',
    price: 160,
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?q=80&w=600&auto=format&fit=crop',
    category: 'Meals',
    isAvailable: true
  },

  // --- DRINKS ---
  {
    name: 'Jigarthanda',
    description: 'The famous Madurai cold beverage made with milk, almond gum, sarsaparilla syrup, and ice cream.',
    price: 90,
    imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=600&auto=format&fit=crop',
    category: 'Drinks',
    isAvailable: true
  },
  {
    name: 'Rose Milk',
    description: 'Chilled refreshing sweet milk flavored with pure rose essence.',
    price: 60,
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=600&auto=format&fit=crop',
    category: 'Drinks',
    isAvailable: true
  },
  {
    name: 'Sweet Lassi',
    description: 'Thick, creamy churned yogurt drink served chilled in a tall glass.',
    price: 70,
    imageUrl: 'https://images.unsplash.com/photo-1558230559-2ca7e0521eb8?q=80&w=600&auto=format&fit=crop',
    category: 'Drinks',
    isAvailable: true
  },
  {
    name: 'Filter Coffee',
    description: 'Strong authentic South Indian filter coffee in a traditional davara tumbler.',
    price: 35,
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600&auto=format&fit=crop',
    category: 'Drinks',
    isAvailable: true
  },
  {
    name: 'Lemon Soda (Sweet/Salt)',
    description: 'Freshly squeezed lemon mixed with chilled soda for digestion.',
    price: 40,
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop',
    category: 'Drinks',
    isAvailable: true
  },

  // --- DESSERTS ---
  {
    name: 'Gulab Jamun (2 pcs)',
    description: 'Soft milk solids deep fried and soaked in cardamom sugar syrup.',
    price: 60,
    imageUrl: 'https://images.unsplash.com/photo-1596827668638-ddbdc951bbac?q=80&w=600&auto=format&fit=crop',
    category: 'Desserts',
    isAvailable: true
  },
  {
    name: 'Bread Halwa',
    description: 'A rich Muslim-style wedding halwa made with fried bread, milk, ghee, and roasted nuts.',
    price: 80,
    imageUrl: 'https://images.unsplash.com/photo-1616809795679-b1bebc25bbaa?q=80&w=600&auto=format&fit=crop',
    category: 'Desserts',
    isAvailable: true
  },
  {
    name: 'Ice Cream (Vanilla / Chocolate)',
    description: 'Two scoops of classic rich ice cream.',
    price: 70,
    imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c8a9e9ce?q=80&w=600&auto=format&fit=crop',
    category: 'Desserts',
    isAvailable: true
  }
];

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to DB...');
    // Clear out the previous small subset so we don't have dupes
    await MenuItem.deleteMany({});
    console.log('Cleared old sample data...');
    
    // Insert new broad dataset
    await MenuItem.insertMany(sampleData);
    console.log(`Inserted ${sampleData.length} new items successfully!`);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

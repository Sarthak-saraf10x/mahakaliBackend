const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Package = require('../models/Package');
const Gallery = require('../models/Gallery');
const UpcomingTour = require('../models/UpcomingTour');

const initialPackages = [
  {
    name: "Mahabaleshwar & Panchgani Escape",
    destination: "Mahabaleshwar, Maharashtra",
    duration: "3 Days / 2 Nights",
    price: 6499,
    discountPrice: 4999,
    description: "Explore lush strawberry farms, Mapro garden, Elephant's Head Point, and serene Venna Lake in cooling hill station vibes.",
    highlights: ["Strawberry Farm Tour", "Venna Lake Boating", "Sunset Point View", "Luxury AC Bus"],
    inclusions: ["3 Star Hotel Stay", "Daily Breakfast & Dinner", "Sightseeing Bus Transfer", "Toll & Parking"],
    exclusions: ["Boating Ticket Fees", "Personal Expenses", "Lunch"],
    image: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    featured: true,
    category: "Hill Station"
  },
  {
    name: "Lonavala & Khandala Weekend Tour",
    destination: "Lonavala, Maharashtra",
    duration: "2 Days / 1 Night",
    price: 4500,
    discountPrice: 3499,
    description: "Mist-covered hills, Tiger Point sunset, Bhushi Dam waterfalls, and famous Lonavala Chikki tasting.",
    highlights: ["Tiger Point Sunset", "Karla & Bhaja Caves", "Bhushi Dam", "Rajmachi Viewpoint"],
    inclusions: ["Resort Accommodation", "Breakfast & Evening Snacks", "Private Vehicle Transfer"],
    exclusions: ["Adventure Activity Passes", "Personal Shopping"],
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    featured: true,
    category: "Hill Station"
  },
  {
    name: "Alibaug Beach & Water Sports Haven",
    destination: "Alibaug, Maharashtra",
    duration: "2 Days / 1 Night",
    price: 5200,
    discountPrice: 3999,
    description: "Relax on Nagaon beach, experience Kolaba Fort sea walk, and enjoy exciting speed boat rides.",
    highlights: ["Nagaon Beach Resort Stay", "Banana Boat & Jet Ski", "Kolaba Fort Sea Walk", "Konkani Seafood"],
    inclusions: ["Beachfront Resort", "All Meals Included", "Ferry Transfer Tickets"],
    exclusions: ["Water Sports Upgrades"],
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    rating: 4.7,
    featured: true,
    category: "Beach"
  },
  {
    name: "Tarkarli Scuba Diving & Malvan Tour",
    destination: "Tarkarli, Sindhudurg",
    duration: "4 Days / 3 Nights",
    price: 11999,
    discountPrice: 8999,
    description: "Clear turquoise waters of Konkan, certified underwater scuba diving, dolphin watching, and Sindhudurg fort.",
    highlights: ["Scuba Diving with Underwater Video", "Dolphin Safari Boat Ride", "Sindhudurg Sea Fort", "Malvani Cuisine"],
    inclusions: ["Beach Cottage Stay", "Scuba Instructor & Gear", "All Breakfasts & Dinners"],
    exclusions: ["Travel Insurance"],
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    featured: true,
    category: "Adventure"
  }
];

const initialGallery = [
  {
    title: "Strawberry Fields Forever",
    category: "Hill Station",
    imageUrl: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Alibaug Coastal Sunset",
    category: "Beaches",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Underwater Wonders Tarkarli",
    category: "Adventure",
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Executive Staff Bus Fleet",
    category: "Buses",
    imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Historical Forts of Konkan",
    category: "Heritage",
    imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80"
  }
];

const initialTours = [
  {
    name: "Monsoon Special Mahabaleshwar Group Tour",
    destination: "Mahabaleshwar & Panchgani",
    startDate: "2026-08-15",
    endDate: "2026-08-17",
    price: 4999,
    seatsAvailable: 8,
    description: "Experience misty hills, lush greenery, waterfalls, and group departs from Nagpur & Pune.",
    image: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=800&q=80",
    status: "Filling Fast"
  },
  {
    name: "Konkan Scuba & Beach Camping Expedition",
    destination: "Tarkarli & Malvan",
    startDate: "2026-09-02",
    endDate: "2026-09-05",
    price: 8999,
    seatsAvailable: 12,
    description: "Underwater scuba diving, beach bonfire, tent camping under stars, and Sindhudurg fort boat ride.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
    status: "Upcoming"
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mahakali_tours');
    console.log('Seeding Database...');

    const pkgCount = await Package.countDocuments();
    if (pkgCount === 0) {
      await Package.insertMany(initialPackages);
      console.log('Initial Packages seeded successfully!');
    }

    const galCount = await Gallery.countDocuments();
    if (galCount === 0) {
      await Gallery.insertMany(initialGallery);
      console.log('Initial Gallery seeded successfully!');
    }

    const tourCount = await UpcomingTour.countDocuments();
    if (tourCount === 0) {
      await UpcomingTour.insertMany(initialTours);
      console.log('Initial Upcoming Tours seeded successfully!');
    }

    console.log('Seeding complete!');
  } catch (error) {
    console.error('Seeding error:', error);
  }
};

module.exports = seedData;

if (require.main === module) {
  seedData().then(() => process.exit(0));
}

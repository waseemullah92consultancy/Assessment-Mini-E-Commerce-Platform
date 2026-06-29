"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt = __importStar(require("bcrypt"));
const user_schema_1 = require("./modules/users/schemas/user.schema");
const product_schema_1 = require("./modules/products/schemas/product.schema");
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
const SALT_ROUNDS = 12;
const SEED_USERS = [
    {
        email: 'admin@store.com',
        password: 'Admin123!',
        name: 'Store Admin',
        role: user_schema_1.UserRole.ADMIN,
    },
    {
        email: 'customer@store.com',
        password: 'Customer123!',
        name: 'John Customer',
        role: user_schema_1.UserRole.CUSTOMER,
    },
];
const SEED_PRODUCTS = [
    {
        name: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
        description: 'Industry-leading noise cancellation with Auto NC Optimizer. Up to 30 hours battery life with quick charge. Crystal clear hands-free calling with 4 beamforming microphones.',
        price: 349.99,
        images: [
            'https://picsum.photos/seed/sony-headphones/600/400',
            'https://picsum.photos/seed/sony-headphones-2/600/400',
        ],
        category: product_schema_1.ProductCategory.ELECTRONICS,
        stockQuantity: 45,
        isActive: true,
    },
    {
        name: 'Apple iPad Air 5th Generation 64GB Wi-Fi',
        description: 'Featuring the powerful M1 chip, stunning 10.9-inch Liquid Retina display, and support for Apple Pencil and Magic Keyboard. Perfect for creativity and productivity on the go.',
        price: 599.0,
        images: [
            'https://picsum.photos/seed/apple-ipad/600/400',
            'https://picsum.photos/seed/apple-ipad-2/600/400',
        ],
        category: product_schema_1.ProductCategory.ELECTRONICS,
        stockQuantity: 30,
        isActive: true,
    },
    {
        name: 'Samsung 65" Class QN90B Neo QLED 4K Smart TV',
        description: 'Neo Quantum Processor 4K with Quantum Mini LEDs for stunning contrast. Object Tracking Sound+ and Anti-Reflection screen. Includes 4 HDMI ports and built-in Alexa and Google Assistant.',
        price: 1199.99,
        images: [
            'https://picsum.photos/seed/samsung-tv/600/400',
            'https://picsum.photos/seed/samsung-tv-2/600/400',
        ],
        category: product_schema_1.ProductCategory.ELECTRONICS,
        stockQuantity: 12,
        isActive: true,
    },
    {
        name: "Levi's Men's 501 Original Fit Jeans",
        description: "The original blue jean since 1873. Sits at the waist, straight through the seat, thigh and leg. Button fly, 100% cotton denim. A timeless wardrobe essential that gets better with every wash.",
        price: 69.99,
        images: [
            'https://picsum.photos/seed/levis-jeans/600/400',
            'https://picsum.photos/seed/levis-jeans-2/600/400',
        ],
        category: product_schema_1.ProductCategory.CLOTHING,
        stockQuantity: 150,
        isActive: true,
    },
    {
        name: "Nike Men's Air Max 270 Running Shoes",
        description: "Nike's first lifestyle Air Max shoe with the biggest heel Air unit yet for a super-soft ride that lasts all day. Engineered mesh upper for breathability with a foam midsole.",
        price: 149.99,
        images: [
            'https://picsum.photos/seed/nike-airmax/600/400',
            'https://picsum.photos/seed/nike-airmax-2/600/400',
        ],
        category: product_schema_1.ProductCategory.CLOTHING,
        stockQuantity: 80,
        isActive: true,
    },
    {
        name: "Patagonia Women's Down Sweater Full-Zip Jacket",
        description: '800-fill-power RDS-certified goose down insulation delivers warmth and compressibility. Made with 100% recycled polyester shell and lining. Fair Trade Certified sewn.',
        price: 229.0,
        images: [
            'https://picsum.photos/seed/patagonia-jacket/600/400',
            'https://picsum.photos/seed/patagonia-jacket-2/600/400',
        ],
        category: product_schema_1.ProductCategory.CLOTHING,
        stockQuantity: 55,
        isActive: true,
    },
    {
        name: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        description: 'Robert C. Martin shares the best agile practices of cleaning code, and presents case studies of increasing complexity. A must-read for any developer who wants to write better, more maintainable code.',
        price: 35.99,
        images: [
            'https://picsum.photos/seed/clean-code-book/600/400',
        ],
        category: product_schema_1.ProductCategory.BOOKS,
        stockQuantity: 200,
        isActive: true,
    },
    {
        name: 'The Pragmatic Programmer: Your Journey to Mastery, 20th Anniversary Edition',
        description: 'Examines the core process of programming and identifies tips and techniques to become a more effective and efficient programmer. Updated with modern languages and practices for today\'s developers.',
        price: 49.99,
        images: [
            'https://picsum.photos/seed/pragmatic-programmer/600/400',
        ],
        category: product_schema_1.ProductCategory.BOOKS,
        stockQuantity: 175,
        isActive: true,
    },
    {
        name: 'Design Patterns: Elements of Reusable Object-Oriented Software',
        description: 'The Gang of Four classic reference on software design patterns. Covers 23 essential patterns including Creational, Structural, and Behavioral patterns with real-world examples in C++ and Smalltalk.',
        price: 59.99,
        images: [
            'https://picsum.photos/seed/design-patterns-book/600/400',
        ],
        category: product_schema_1.ProductCategory.BOOKS,
        stockQuantity: 120,
        isActive: true,
    },
    {
        name: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker, 6 Quart',
        description: 'Replaces 7 kitchen appliances: pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker, and warmer. UL certified, 13 built-in smart programs, 3 easy-to-use pressure settings.',
        price: 89.99,
        images: [
            'https://picsum.photos/seed/instant-pot/600/400',
            'https://picsum.photos/seed/instant-pot-2/600/400',
        ],
        category: product_schema_1.ProductCategory.HOME,
        stockQuantity: 65,
        isActive: true,
    },
    {
        name: 'Dyson V15 Detect Cordless Vacuum Cleaner',
        description: 'Laser reveals invisible dust on hard floors. Automatically adapts suction and run time. Piezo sensor counts and sizes particles, dynamically optimizing performance for up to 60 minutes of fade-free power.',
        price: 749.99,
        images: [
            'https://picsum.photos/seed/dyson-vacuum/600/400',
            'https://picsum.photos/seed/dyson-vacuum-2/600/400',
        ],
        category: product_schema_1.ProductCategory.HOME,
        stockQuantity: 18,
        isActive: true,
    },
    {
        name: 'IKEA KALLAX 4x4 Cube Storage Shelving Unit, White',
        description: 'Versatile shelving unit that can be used as a room divider. Fits 13-gallon storage boxes perfectly. Can be placed horizontally or vertically and mounted on the wall. Maximum load: 29 lbs per shelf.',
        price: 159.99,
        images: [
            'https://picsum.photos/seed/ikea-kallax/600/400',
        ],
        category: product_schema_1.ProductCategory.HOME,
        stockQuantity: 40,
        isActive: true,
    },
    {
        name: 'Peloton Bike+ Indoor Stationary Exercise Bike',
        description: "Peloton's most immersive bike with a 23.8\" HD touchscreen that rotates 360°. Auto-Follow resistance adjusts automatically in real time. Integrated Apple GymKit support and rear-facing camera for group workouts.",
        price: 2495.0,
        images: [
            'https://picsum.photos/seed/peloton-bike/600/400',
            'https://picsum.photos/seed/peloton-bike-2/600/400',
        ],
        category: product_schema_1.ProductCategory.SPORTS,
        stockQuantity: 6,
        isActive: true,
    },
    {
        name: 'Wilson Evolution Game Basketball, Official Size 7',
        description: 'The #1 selling indoor basketball in America. Laid-in composite channels for a sure grip. Exclusive Microfiber Composite cover provides superior feel and control. Cushion Core technology for consistent performance.',
        price: 54.99,
        images: [
            'https://picsum.photos/seed/wilson-basketball/600/400',
        ],
        category: product_schema_1.ProductCategory.SPORTS,
        stockQuantity: 95,
        isActive: true,
    },
    {
        name: 'Garmin Forerunner 945 GPS Running & Triathlon Smartwatch',
        description: 'Full-featured GPS running and triathlon watch with music and contactless payments. Features advanced training analytics, physiological measurements, VO2 max, and full-color maps. Up to 2 weeks battery life.',
        price: 499.99,
        images: [
            'https://picsum.photos/seed/garmin-watch/600/400',
            'https://picsum.photos/seed/garmin-watch-2/600/400',
        ],
        category: product_schema_1.ProductCategory.SPORTS,
        stockQuantity: 28,
        isActive: true,
    },
];
async function seed() {
    console.log('Connecting to MongoDB...');
    await mongoose_1.default.connect(MONGODB_URI);
    console.log('Connected.\n');
    const UserModel = mongoose_1.default.model('User', user_schema_1.UserSchema);
    const ProductModel = mongoose_1.default.model('Product', product_schema_1.ProductSchema);
    console.log('Seeding users...');
    for (const userData of SEED_USERS) {
        const existing = await UserModel.findOne({ email: userData.email });
        if (existing) {
            console.log(`  [SKIP] User already exists: ${userData.email}`);
            continue;
        }
        const passwordHash = await bcrypt.hash(userData.password, SALT_ROUNDS);
        await UserModel.create({
            email: userData.email,
            passwordHash,
            name: userData.name,
            role: userData.role,
        });
        console.log(`  [OK]   Created user: ${userData.email} (${userData.role})`);
    }
    console.log('\nSeeding products...');
    for (const productData of SEED_PRODUCTS) {
        const existing = await ProductModel.findOne({ name: productData.name });
        if (existing) {
            console.log(`  [SKIP] Product already exists: ${productData.name}`);
            continue;
        }
        await ProductModel.create(productData);
        console.log(`  [OK]   Created product: ${productData.name} (${productData.category})`);
    }
    console.log('\nSeed complete.');
    await mongoose_1.default.disconnect();
}
seed().catch((err) => {
    console.error('Seed failed:', err);
    mongoose_1.default.disconnect();
    process.exit(1);
});
//# sourceMappingURL=seed.js.map
import React, { useState } from "react";
import {
  ArrowRight,
  Award,
  Building,
  Clock,
  Globe,
  Heart,
  MapPin,
  Package,
  Palette,
  Percent,
  Shield,
  ShoppingBag,
  Star,
  Store,
  Truck,
  Zap,
} from "lucide-react";

const categories = [
  {
    id: "1",
    name: "Formal",
    icon: Shield,
    blurb: "Tailored looks and premium fabrics for boardrooms and big days.",
    gradient: ["#0ea5e9", "#312e81"],
  },
  {
    id: "2",
    name: "Snacks",
    icon: Package,
    blurb: "Crunchy bites, quick refuels, and pantry-friendly packs.",
    gradient: ["#f97316", "#f59e0b"],
  },
  {
    id: "3",
    name: "Biscuits",
    icon: Percent,
    blurb: "Tea-time essentials with classic and new-age flavours.",
    gradient: ["#fb7185", "#f97316"],
  },
  {
    id: "4",
    name: "Watches",
    icon: Clock,
    blurb: "Timeless pieces and smart companions for every outfit.",
    gradient: ["#6366f1", "#0ea5e9"],
  },
  {
    id: "5",
    name: "Shirts",
    icon: ShoppingBag,
    blurb: "Everyday staples that keep you looking sharp and comfortable.",
    gradient: ["#22c55e", "#15803d"],
  },
  {
    id: "6",
    name: "Dresses",
    icon: Heart,
    blurb: "Statement styles for effortless dressing and weekend plans.",
    gradient: ["#f43f5e", "#fb7185"],
  },
  {
    id: "7",
    name: "Furniture",
    icon: Building,
    blurb: "Pieces that elevate living spaces while keeping things cozy.",
    gradient: ["#0f172a", "#334155"],
  },
  {
    id: "8",
    name: "Laptop",
    icon: Zap,
    blurb: "Portable power for study, play, and productivity on the go.",
    gradient: ["#22d3ee", "#0ea5e9"],
  },
  {
    id: "9",
    name: "Hotels",
    icon: MapPin,
    blurb: "Handpicked stays designed for business trips and getaways.",
    gradient: ["#a855f7", "#6366f1"],
  },
  {
    id: "10",
    name: "Cookware",
    icon: Award,
    blurb: "Durable pots, pans, and kitchen heroes built to last.",
    gradient: ["#f59e0b", "#ef4444"],
  },
  {
    id: "11",
    name: "Frozen Food",
    icon: Truck,
    blurb: "Ready-to-cook essentials delivered chilled and fresh.",
    gradient: ["#0ea5e9", "#22d3ee"],
  },
  {
    id: "12",
    name: "Hotels+",
    icon: Globe,
    blurb: "Global stays and curated experiences, wherever you land.",
    gradient: ["#22c55e", "#0ea5e9"],
  },
  {
    id: "13",
    name: "Men's Wear",
    icon: Store,
    blurb: "Layered looks from casual days to elevated evenings.",
    gradient: ["#0f172a", "#1e293b"],
  },
  {
    id: "14",
    name: "Women's Fashion",
    icon: Heart,
    blurb: "Fresh drops and luxe classics across silhouettes.",
    gradient: ["#fb7185", "#a855f7"],
  },
  {
    id: "15",
    name: "Interior",
    icon: Palette,
    blurb: "Decor accents and textures that feel intentional.",
    gradient: ["#eab308", "#f97316"],
  },
  {
    id: "16",
    name: "Bags",
    icon: ShoppingBag,
    blurb: "Carryalls, totes, and travel must-haves built to roam.",
    gradient: ["#22c55e", "#16a34a"],
  },
  {
    id: "17",
    name: "Brands",
    icon: Award,
    blurb: "Trusted labels and verified partners you can rely on.",
    gradient: ["#6366f1", "#0ea5e9"],
  },
  {
    id: "18",
    name: "Luxury",
    icon: Star,
    blurb: "High-shine picks crafted for collectors and connoisseurs.",
    gradient: ["#facc15", "#eab308"],
  },
  {
    id: "19",
    name: "Cosmetics",
    icon: Palette,
    blurb: "Skincare and beauty edits for daily routines.",
    gradient: ["#a855f7", "#6366f1"],
  },
  {
    id: "20",
    name: "Shoes",
    icon: Percent,
    blurb: "Every stride covered—from everyday errands to events.",
    gradient: ["#fb7185", "#f97316"],
  },
];

const CategoryGrid = () => {
  const [activeCategory, setActiveCategory] = useState(null);

  return (
    <section className="bg-black text-white px-4 py-12 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">
            Curated collections
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold">All Categories</h2>
          <p className="text-sm text-white/70 max-w-2xl mx-auto">
            Tap a tile to view quick details. Built to feel light, fast, and thumb-friendly on smaller screens.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category)}
              className="group relative rounded-2xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-black"
            >
              <div className="aspect-[4/5] w-full">
                <div
                  className="h-full w-full flex flex-col justify-between p-3 sm:p-4"
                  style={{
                    background: `linear-gradient(135deg, ${category.gradient[0]}, ${category.gradient[1]})`,
                  }}
                >
                  <category.icon className="w-7 h-7 sm:w-9 sm:h-9 text-white/90" />
                  <div className="space-y-1">
                    <div className="text-sm sm:text-base font-semibold text-white">
                      {category.name}
                    </div>
                    <p className="text-xs sm:text-sm text-white/80 leading-snug">
                      {category.blurb}
                    </p>
                  </div>
                  <div className="flex items-center text-[11px] uppercase tracking-wide text-white/70">
                    Explore
                    <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {activeCategory && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-50"
            onClick={() => setActiveCategory(null)}
          >
            <div
              className="bg-neutral-900 border border-white/10 rounded-2xl w-full sm:max-w-md p-5 space-y-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-3">
                <div
                  className="p-3 rounded-xl"
                  style={{
                    background: `linear-gradient(135deg, ${activeCategory.gradient[0]}, ${activeCategory.gradient[1]})`,
                  }}
                >
                  <activeCategory.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-lg font-semibold">{activeCategory.name}</div>
                  <p className="text-sm text-white/70">{activeCategory.blurb}</p>
                </div>
              </div>
              <p className="text-xs text-white/60">
                Optimized for mobile: swipe down or tap close to keep browsing categories.
              </p>
              <button
                onClick={() => setActiveCategory(null)}
                className="w-full py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 bg-white text-black hover:bg-gray-200 transition-colors"
              >
                <span>Close</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryGrid;

import React, { useState } from "react";
import {
  ArrowRight,
  Search,
  User,
  ShoppingCart,
  Instagram,
  Facebook,
  Twitter,
  Mail,
  Phone,
  Play,
  Star,
  MapPin,
  Shield,
  Zap,
  Truck,
  Package,
  CheckCircle,
  Menu,
  X,
  Heart,
  Filter,
  Grid,
  List,
  Plus,
  Minus,
  Eye,
  Globe,
  Users,
  Building,
  Store,
  TrendingUp,
  Award,
  Clock,
  DollarSign,
  Percent,
  ShoppingBag,
  UserPlus,
  LogIn,
  Palette,
  Check,
} from "lucide-react";
import { Link } from "react-router-dom";
import img from "../assert/Gemini_Generated_Image_acwc6oacwc6oacwc.png"; // Your existing logo image

// Additional images for mobile view (replace with your actual image paths or use placeholders)
import problemImage from "../assert/WhatsApp Image 2025-08-26 at 22.45.19_a9da8536.jpg"; // Image for problem section
import solutionImage from "../assert/WhatsApp Image 2025-08-26 at 22.45.20_0bca6325.jpg"; // Image for solution section
import marketImage from "../assert/WhatsApp Image 2025-08-26 at 22.45.20_8825e190.jpg"; // Image for market opportunity
import roadmapImage from "../assert/WhatsApp Image 2025-08-26 at 22.45.20_c41d0c59.jpg"; // Image for roadmap
import ctaImage from "../assert/WhatsApp Image 2025-08-26 at 22.45.21_5aaf6e0a.jpg"; // Image for CTA

// Hardcoded data for the pitch deck
const pitchDeckData = {
  header: {
    logoText: "Bluxury",
  },
  hero: {
    title: "The B2B2C Commerce Ecosystem for India and Beyond",
    subtitle: "A digital fabric for wholesalers, retailers, and consumers. Your business, everywhere.",
    image: img,
  },
  problemStatement: {
    title: "The Challenge: Fragmented Indian Commerce",
    description: "The Indian market is a powerhouse of potential, yet it's hindered by a lack of seamless connectivity. Wholesalers struggle to reach a broader retail network, while retailers lose valuable time and profit managing multiple suppliers. This inefficiency ripples down to the consumer, limiting product access and increasing costs. This is particularly evident in Hyderabad, Telangana, where local businesses face these challenges daily.",
    points: [
      "Siloed Supply Chains & High Costs",
      "Inefficient B2B and B2C Operations",
      "Limited Market Access for Small Businesses",
    ],
    image: problemImage,
  },
  solution: {
    title: "Our Solution: The Bluxury Ecosystem",
    description: "We are building a holistic B2B2C ecosystem that provides the digital infrastructure for commerce to thrive at every level, from a local shop to a global enterprise. Our platform brings seamless connectivity to businesses in Hyderabad and across India.",
    features: [
      {
        icon: Building,
        title: "Wholesale-to-Retailer Hub",
        description: "A centralized platform for wholesalers to showcase products and manage bulk orders, and for retailers to source efficiently.",
      },
      {
        icon: Store,
        title: "Retailer-to-Consumer Marketplace",
        description: "Live, location-aware storefronts enabling retailers to offer real-time delivery and a personalized shopping experience.",
      },
      {
        icon: Globe,
        title: "Global Gateway",
        description: "A future-proofed architecture designed to facilitate cross-border trade and logistics, connecting Indian businesses to the world.",
      },
      {
        icon: Shield,
        title: "Integrated & Secure",
        description: "A single platform with secure payment gateways, transparent logistics, and unified data for all user types.",
      },
    ],
    image: solutionImage,
  },
  marketOpportunity: {
    title: "Market Opportunity & Traction",
    stats: [
      { number: "$160B+", label: "India's E-Commerce Market (2025F)" },
      { number: "60%+", label: "Growth from Tier-2/3 Cities" },
      { number: "270M+", label: "Online Shoppers in India" },
      { number: "200B+", label: "B2B E-Commerce Opportunity (2030F)" },
    ],
    image: marketImage,
  },
  goMarketStrategy: {
    title: "Our Phased Roadmap to Global Leadership",
    timeline: [
      {
        year: "Years 1-2: Initial Rollout",
        title: "Establish Foundational B2B2C Network",
        description: "Phase 1 focuses on deep penetration within 1-3 key Indian states, including our home base of Telangana. We will onboard wholesalers and retailers, building a robust, hyper-local network that provides instant, real-time access to goods. This phase is about proving the model and optimizing our technology.",
        icon: Building,
      },
      {
        year: "Years 3-5: National Expansion",
        title: "Scale Across India",
        description: "With a proven model, we will strategically expand our operations to cover all major states and cities in India. The focus shifts to scaling our logistics and marketing to reach a nationwide audience of both businesses and consumers.",
        icon: Globe,
      },
      {
        year: "Years 6-10: Global Leadership",
        title: "International Market Entry",
        description: "We will leverage our established national network to facilitate cross-border trade, acting as a bridge between Indian suppliers and international buyers. Our platform will become a global commerce hub, handling cross-border payments, logistics, and compliance.",
        icon: TrendingUp,
      },
    ],
    image: roadmapImage,
  },
  testimonials: {
    title: "Why Our Users Believe in the Ecosystem",
    description: "Quotes that reflect the real-world impact of our platform from different user perspectives.",
    stories: [
      {
        name: "Sanjay Patel",
        role: "Retailer, Hyderabad, Telangana",
        content: "Before Bluxury, managing my inventory was a headache. Now, I can source from wholesalers across the state in a single click. My store is always stocked, and my business is growing faster than ever.",
        avatar: "👨‍💼",
      },
      {
        name: "Priya Sharma",
        role: "Consumer, Delhi",
        content: "I love the app! I can get my groceries and essentials from local shops delivered so quickly, and I feel good knowing I’m supporting businesses in my area. It’s so convenient.",
        avatar: "👩‍🦳",
      },
      {
        name: "Rahul Mehra",
        role: "Wholesaler, Mumbai",
        content: "The platform has given us access to thousands of new retailers. The analytics and order management tools have made our operations so much more efficient. It's a game-changer for our business.",
        avatar: "👨‍💻",
      },
    ],
  },
  cta: {
    title: "Join the Future of Commerce.",
    description: "Invest in a platform that's not just a marketplace—it's the next generation of interconnected business.",
    buttons: [
      { text: "Download Full Deck", type: "primary" },
      { text: "Contact Our Team", type: "secondary" },
    ],
    image: ctaImage,
  },
};

const themes = {
  darkLuxury: {
    primaryDark: "#000000",
    primaryLight: "#1A1A1A",
    secondary: "#FFFFFF",
    accent: "#FFD700", // Gold accent
    text: "#F8F5F0", // Off-white text
    lightText: "#A0AEC0", // Lighter grey text
  },
};

const BluxuryPitchDeck = () => {
  const [currentTheme] = useState("darkLuxury");
  const colors = themes[currentTheme];
  const subtleTextShadowStyle = { textShadow: "1px 1px 2px rgba(0,0,0,0.5)" };
  const gradientTextStyle = {
    background: `linear-gradient(to right, ${colors.secondary}, ${colors.accent})`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    color: "transparent",
    fontWeight: "bold",
  };

  const Section = ({ title, description, children, image }) => (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-5xl font-extrabold mb-4 font-playfair"
            style={{ ...gradientTextStyle, ...subtleTextShadowStyle }}
          >
            {title}
          </h2>
          {description && (
            <p className="text-xl md:text-2xl" style={{ color: colors.lightText }}>
              {description}
            </p>
          )}
        </div>
        {image && (
          <div className="mb-12 md:mb-16 flex justify-center">
            <img src={image} alt={title} className="w-full h-auto max-w-md rounded-lg shadow-lg md:hidden" />
          </div>
        )}
        {children}
      </div>
    </section>
  );

  return (
    <div
      className="font-inter min-h-screen antialiased"
      style={{ backgroundColor: colors.primaryDark, color: colors.text }}
    >
      <style>
        {`
          .font-playfair { font-family: 'Playfair Display', serif; }
          .font-inter { font-family: 'Inter', sans-serif; }
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: ${colors.primaryLight}; }
          ::-webkit-scrollbar-thumb { background: ${colors.lightText}; border-radius: 4px; }
          ::-webkit-scrollbar-thumb:hover { background: ${colors.text}; }
          * { transition: all 0.3s ease-in-out; }
          .timeline-line { background-color: ${colors.lightText}40; }
        `}
      </style>

      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center text-center overflow-hidden"
        style={{
          background: `linear-gradient(to bottom, ${colors.primaryDark}90, ${colors.primaryDark}80), url(https://images.unsplash.com/photo-1542831371-29b013445513?q=80&w=2940&auto=format&fit=crop) no-repeat center center`,
          backgroundSize: "cover",
        }}
      >
        <div className="relative z-10 p-8 md:p-12 lg:p-16 max-w-5xl">
          <h1
            className="text-4xl sm:text-6xl md:text-7xl font-bold mb-4 font-playfair"
            style={{ color: colors.text, ...subtleTextShadowStyle }}
          >
            {pitchDeckData.hero.title}
          </h1>
          <p
            className="text-lg md:text-2xl mb-8"
            style={{ color: colors.lightText, ...subtleTextShadowStyle }}
          >
            {pitchDeckData.hero.subtitle}
          </p>
          <div className="flex justify-center items-center">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg"
              style={{
                background: `linear-gradient(to right, ${colors.primaryLight}, ${colors.primaryDark})`,
              }}
            >
              <img src={img} alt="Bluxury Logo" className="rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <Section
        title={pitchDeckData.problemStatement.title}
        description={pitchDeckData.problemStatement.description}
        image={pitchDeckData.problemStatement.image}
      >
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left md:text-lg">
          {pitchDeckData.problemStatement.points.map((point, index) => (
            <li
              key={index}
              className="flex items-center space-x-3 p-6 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105"
              style={{ backgroundColor: colors.primaryLight, border: `1px solid ${colors.lightText}20` }}
            >
              <X className="w-6 h-6 flex-shrink-0" style={{ color: colors.accent }} />
              <span className="text-sm md:text-base" style={{ color: colors.lightText }}>{point}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Our Solution Section */}
      <Section
        title={pitchDeckData.solution.title}
        description={pitchDeckData.solution.description}
        image={pitchDeckData.solution.image}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pitchDeckData.solution.features.map((feature, index) => (
            <div
              key={index}
              className="p-8 rounded-2xl shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center"
              style={{ backgroundColor: colors.primaryLight }}
            >
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{
                  background: `linear-gradient(to right, ${colors.secondary}10, ${colors.accent}10)`,
                  border: `1px solid ${colors.secondary}20`,
                }}
              >
                <feature.icon className="w-10 h-10" style={{ color: colors.accent }} />
              </div>
              <h3 className="font-bold text-xl mb-2" style={{ color: colors.text }}>
                {feature.title}
              </h3>
              <p className="text-sm" style={{ color: colors.lightText }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Market Opportunity & Traction Section */}
      <Section
        title={pitchDeckData.marketOpportunity.title}
        image={pitchDeckData.marketOpportunity.image}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {pitchDeckData.marketOpportunity.stats.map((stat, index) => (
            <div key={index} className="text-center p-6 rounded-lg shadow-md" style={{ backgroundColor: colors.primaryLight }}>
              <div className="text-4xl md:text-5xl font-extrabold mb-2" style={{ color: colors.accent }}>
                {stat.number}
              </div>
              <div className="text-lg" style={{ color: colors.lightText }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Go-to-Market Strategy Section */}
      <Section
        title={pitchDeckData.goMarketStrategy.title}
        description="A phased roadmap to build our foundation and scale globally."
        image={pitchDeckData.goMarketStrategy.image}
      >
        <div className="relative flex flex-col md:flex-row items-start justify-between space-y-12 md:space-y-0 md:space-x-12">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 timeline-line z-0 hidden md:block" />
          {pitchDeckData.goMarketStrategy.timeline.map((item, index) => (
            <div key={index} className="relative flex flex-col items-center text-center z-10 p-4 rounded-lg"
              style={{ backgroundColor: colors.primaryLight }}>
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
                style={{
                  background: `linear-gradient(to right, ${colors.secondary}10, ${colors.accent}10)`,
                  border: `1px solid ${colors.secondary}20`,
                  boxShadow: `0px 4px 15px rgba(255, 255, 255, 0.1)`,
                }}
              >
                <item.icon className="w-12 h-12" style={{ color: colors.accent }} />
              </div>
              <div
                className="text-xl font-bold mb-2"
                style={{ color: colors.text }}
              >
                {item.year}
              </div>
              <h3 className="text-2xl font-semibold mb-2" style={{ color: colors.text }}>
                {item.title}
              </h3>
              <p className="max-w-xs text-center text-sm" style={{ color: colors.lightText }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Testimonials Section */}
      <Section
        title={pitchDeckData.testimonials.title}
        description={pitchDeckData.testimonials.description}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pitchDeckData.testimonials.stories.map((story, index) => (
            <div key={index} className="p-8 rounded-2xl shadow-xl" style={{ backgroundColor: colors.primaryLight }}>
              <div className="flex items-center mb-4 space-x-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                  style={{ backgroundColor: colors.primaryDark, color: colors.accent }}>
                  {story.avatar}
                </div>
                <div>
                  <div className="font-semibold" style={{ color: colors.text }}>{story.name}</div>
                  <div className="text-sm" style={{ color: colors.lightText }}>{story.role}</div>
                </div>
              </div>
              <p className="italic text-base" style={{ color: colors.lightText }}>"{story.content}"</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Call to Action */}
      <section
        className="py-20 text-center"
        style={{ backgroundColor: colors.primaryLight }}
      >
        <div className="container mx-auto px-6">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: colors.text, ...subtleTextShadowStyle }}
          >
            {pitchDeckData.cta.title}
          </h2>
          <p className="text-lg md:text-xl mb-8" style={{ color: colors.lightText }}>
            {pitchDeckData.cta.description}
          </p>
          {pitchDeckData.cta.image && (
            <div className="mb-12 flex justify-center">
              <img src={pitchDeckData.cta.image} alt="Call to Action" className="w-full h-auto max-w-md rounded-lg shadow-lg md:hidden" />
            </div>
          )}
          <div className="flex justify-center gap-4 flex-wrap">
            <a
              href="#"
              className="px-8 py-4 rounded-full transition-all hover:opacity-90 font-semibold"
              style={{
                backgroundColor: colors.accent,
                color: colors.primaryDark,
                boxShadow: `0px 4px 20px ${colors.accent}40`,
              }}
            >
              {pitchDeckData.cta.buttons[0].text}
            </a>
            <a
              href="#"
              className="px-8 py-4 rounded-full transition-all hover:opacity-90 font-semibold border-2"
              style={{
                borderColor: colors.accent,
                color: colors.accent,
              }}
            >
              {pitchDeckData.cta.buttons[1].text}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BluxuryPitchDeck;
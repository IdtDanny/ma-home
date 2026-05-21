"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import OnboardingForm from "@/components/public/OnboardingForm";
import {
  Home,
  CreditCard,
  FileText,
  ShieldCheck,
  Users,
  Star,
  ChevronRight,
  Building2,
  Wallet,
  MessageCircle,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Tenant Management",
    description: "Easily manage tenants, assign rooms, and track their rental history.",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950",
  },
  {
    icon: CreditCard,
    title: "Rwanda Mobile Money",
    description: "Tenants pay rent and utilities via MTN MoMo or Airtel Money seamlessly.",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950",
  },
  {
    icon: FileText,
    title: "Digital Contracts",
    description: "Create, sign, and manage rental agreements online – paperless and secure.",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950",
  },
  {
    icon: Zap,
    title: "Utility Billing",
    description: "Generate bills for electricity, water, and custom charges automatically.",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950",
  },
];

const testimonials = [
  {
    name: "Jean Paul",
    role: "Tenant, Kigali",
    content: "MA Home made it so easy to pay my rent. No more standing in lines at the bank!",
    rating: 5,
  },
  {
    name: "Alice Uwimana",
    role: "Landlord, Musanze",
    content: "I manage 20 units effortlessly. The automatic billing saves me hours every month.",
    rating: 5,
  },
  {
    name: "David M.",
    role: "Tenant, Rubavu",
    content: "The contract signing was super fast. I signed my lease right from my phone!",
    rating: 4,
  },
];

const properties = [
  {
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop",
    title: "Modern Apartments",
    location: "Kigali City Center",
  },
  {
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop",
    title: "Luxury Villas",
    location: "Nyarutarama",
  },
  {
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop",
    title: "Cozy Studios",
    location: "Kimihurura",
  },
  {
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&h=300&fit=crop",
    title: "Family Houses",
    location: "Gisozi",
  },
];

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">
      {/* ── Hero Section ──────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                Manage Rentals
                <span className="text-primary-600 dark:text-primary-400"> Simply</span>
              </h1>
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-lg">
                The all‑in‑one platform for landlords and tenants in Rwanda. Collect rent,
                manage utilities, sign contracts, and pay with MoMo – all from one place.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/login">
                  <Button size="lg" className="gap-2 text-base px-8">
                    Get Started
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline" size="lg" className="text-base px-8">
                    Learn More
                  </Button>
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden md:block"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-1/2" />
                  <div className="h-20 bg-primary-50 dark:bg-primary-900/30 rounded-lg mt-2" />
                  <div className="h-20 bg-green-50 dark:bg-green-900/30 rounded-lg" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Features Section ──────────────────────────── */}
      <section id="features" className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
              Everything you need
            </h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Powerful tools for landlords and a seamless experience for tenants.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow border-0 shadow-md dark:bg-gray-900 dark:border-gray-800">
                  <CardContent className="p-6 text-center">
                    <div className={`inline-flex p-3 rounded-full ${feature.bg} mb-4`}>
                      <feature.icon className={`h-8 w-8 ${feature.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Property Gallery ──────────────────────────── */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
              Explore Properties
            </h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              A selection of properties managed through MA Home.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {properties.map((property, idx) => (
              <motion.div
                key={property.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-shadow"
              >
                <div className="aspect-video bg-cover bg-center" style={{ backgroundImage: `url(${property.image})` }}>
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="font-semibold text-lg">{property.title}</h3>
                    <p className="text-sm opacity-80">{property.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────── */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
              Trusted by Landlords & Tenants
            </h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              See what our users say about MA Home.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full border-0 shadow-md dark:bg-gray-900 dark:border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < t.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 italic">"{t.content}"</p>
                    <div className="mt-4">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{t.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ────────────────────────────────── */}
      <section className="py-20 bg-primary-600 dark:bg-primary-800">
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Ready to simplify your rental management?
            </h2>
            <p className="mt-4 text-primary-100 text-lg">
              Join hundreds of landlords and tenants already using MA Home.
            </p>

            {/* <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3">
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto text-base px-8">
                  Get Started
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <OnboardingForm />
              <Link href="#features">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8">
                  Learn More
                </Button>
              </Link>
            </div> */}

            <div className="mt-8">
              <Link href="/login">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto mb-2 text-base px-10 py-6 bg-white dark:bg-gray-700 text-primary-700 hover:bg-gray-100">
                  Get Started Free
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <OnboardingForm />
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
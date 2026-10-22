import React, { useEffect, useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin,
  Clock,
  Package,
  BadgeCheck,
  Plus,
  Search,
  Mail,
  Globe,
  ArrowRight,
  TrendingUp,
  Store,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ManufacturerForm } from "@/components/manufacturers/ManufacturerForm";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "@/lib/router-compat";
import { cn } from "@/lib/utils";

interface Manufacturer {
  id: string;
  company_name: string;
  contact_email: string;
  contact_phone?: string;
  address?: string;
  specialties: string[] | null;
  minimum_order_quantity: number;
  lead_time_days: number;
  certifications: string[] | null;
  website_url?: string;
  description?: string;
  is_verified: boolean;
}

const benefits = [
  {
    icon: TrendingUp,
    title: "Get more orders",
    text: "Reach customers who are actively looking for a manufacturing partner.",
  },
  {
    icon: Store,
    title: "Showcase your work",
    text: "Highlight your capabilities, equipment and past projects.",
  },
  {
    icon: ShieldCheck,
    title: "Build trust",
    text: "A verified badge shows customers you're a reliable partner.",
  },
];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

const ManufacturersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [userManufacturer, setUserManufacturer] = useState<Manufacturer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [specialty, setSpecialty] = useState<string>("all");

  useEffect(() => {
    fetchManufacturers();
    if (user) fetchUserManufacturer();
  }, [user]);

  // Existing manufacturers coming back from sign-in go straight to their portal
  useEffect(() => {
    if (userManufacturer && user) {
      const fromAuth = new URLSearchParams(window.location.search).get("from") === "auth";
      if (fromAuth) navigate("/manufacturer/orders");
    }
  }, [userManufacturer, user]);

  const fetchManufacturers = async () => {
    try {
      const { data, error } = await supabase.rpc("get_public_manufacturers");
      if (error) throw error;
      setManufacturers((data || []) as any);
    } catch (error) {
      console.error("Error fetching manufacturers:", error);
      toast.error("Failed to load manufacturers");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserManufacturer = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("manufacturers")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      setUserManufacturer(data as any);
    } catch (error) {
      console.error("Error fetching user manufacturer:", error);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchManufacturers();
    fetchUserManufacturer();
  };

  // Derived data
  const allSpecialties = useMemo(() => {
    const set = new Set<string>();
    manufacturers.forEach((m) => m.specialties?.forEach((s) => set.add(s)));
    return Array.from(set).slice(0, 12);
  }, [manufacturers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return manufacturers.filter((m) => {
      if (verifiedOnly && !m.is_verified) return false;
      if (specialty !== "all" && !m.specialties?.includes(specialty)) return false;
      if (!q) return true;
      return (
        m.company_name.toLowerCase().includes(q) ||
        (m.description || "").toLowerCase().includes(q) ||
        (m.specialties || []).some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [manufacturers, query, verifiedOnly, specialty]);

  const verifiedCount = manufacturers.filter((m) => m.is_verified).length;
  const avgLead = manufacturers.length
    ? Math.round(
        manufacturers.reduce((sum, m) => sum + (m.lead_time_days || 0), 0) / manufacturers.length,
      )
    : 0;

  const stats = [
    { label: "Partners", value: manufacturers.length || "–" },
    { label: "Verified", value: verifiedCount || "–" },
    { label: "Avg. lead time", value: avgLead ? `${avgLead} days` : "–" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-grow">
        {/* Hero */}
        <section className="relative overflow-hidden bg-neutral-950 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(16_90%_48%/0.25),transparent_45%)]" />
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="max-w-3xl">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                Manufacturing partners
              </span>
              <h1 className="mt-3 text-4xl sm:text-5xl font-bold leading-[1.1]">
                Find the right partner to bring your design to life
              </h1>
              <p className="mt-5 text-lg text-white/70 max-w-2xl">
                Browse manufacturers who print, stitch and produce custom orders with precision and
                quality.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {user ? (
                  !userManufacturer ? (
                    <Button size="lg" className="gap-2" onClick={() => setShowForm(true)}>
                      <Plus className="h-5 w-5" />
                      Register as a partner
                    </Button>
                  ) : (
                    <>
                      <Button size="lg" onClick={() => navigate("/manufacturer/orders")}>
                        Go to dashboard
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-white/30 bg-transparent text-white hover:bg-white hover:text-black"
                        onClick={() => setShowForm(true)}
                      >
                        Edit profile
                      </Button>
                    </>
                  )
                ) : (
                  <Button
                    size="lg"
                    className="gap-2"
                    onClick={() => navigate("/auth?redirect=manufacturers&from=manufacturers")}
                  >
                    <Plus className="h-5 w-5" />
                    Sign in to register
                  </Button>
                )}
                <a
                  href="#partners"
                  className="inline-flex items-center gap-1.5 px-2 text-sm font-medium text-white/80 hover:text-white"
                >
                  Browse partners <ArrowRight className="h-4 w-4" />
                </a>
              </div>

              {/* Stats */}
              <dl className="mt-12 grid grid-cols-3 gap-4 max-w-md">
                {stats.map((s) => (
                  <div key={s.label}>
                    <dd className="text-2xl sm:text-3xl font-bold">{s.value}</dd>
                    <dt className="text-xs text-white/60">{s.label}</dt>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
          <div className="grid gap-4 md:grid-cols-3">
            {benefits.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-lg"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Directory */}
        <section id="partners" className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Our manufacturing partners
            </h2>
            <p className="mt-2 text-muted-foreground">
              Compare lead times, minimum orders and specialties.
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name or specialty"
                  className="h-11 pl-9 rounded-xl"
                />
              </div>
              <button
                type="button"
                onClick={() => setVerifiedOnly((v) => !v)}
                className={cn(
                  "inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors",
                  verifiedOnly
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40",
                )}
              >
                <BadgeCheck className="h-4 w-4" />
                Verified only
              </button>
            </div>

            {allSpecialties.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {["all", ...allSpecialties].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSpecialty(s)}
                    className={cn(
                      "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition-colors",
                      specialty === s
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-2xl border border-border p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-14 w-14 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((m) => {
                const summary = m.description?.split("\n\n")[0];
                return (
                  <article
                    key={m.id}
                    className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl"
                  >
                    {/* Top */}
                    <div className="flex items-start gap-4">
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
                        {initials(m.company_name)}
                      </span>
                      <div className="min-w-0">
                        <h3 className="flex items-center gap-1.5 text-lg font-semibold text-foreground">
                          <span className="truncate">{m.company_name}</span>
                          {m.is_verified && (
                            <BadgeCheck
                              className="h-5 w-5 shrink-0 text-green-500"
                              aria-label="Verified"
                            />
                          )}
                        </h3>
                        {m.address ? (
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{m.address}</span>
                          </p>
                        ) : (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {m.is_verified ? "Verified partner" : "Pending verification"}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                      {summary || "Custom manufacturing services"}
                    </p>

                    {/* Stats */}
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-muted/50 p-3">
                        <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                          <Clock className="h-3 w-3" /> Lead time
                        </p>
                        <p className="mt-1 text-sm font-semibold text-foreground">
                          {m.lead_time_days} days
                        </p>
                      </div>
                      <div className="rounded-xl bg-muted/50 p-3">
                        <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                          <Package className="h-3 w-3" /> Min order
                        </p>
                        <p className="mt-1 text-sm font-semibold text-foreground">
                          {m.minimum_order_quantity} units
                        </p>
                      </div>
                    </div>

                    {/* Tags */}
                    {(m.specialties?.length ?? 0) > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {m.specialties?.slice(0, 4).map((s, i) => (
                          <Badge key={i} variant="secondary" className="text-xs font-medium">
                            {s}
                          </Badge>
                        ))}
                        {(m.specialties?.length ?? 0) > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{(m.specialties?.length ?? 0) - 4}
                          </Badge>
                        )}
                      </div>
                    )}
                    {(m.certifications?.length ?? 0) > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {m.certifications?.slice(0, 3).map((c, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {c}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Action */}
                    <div className="mt-auto pt-6">
                      {m.contact_email ? (
                        <Button variant="outline" className="w-full gap-2" asChild>
                          <a
                            href={`mailto:${m.contact_email}?subject=${encodeURIComponent(
                              `Inquiry from Roge Print Studio — ${m.company_name}`,
                            )}`}
                          >
                            <Mail className="h-4 w-4" />
                            Contact
                          </a>
                        </Button>
                      ) : m.website_url ? (
                        <Button variant="outline" className="w-full gap-2" asChild>
                          <a href={m.website_url} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-4 w-4" />
                            Visit website
                          </a>
                        </Button>
                      ) : (
                        <Button variant="outline" className="w-full gap-2" asChild>
                          <Link to="/designer">
                            Start a design
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border py-16 text-center">
              <Search className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="font-medium text-foreground">
                {manufacturers.length === 0
                  ? "No manufacturers yet. Be the first to join!"
                  : "No manufacturers match your filters"}
              </p>
              {manufacturers.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setQuery("");
                    setVerifiedOnly(false);
                    setSpecialty("all");
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Manufacturer form modal */}
      {showForm && (
        <ManufacturerForm
          manufacturer={userManufacturer}
          onSuccess={handleFormSuccess}
          onCancel={() => setShowForm(false)}
        />
      )}

      <Footer />
    </div>
  );
};

export default ManufacturersPage;
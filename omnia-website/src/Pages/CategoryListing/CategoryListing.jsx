import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Axios from '@/Services/axios';
import { getLocalizedField } from '@/lib/localization';

import { CategoryHeader } from "./components/CategoryHeader";
import { SubcategoryFilters } from "./components/SubcategoryFilters";
import { FeaturedVenues } from "./components/FeaturedVenues";
import { VenueGrid } from "./components/VenueGrid";
import { EmptyState } from "./components/EmptyState";

// ── Single venue card shimmer — mirrors FlippableVenueCard exactly ─────────
function VenueCardShimmer() {
  return (
    <div
      className="flex-shrink-0 w-[280px] md:w-[340px] h-[420px] md:h-[480px]"
      style={{ borderRadius: 24, overflow: 'hidden', border: '1px solid #EDE8DF', background: '#F8F5F0', display: 'flex', flexDirection: 'column' }}
    >
      {/* Image — h-64 = 256px */}
      <div className="cat-sh" style={{ width: '100%', height: 256, flexShrink: 0 }} />

      {/* Content — p-6 = 24px padding, matching real card */}
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', flex: 1 }}>

        {/* Row 1: name + location (left) | rating badge (right) — mb-4 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ flex: 1, marginRight: 12 }}>
            {/* Venue name — text-lg */}
            <div className="cat-sh" style={{ height: 22, width: '62%', borderRadius: 6, marginBottom: 8 }} />
            {/* Location — text-sm with MapPin */}
            <div className="cat-sh" style={{ height: 14, width: '50%', borderRadius: 4 }} />
          </div>
          {/* Rating badge — px-3 py-2 rounded-xl */}
          <div className="cat-sh" style={{ height: 36, width: 52, borderRadius: 12, flexShrink: 0 }} />
        </div>

        {/* Row 2: perk tags — flex-wrap gap-2 mb-4 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <div className="cat-sh" style={{ height: 28, width: 80, borderRadius: 999 }} />
          <div className="cat-sh" style={{ height: 28, width: 96, borderRadius: 999 }} />
        </div>

        {/* Row 3: price | reviews — pt-4 border-t (pushed to bottom) */}
        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #E8E3D5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="cat-sh" style={{ height: 13, width: 40, borderRadius: 4 }} />
          <div className="cat-sh" style={{ height: 13, width: 60, borderRadius: 4 }} />
        </div>
      </div>
    </div>
  );
}

// ── Shimmer skeleton for CategoryListing loading state ────────────────────
function CategoryListingSkeleton() {
  return (
    <div style={{ padding: '0 0 96px' }}>
      <style>{`
        @keyframes cat-shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }
        .cat-sh {
          background: linear-gradient(90deg, #F0EBE0 25%, #E4DDD3 50%, #F0EBE0 75%);
          background-size: 1200px 100%;
          animation: cat-shimmer 1.5s infinite linear;
        }
      `}</style>

      {/* ── Subcategory chips row ── */}
      <div style={{ display: 'flex', gap: 10, padding: '16px 24px', overflowX: 'hidden' }}>
        {[80, 100, 70, 90, 75, 85].map((w, i) => (
          <div key={i} className="cat-sh" style={{ height: 36, width: w, borderRadius: 20, flexShrink: 0 }} />
        ))}
      </div>

      {/* ── Featured section — always horizontal scroll (mirrors FeaturedVenues.jsx) ── */}
      <div style={{ marginBottom: 32, paddingTop: 8 }}>
        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 24px', marginBottom: 24 }}>
          <div className="cat-sh" style={{ width: 20, height: 20, borderRadius: 5 }} />
          <div className="cat-sh" style={{ height: 22, width: 110, borderRadius: 6 }} />
        </div>
        {/* Horizontal scroll row */}
        <div style={{ display: 'flex', gap: 24, overflowX: 'hidden', paddingBottom: 16, paddingLeft: 24, paddingRight: 24 }}>
          {[1, 2, 3].map(i => <VenueCardShimmer key={i} />)}
        </div>
      </div>

      {/* ── All Venues grid section — mirrors VenueGrid.jsx ── */}
      <div style={{ padding: '0 24px' }}>
        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <div className="cat-sh" style={{ width: 20, height: 20, borderRadius: 5 }} />
          <div className="cat-sh" style={{ height: 22, width: 100, borderRadius: 6 }} />
        </div>
        {/* grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <VenueCardShimmer key={i} />)}
        </div>
      </div>
    </div>
  );
}

export default function CategoryListing() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const language = i18n.language;

  const [selectedSub, setSelectedSub] = useState(null);
  const [venues, setVenues] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subcatsLoading, setSubcatsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch venues and subcategories in parallel — same as customer app's CategoryVenuesController.loadData()
  useEffect(() => {
    if (!categoryId) return;

    setLoading(true);
    setSubcatsLoading(true);
    setError(null);
    setSelectedSub(null);

    // Fetch venues + subcategories + category info in parallel
    Promise.all([
      Axios.get(`/categories/${categoryId}/venues`, {
        params: { restricted: true, page: 1, page_size: 100 },
      }),
      Axios.get(`/categories/${categoryId}/subcategories`, {
        params: { page: 1, page_size: 20 },
      }),
      Axios.get('/categories', { params: { page: 1, page_size: 50 } }),
    ])
      .then(([venuesRes, subcatsRes, catsRes]) => {
        // Venues
        if (venuesRes?.data?.success && Array.isArray(venuesRes.data.data)) {
          setVenues(venuesRes.data.data);
        } else {
          setVenues([]);
        }

        // Subcategories — handle both `data` and `items` response keys (customer app handles both)
        const subcatsRaw =
          subcatsRes?.data?.data ||
          subcatsRes?.data?.items ||
          subcatsRes?.data ||
          [];
        setSubcategories(Array.isArray(subcatsRaw) ? subcatsRaw : []);

        // Category info for header — find by id from categories list
        const catsRaw =
          catsRes?.data?.data ||
          catsRes?.data?.items ||
          catsRes?.data ||
          [];
        const cats = Array.isArray(catsRaw) ? catsRaw : [];
        const found = cats.find(
          (c) =>
            c.id === categoryId ||
            c.uuid === categoryId ||
            c.slug === categoryId
        );
        if (found) setCategory(found);
      })
      .catch(() => {
        setVenues([]);
        setError('Failed to load venues');
      })
      .finally(() => {
        setLoading(false);
        setSubcatsLoading(false);
      });
  }, [categoryId]);

  // Client-side filter by selected subcategory (matches customer app behaviour)
  const filteredVenues = selectedSub
    ? venues.filter((v) => v.subcategory_id === selectedSub)
    : venues;

  const featured = filteredVenues.filter((v) => v.is_featured);
  const regular = filteredVenues.filter((v) => !v.is_featured);

  const categoryTitle = category
    ? getLocalizedField(category, 'name', language) || category.name_en || category.name
    : '';

  return (
    <div className="min-h-screen bg-background pb-24">
      <CategoryHeader
        title={categoryTitle}
        count={filteredVenues.length}
        onBack={() => navigate(-1)}
      />

      {/* Subcategory horizontal chip list — same as customer app's SubcategoryChip row */}
      {!subcatsLoading && subcategories.length > 0 && (
        <SubcategoryFilters
          subcategories={subcategories}
          selected={selectedSub}
          onSelect={setSelectedSub}
          categoryId={categoryId}
          venues={venues}
        />
      )}

      {loading ? (
        <CategoryListingSkeleton />
      ) : error ? (
        <div className="p-6 text-[#B85450]">{error}</div>
      ) : filteredVenues.length === 0 ? (
        <EmptyState onReset={() => setSelectedSub(null)} />
      ) : (
        <>
          {featured.length > 0 && (
            <FeaturedVenues
              venues={featured}
              onVenueClick={(id) => navigate(`/venue/${id}`)}
              onBookClick={(venueId) => navigate(`/booking/${venueId}`)}
              onWalkIn={() => {}}
            />
          )}
          <VenueGrid
            venues={regular}
            onVenueClick={(id) => navigate(`/venue/${id}`)}
            onBookClick={(venueId) => navigate(`/booking/${venueId}`)}
            onWalkIn={() => {}}
          />
        </>
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, Search, MapPin, Star, Navigation, X, ChevronUp, Loader } from 'lucide-react';
import { getLocalizedField } from '@/lib/localization';
import { getVenues } from '@/Services/venueApi';
import { fixUrl } from '@/lib/venueNormalizer';

// ── Normalize raw API venue → same shape as Home's mapVenues() ────
function normalizeVenue(item) {
  const v       = item.venue || item;                          // handle nested or flat
  const ratings = item.ratings_summary || v.ratings_summary;
  const pricing = item.pricing || v.pricing;

  const image =
    fixUrl(v.image_cover_url)  ||
    fixUrl(v.image_cover)      ||
    fixUrl(v.image_logo_url)   ||
    fixUrl(v.featured_image)   ||
    fixUrl(v.image_url)        ||
    fixUrl(v.card_image_url)   ||
    (Array.isArray(v.image_gallery_urls) ? fixUrl(v.image_gallery_urls[0]) : null) ||
    '';

  const priceRaw = pricing?.price_range || v.price_range || '';
  const priceMap = { budget:'$', moderate:'$$', upscale:'$$$', luxury:'$$$$' };
  const priceRange = priceMap[priceRaw] || priceRaw;

  return {
    id:          v.id,
    name:        v.name_en  || '',
    nameAr:      v.name_ar  || '',
    nameFr:      v.name_fr  || '',
    location:    v.address_en || v.location || '',
    locationAr:  v.address_ar || '',
    locationFr:  v.address_fr || '',
    city:        v.city_en  || v.city || '',
    image,
    rating:      ratings?.average_rating ?? v.average_rating ?? v.rating ?? null,
    reviewCount: ratings?.total_reviews  ?? v.total_reviews  ?? 0,
    priceRange,
    latitude:    v.latitude  ?? null,
    longitude:   v.longitude ?? null,
    distance_km: item.distance_km || v.distance_km || null,
    is_featured: v.is_featured || false,
    categoryId:  v.category_id || v.categoryId || null,
    // keep original for navigation
    _raw: v,
  };
}

// ── Constants ─────────────────────────────────────────────────────
const DEFAULT_LAT  = 33.8938;
const DEFAULT_LNG  = 35.5018;
const DEFAULT_ZOOM = 12;
// Matches customer app radius options exactly
const RADIUS_OPTIONS = [2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];

// Mirrors _zoomForRadius from customer app MapSearchController
function zoomForRadius(radiusKm) {
  if (radiusKm <= 2)     return 13.5;
  if (radiusKm <= 5)     return 12.5;
  if (radiusKm <= 10)    return 11.5;
  if (radiusKm <= 25)    return 10.5;
  if (radiusKm <= 50)    return 9.5;
  if (radiusKm <= 100)   return 8.5;
  if (radiusKm <= 250)   return 7.5;
  if (radiusKm <= 500)   return 6.5;
  if (radiusKm <= 1000)  return 5.5;
  if (radiusKm <= 2500)  return 4.5;
  if (radiusKm <= 5000)  return 3.5;
  return 2.5;
}

// ── Gold pin marker ───────────────────────────────────────────────
function makePinHtml(selected) {
  const bg = selected
    ? 'linear-gradient(135deg,#CD7F32,#A0522D)'
    : 'linear-gradient(135deg,#D4AF37,#CD7F32)';
  return `<div style="width:34px;height:34px;border-radius:50% 50% 50% 0;background:${bg};
    transform:rotate(-45deg);box-shadow:0 4px 14px rgba(212,175,55,0.55);
    display:flex;align-items:center;justify-content:center;">
    <svg style="transform:rotate(45deg)" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  </div>`;
}
function makeIcon(selected) {
  return L.divIcon({ className:'', html:makePinHtml(selected), iconSize:[34,34], iconAnchor:[17,34] });
}

// ── Component ─────────────────────────────────────────────────────
export default function VenueMapScreen() {
  const navigate      = useNavigate();
  const routeLocation = useLocation();
  const { t, i18n }  = useTranslation();
  const language      = i18n.language;

  // If opened from VenueContact, a specific venue was passed
  const singleVenue = routeLocation.state?.venue || null;
  const focusSearch = routeLocation.state?.focusSearch || false;

  // Refs
  const mapDivRef        = useRef(null);
  const mapRef           = useRef(null);
  const markersRef       = useRef({});
  const debounceRef      = useRef(null);
  const selectVenueRef   = useRef(null); // stable ref to latest handleSelectVenue
  const searchInputRef   = useRef(null);

  // State
  const [userLat,       setUserLat]       = useState(DEFAULT_LAT);
  const [userLng,       setUserLng]       = useState(DEFAULT_LNG);
  const [locationReady, setLocationReady] = useState(false);   // true once we have real coords (or confirmed default)
  const [venues,        setVenues]        = useState([]);
  const [query,         setQuery]         = useState('');
  const [radius,        setRadius]        = useState(100);       // default 100 km (matches customer app)
  const [loading,       setLoading]       = useState(false);
  const [selected,      setSelected]      = useState(singleVenue);
  const [sheetExpanded, setSheetExpanded] = useState(false);

  // Prevent useEffect #5 (query) from making a duplicate fetch on first mount
  const isFirstRender = useRef(true);

  // ── 1. Get user geolocation ──────────────────────────────────
  useEffect(() => {
    if (singleVenue) {
      setLocationReady(true);
      return;
    }
    if (!navigator.geolocation) {
      setLocationReady(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        setLocationReady(true);
      },
      () => setLocationReady(true), // fall back to Beirut default
      { timeout: 8000 }
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 2. Init Leaflet map ONCE ─────────────────────────────────
  useEffect(() => {
    const container = mapDivRef.current;
    if (!container || container._leaflet_id) return;

    const initLat = singleVenue
      ? parseFloat(singleVenue.latitude || singleVenue.lat) || DEFAULT_LAT
      : DEFAULT_LAT;
    const initLng = singleVenue
      ? parseFloat(singleVenue.longitude || singleVenue.lng) || DEFAULT_LNG
      : DEFAULT_LNG;

    const map = L.map(container, {
      center: [initLat, initLng],
      zoom:   singleVenue ? 15 : zoomForRadius(100), // 8.5 — matches customer app default 100 km
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      Object.values(markersRef.current).forEach(m => m.remove());
      markersRef.current = {};
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 3. Core fetch function (mirrors customer app fetchVenues) ──
  const fetchVenues = useCallback((searchQuery, radiusKm, lat, lng) => {
    setLoading(true);

    // Same params as customer app:
    // search mode  → { latitude, longitude, search, limit }
    // radius mode  → { latitude, longitude, radius_km, limit }
    const params = {
      latitude:  lat,
      longitude: lng,
      limit:     100,
      skip:      0,
    };
    if (searchQuery && searchQuery.trim()) {
      params.search = searchQuery.trim();
      // Customer app: when searching, does NOT include radius_km
    } else {
      params.radius_km = radiusKm;
    }

    getVenues(params)
      .then(res => {
        // Mirror customer app parsing exactly:
        // API returns: direct List  OR  { items: [...] }  OR  { data: [...] }
        const body = res?.data; // axios unwraps one level
        let raw = [];
        if (Array.isArray(body)) {
          raw = body;
        } else if (body && typeof body === 'object') {
          const inner = body.items ?? body.data ?? body.results ?? null;
          if (Array.isArray(inner)) raw = inner;
        }
        setVenues(raw.map(normalizeVenue));
      })
      .catch(() => setVenues([]))
      .finally(() => setLoading(false));
  }, []);

  // ── 4. Initial load + re-fetch when location/radius changes ───
  useEffect(() => {
    if (!locationReady) return; // wait until we have real (or confirmed default) coords
    if (singleVenue) {
      setVenues([normalizeVenue(singleVenue)]);
      return;
    }
    if (!query.trim()) {
      fetchVenues('', radius, userLat, userLng);
    }
  }, [locationReady, userLat, userLng, radius]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-focus search input when navigated from Home search field ──
  useEffect(() => {
    if (focusSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [focusSearch]);

  // ── 5. Debounced search — calls API 400 ms after user stops typing ──
  useEffect(() => {
    // Skip on first mount — useEffect #4 handles the initial fetch
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (singleVenue) return;

    clearTimeout(debounceRef.current);

    if (!query.trim()) {
      // Cleared → fetch by radius
      fetchVenues('', radius, userLat, userLng);
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetchVenues(query, radius, userLat, userLng);
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 6. Sync map markers when venue list changes ───────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const safeVenues = Array.isArray(venues) ? venues : [];
    const currentIds = new Set(safeVenues.map(v => String(v.id)));

    // Remove stale markers
    Object.keys(markersRef.current).forEach(id => {
      if (!currentIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Add new markers
    safeVenues.forEach(venue => {
      const lat = parseFloat(venue.latitude ?? venue.lat ?? 0);
      const lng = parseFloat(venue.longitude ?? venue.lng ?? 0);
      if (!lat || !lng) return;

      const id = String(venue.id);
      if (markersRef.current[id]) return;

      const isSelected = selected?.id === venue.id;
      const marker = L.marker([lat, lng], { icon: makeIcon(isSelected) })
        .addTo(map)
        .on('click', () => selectVenueRef.current?.(venue));

      markersRef.current[id] = marker;
    });
  }, [venues]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 7. Update marker icon when selection changes ──────────────
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      marker.setIcon(makeIcon(selected && String(selected.id) === id));
    });
  }, [selected]);

  // ── 8. Re-center map when geolocation resolves (mirrors _animateCameraToLocation) ──
  useEffect(() => {
    if (!locationReady || singleVenue) return;
    const map = mapRef.current;
    if (!map) return;
    map.setView([userLat, userLng], zoomForRadius(radius), { animate: true, duration: 1 });
  }, [locationReady]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Radius chip clicked ───────────────────────────────────────
  const handleRadiusChange = (r) => {
    if (radius === r) return; // same as customer app: if (selectedRadiusKm.value == radiusKm) return;
    setRadius(r);
    setQuery('');  // clear search when switching radius (customer app behaviour)
    // Re-center map at new zoom — mirrors _animateCameraToLocation after setRadius
    if (mapRef.current) {
      mapRef.current.setView([userLat, userLng], zoomForRadius(r), { animate: true, duration: 0.8 });
    }
  };

  // ── Select venue → fly map ────────────────────────────────────
  const handleSelectVenue = useCallback((venue) => {
    setSelected(venue);
    const lat = parseFloat(venue.latitude ?? venue.lat ?? 0);
    const lng = parseFloat(venue.longitude ?? venue.lng ?? 0);
    if (lat && lng && mapRef.current) {
      mapRef.current.flyTo([lat, lng], 16, { duration: 1 });
    }
    setSheetExpanded(false);
  }, []);

  // Keep ref always pointing to latest version (avoids stale closure in marker handlers)
  selectVenueRef.current = handleSelectVenue;

  const handleGetDirections = (venue) => {
    const lat = venue?.latitude ?? venue?.lat;
    const lng = venue?.longitude ?? venue?.lng;
    const addr = venue?.address_en || venue?.location || '';
    if (lat && lng)
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    else if (addr)
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`, '_blank');
  };

  const safeVenues = Array.isArray(venues) ? venues : [];

  const statusText = loading
    ? t('loading_venues', 'Loading venues...')
    : query.trim()
      ? `${safeVenues.length} ${t('venues_found_for', 'venues found for')} "${query}"`
      : singleVenue
        ? getLocalizedField(singleVenue, 'name', language) || singleVenue.name_en || ''
        : `${safeVenues.length} ${t('venues_within', 'venues within')} ${radius >= 1000 ? `${radius/1000}K` : radius} km`;

  // ── Render ────────────────────────────────────────────────────
  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, background:'#E8E0D5' }}>
      <style>{`
        .leaflet-control-zoom,.leaflet-control-attribution{display:none!important;}
        .no-scrollbar::-webkit-scrollbar{display:none;}
        .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none;}
      `}</style>

      {/* Full-screen map */}
      <div ref={mapDivRef} style={{ width:'100vw', height:'100vh' }} />

      {/* ── Top Bar ── */}
      <div style={{ position:'absolute', top:0, left:0, right:0, zIndex:1000, padding:'16px 16px 0' }}>
        <div style={{ maxWidth:520, margin:'0 auto', display:'flex', flexDirection:'column', gap:8 }}>

          {/* Back + Search input */}
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                width:40, height:40, background:'white', borderRadius:12,
                border:'1px solid #E8E3D5', display:'flex', alignItems:'center',
                justifyContent:'center', boxShadow:'0 2px 12px rgba(0,0,0,0.12)',
                flexShrink:0, cursor:'pointer',
              }}
            >
              <ArrowLeft size={18} color="#1A1A1C" />
            </button>

            <div style={{
              flex:1, display:'flex', alignItems:'center', gap:8,
              background:'white', borderRadius:12, padding:'10px 14px',
              border:'1px solid #E8E3D5', boxShadow:'0 2px 12px rgba(0,0,0,0.12)',
            }}>
              {loading
                ? <Loader size={16} color="#D4AF37" style={{ flexShrink:0, animation:'spin 1s linear infinite' }} />
                : <Search size={16} color="#8B8680" style={{ flexShrink:0 }} />
              }
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    clearTimeout(debounceRef.current);
                    fetchVenues(query, radius, userLat, userLng);
                  }
                }}
                placeholder={t('search_venues_map', 'Search venues on map...')}
                style={{ flex:1, border:'none', outline:'none', background:'transparent', fontSize:14, color:'#1A1A1C' }}
              />
              {query ? (
                <button
                  onClick={() => setQuery('')}
                  style={{ cursor:'pointer', display:'flex', border:'none', background:'none', padding:0 }}
                >
                  <X size={16} color="#8B8680" />
                </button>
              ) : (
                <div style={{
                  padding:'2px 8px', borderRadius:8, fontSize:11, fontWeight:700,
                  color:'white', background:'linear-gradient(135deg,#D4AF37,#CD7F32)',
                  minWidth:24, textAlign:'center',
                }}>
                  {safeVenues.length}
                </div>
              )}
            </div>
          </div>

          {/* Radius filter chips (hidden in single-venue mode) */}
          {!singleVenue && (
            <div className="no-scrollbar" style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:4 }}>
              {RADIUS_OPTIONS.map(r => {
                const label = r >= 1000 ? `${r/1000}K` : r;
                const active = radius === r && !query.trim();
                return (
                  <button
                    key={r}
                    onClick={() => handleRadiusChange(r)}
                    style={{
                      flexShrink:0, padding:'5px 12px', borderRadius:20, fontSize:11,
                      fontWeight:600, cursor:'pointer', border:'none', whiteSpace:'nowrap',
                      background: active ? 'linear-gradient(135deg,#D4AF37,#CD7F32)' : 'white',
                      color: active ? 'white' : '#5C5850',
                      boxShadow: active ? '0 2px 8px rgba(212,175,55,0.45)' : '0 1px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    {label} km
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Sheet ── */}
      <div style={{
        position:'absolute', left:0, right:0, bottom:0, zIndex:1000,
        background:'white', borderRadius:'24px 24px 0 0',
        boxShadow:'0 -4px 32px rgba(0,0,0,0.15)',
        maxHeight: sheetExpanded ? '82%' : '42%',
        transition:'max-height 0.3s ease',
        display:'flex', flexDirection:'column',
      }}>

        {/* Drag handle */}
        <div
          onClick={() => setSheetExpanded(p => !p)}
          style={{ display:'flex', justifyContent:'center', padding:'12px 0 6px', cursor:'pointer' }}
        >
          <div style={{ width:40, height:4, background:'#E8E3D5', borderRadius:4 }} />
        </div>

        {/* Sheet header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px 8px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <MapPin size={14} color="#D4AF37" />
            <span style={{ color:'#5C5850', fontSize:13, fontWeight:500 }}>{statusText}</span>
          </div>
          <button
            onClick={() => setSheetExpanded(p => !p)}
            style={{ width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', background:'#F8F6F1', border:'none', borderRadius:8, cursor:'pointer' }}
          >
            <ChevronUp size={14} color="#8B8680"
              style={{ transform:sheetExpanded ? 'rotate(180deg)' : 'none', transition:'transform 0.3s' }} />
          </button>
        </div>

        <div style={{ height:1, background:'#F0EBE0', margin:'0 20px 8px' }} />

        {/* Venue list */}
        <div className="no-scrollbar" style={{ overflowY:'auto', padding:'0 16px 24px', flex:1 }}>

          {/* Loading skeleton */}
          {loading && safeVenues.length === 0 && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ display:'flex', gap:12, padding:12, borderRadius:16, border:'1.5px solid #F0EBE0', background:'#FAFAF8' }}>
                  <div style={{ width:76, height:76, borderRadius:12, background:'#F0EBE0' }} />
                  <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8, justifyContent:'center' }}>
                    <div style={{ height:14, width:'70%', background:'#F0EBE0', borderRadius:6 }} />
                    <div style={{ height:10, width:'50%', background:'#F0EBE0', borderRadius:6 }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && safeVenues.length === 0 && (
            <div style={{ textAlign:'center', padding:'32px 0' }}>
              <Search size={36} color="#D4AF37" style={{ opacity:0.3, margin:'0 auto 8px', display:'block' }} />
              <p style={{ color:'#8B8680', fontSize:14, margin:0 }}>{t('no_venues_found', 'No venues found')}</p>
              <p style={{ color:'#8B8680', opacity:0.6, fontSize:12, marginTop:4 }}>{t('try_different_search', 'Try a different search or increase the radius')}</p>
            </div>
          )}

          {/* Venue cards */}
          {safeVenues.map(venue => {
            // All fields already normalized by normalizeVenue()
            const name  = (language === 'ar' ? venue.nameAr : language === 'fr' ? venue.nameFr : '') || venue.name || '';
            const addr  = (language === 'ar' ? venue.locationAr : language === 'fr' ? venue.locationFr : '') || venue.location || '';
            const img   = venue.image || '';
            const dist  = venue.distance_km;
            const rating = venue.rating ?? 0;
            const price  = venue.priceRange || '';
            const isSelected = selected?.id === venue.id;

            return (
              <div
                key={venue.id}
                onClick={() => handleSelectVenue(venue)}
                style={{
                  display:'flex', gap:12, marginBottom:12, padding:12, borderRadius:16,
                  cursor:'pointer', transition:'all 0.2s',
                  border:`1.5px solid ${isSelected ? '#D4AF37' : '#E8E3D5'}`,
                  background: isSelected ? '#FFFDF5' : 'white',
                  boxShadow: isSelected ? '0 2px 12px rgba(212,175,55,0.2)' : 'none',
                }}
              >
                {/* Image */}
                <div style={{ width:76, height:76, borderRadius:12, overflow:'hidden', flexShrink:0, background:'#F0EBE0', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {img
                    ? <img src={img} alt={name} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => { e.target.style.display='none'; }} />
                    : <MapPin size={24} color="#D4AF37" style={{ opacity:0.3 }} />
                  }
                </div>

                {/* Info */}
                <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
                  <div>
                    <p style={{ fontWeight:700, fontSize:14, color:'#1A1A1C', fontFamily:'serif', margin:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{name}</p>
                    {addr && (
                      <p style={{ fontSize:11, color:'#8B8680', margin:'2px 0 0', display:'flex', alignItems:'center', gap:3, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>
                        <MapPin size={10} style={{ flexShrink:0 }} />{addr}
                      </p>
                    )}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:6 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      {rating > 0 && (
                        <div style={{ display:'flex', alignItems:'center', gap:3 }}>
                          <Star size={11} color="#D4AF37" fill="#D4AF37" />
                          <span style={{ fontSize:11, fontWeight:600, color:'#1A1A1C' }}>{Number(rating).toFixed(1)}</span>
                        </div>
                      )}
                      {dist && (
                        <div style={{ padding:'1px 7px', borderRadius:8, background:'rgba(212,175,55,0.12)' }}>
                          <span style={{ fontSize:10, fontWeight:600, color:'#D4AF37' }}>{Number(dist).toFixed(1)} km</span>
                        </div>
                      )}
                      {price && <span style={{ fontSize:11, fontWeight:600, color:'#CD7F32' }}>{price}</span>}
                    </div>
                    <div style={{ display:'flex', gap:6 }}>
                      <button
                        onClick={e => { e.stopPropagation(); handleGetDirections(venue); }}
                        style={{ width:28, height:28, borderRadius:8, border:'none', cursor:'pointer', background:'linear-gradient(135deg,#D4AF37,#CD7F32)', display:'flex', alignItems:'center', justifyContent:'center' }}
                      >
                        <Navigation size={13} color="white" />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/venue/${venue.id}`); }}
                        style={{ padding:'0 10px', height:28, borderRadius:8, cursor:'pointer', background:'#F8F6F1', border:'1px solid #E8E3D5', fontSize:11, fontWeight:600, color:'#1A1A1C' }}
                      >
                        {t('view', 'View')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spinner CSS */}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

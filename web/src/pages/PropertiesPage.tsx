import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { propertyService } from '../services/property.service';
import { favoriteService } from '../services/favorite.service';
import { enquiryService } from '../services/enquiry.service';
import { Property, PropertyType } from '@project/shared';
import {
  Building2,
  Search,
  Plus,
  Heart,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Filter,
  CheckCircle2,
  Phone,
  Mail,
  X,
  Send,
  Eye,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/Button';
import { EmptyState } from '../components/common/EmptyState';
import { CardSkeleton } from '../components/common/Skeleton';
import { ErrorMessage } from '../components/feedback/ErrorMessage';
import { SuccessMessage } from '../components/feedback/SuccessMessage';

export const PropertiesPage: React.FC = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [selectedBeds, setSelectedBeds] = useState<string>('All');

  // Selected Property for Details & Enquiry
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [enquiryMsg, setEnquiryMsg] = useState('');
  const [enquiryPhone, setEnquiryPhone] = useState('');
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  const fetchProperties = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await propertyService.getProperties({
        search: search || undefined,
        propertyType: selectedType !== 'All' ? (selectedType as PropertyType) : undefined,
        location: selectedLocation !== 'All' ? selectedLocation : undefined,
        bedrooms: selectedBeds !== 'All' ? parseInt(selectedBeds, 10) : undefined,
      });
      setProperties(data);
    } catch (err: any) {
      setError('Unable to load properties from server. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProperties();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedType, selectedLocation, selectedBeds]);

  const handleToggleFavorite = async (e: React.MouseEvent, prop: Property) => {
    e.stopPropagation();
    try {
      // Optimistic update
      setProperties((prev) =>
        prev.map((p) => (p.id === prop.id ? { ...p, isFavorite: !p.isFavorite } : p))
      );
      if (selectedProperty && selectedProperty.id === prop.id) {
        setSelectedProperty((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
      }
      await favoriteService.toggleFavorite(prop.id);
    } catch {
      // Revert on error
      setProperties((prev) =>
        prev.map((p) => (p.id === prop.id ? { ...p, isFavorite: prop.isFavorite } : p))
      );
    }
  };

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty || !enquiryMsg.trim()) return;

    setIsSubmittingEnquiry(true);
    try {
      await enquiryService.submitEnquiry({
        propertyId: selectedProperty.id,
        message: enquiryMsg.trim(),
        phone: enquiryPhone.trim() || undefined,
        name: user?.name,
        email: user?.email,
      });
      setEnquirySuccess(true);
      setEnquiryMsg('');
      setTimeout(() => {
        setEnquirySuccess(false);
      }, 3500);
    } catch (err: any) {
      alert('Error submitting enquiry. Please try again.');
    } finally {
      setIsSubmittingEnquiry(false);
    }
  };

  const propertyTypes = ['All', 'Apartment', 'Villa', 'Plot', 'Commercial'];
  const locations = ['All', 'Anna Nagar', 'ECR', 'OMR', 'Velachery', 'Porur', 'Tambaram'];
  const bedroomOptions = ['All', '2', '3', '4'];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Properties & Real Estate</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-[#0D5C3A]">
              {properties.length} Available
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Explore premium residential apartments, beachfront villas, and commercial plots
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg overflow-x-auto w-full md:w-auto">
            {propertyTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
                  selectedType === type
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, location, or area..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:border-[#0D5C3A] text-slate-800"
            />
          </div>
        </div>

        {/* Secondary Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1 text-[11px]">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </span>

          {/* Location */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium outline-none focus:border-[#0D5C3A]"
          >
            <option value="All">All Locations</option>
            {locations.slice(1).map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          {/* Bedrooms */}
          <select
            value={selectedBeds}
            onChange={(e) => setSelectedBeds(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium outline-none focus:border-[#0D5C3A]"
          >
            <option value="All">All BHK</option>
            <option value="2">2 BHK</option>
            <option value="3">3 BHK</option>
            <option value="4">4+ BHK</option>
          </select>

          {(search || selectedType !== 'All' || selectedLocation !== 'All' || selectedBeds !== 'All') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedType('All');
                setSelectedLocation('All');
                setSelectedBeds('All');
              }}
              className="text-[#0D5C3A] text-xs font-bold hover:underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {error && (
        <ErrorMessage
          title="Properties Error"
          message={error}
          onRetry={fetchProperties}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Grid of Properties */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <EmptyState
          variant="card"
          title="No Properties Match Your Search"
          description="Try broadening your filters, searching for a different location, or clearing the keywords."
          actionLabel="Clear All Filters"
          onAction={() => {
            setSearch('');
            setSelectedType('All');
            setSelectedLocation('All');
            setSelectedBeds('All');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {properties.map((prop) => (
            <div
              key={prop.id}
              onClick={() => setSelectedProperty(prop)}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden hover:shadow-md hover:border-[#0D5C3A]/40 transition-all flex flex-col group cursor-pointer"
            >
              {/* Image Section with Badges & Favorite Heart */}
              <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                <img
                  src={
                    prop.imageUrl ||
                    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80'
                  }
                  alt={prop.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider">
                    {prop.propertyType}
                  </span>
                  {prop.featured && (
                    <span className="px-2 py-0.5 rounded-full bg-[#C99700] text-slate-950 text-[10px] font-extrabold flex items-center gap-1 shadow-xs">
                      <Sparkles className="w-3 h-3" />
                      <span>Featured</span>
                    </span>
                  )}
                </div>

                {/* Heart Button */}
                <button
                  type="button"
                  onClick={(e) => handleToggleFavorite(e, prop)}
                  className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-xs transition-all ${
                    prop.isFavorite
                      ? 'bg-white text-rose-600 shadow-md scale-110'
                      : 'bg-black/40 text-white hover:bg-white hover:text-rose-600'
                  }`}
                  title={prop.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  aria-label="Toggle favorite"
                >
                  <Heart className={`w-4 h-4 ${prop.isFavorite ? 'fill-rose-600' : ''}`} />
                </button>

                {/* Price pill */}
                <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-white/95 backdrop-blur-xs shadow-xs text-slate-900">
                  <span className="text-sm font-extrabold text-[#0D5C3A]">{prop.priceFormatted}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#0D5C3A] transition-colors line-clamp-1">
                    {prop.title}
                  </h3>
                  <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{prop.location}</span>
                  </div>

                  {/* Specs Pill Row */}
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-slate-600 text-xs">
                    {prop.bedrooms > 0 && (
                      <div className="flex items-center gap-1.5 font-medium">
                        <Bed className="w-3.5 h-3.5 text-slate-400" />
                        <span>{prop.bedrooms} BHK</span>
                      </div>
                    )}
                    {prop.bathrooms > 0 && (
                      <div className="flex items-center gap-1.5 font-medium">
                        <Bath className="w-3.5 h-3.5 text-slate-400" />
                        <span>{prop.bathrooms} Baths</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 font-medium">
                      <Maximize className="w-3.5 h-3.5 text-slate-400" />
                      <span>{prop.areaSqFt} sqft</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Status: <strong className="text-emerald-700 capitalize font-bold">{prop.status}</strong>
                  </span>
                  <span className="text-xs font-bold text-[#0D5C3A] group-hover:underline flex items-center gap-1">
                    <span>View & Enquire</span>
                    <Eye className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Property Details Modal & Enquiry Drawer */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative aspect-16/9 bg-slate-900 overflow-hidden">
              <img
                src={
                  selectedProperty.imageUrl ||
                  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80'
                }
                alt={selectedProperty.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedProperty(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={(e) => handleToggleFavorite(e, selectedProperty)}
                className={`absolute top-4 right-16 p-2 rounded-full backdrop-blur-xs transition-all ${
                  selectedProperty.isFavorite
                    ? 'bg-white text-rose-600'
                    : 'bg-black/60 text-white hover:bg-white hover:text-rose-600'
                }`}
                title="Toggle favorite"
              >
                <Heart className={`w-5 h-5 ${selectedProperty.isFavorite ? 'fill-rose-600' : ''}`} />
              </button>

              <div className="absolute bottom-4 left-4 right-4 text-white flex items-end justify-between bg-gradient-to-t from-black/80 to-transparent p-4 rounded-xl">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-bold text-[10px] uppercase">
                    {selectedProperty.propertyType}
                  </span>
                  <h3 className="text-xl font-extrabold mt-1">{selectedProperty.title}</h3>
                  <p className="text-xs text-slate-200 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{selectedProperty.location}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-white">{selectedProperty.priceFormatted}</span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 text-xs">
              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-slate-400 block text-[11px]">Bedrooms</span>
                  <span className="text-sm font-extrabold text-slate-800">{selectedProperty.bedrooms} BHK</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Bathrooms</span>
                  <span className="text-sm font-extrabold text-slate-800">{selectedProperty.bathrooms} Baths</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Super Built-up Area</span>
                  <span className="text-sm font-extrabold text-slate-800">{selectedProperty.areaSqFt} Sq.Ft</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Status</span>
                  <span className="text-sm font-extrabold text-emerald-700 capitalize">{selectedProperty.status}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1.5">Property Description</h4>
                <p className="text-slate-600 leading-relaxed bg-white border border-slate-100 p-3 rounded-xl">
                  {selectedProperty.description}
                </p>
              </div>

              {/* Amenities */}
              {selectedProperty.amenities?.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-2">Amenities & Highlights</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProperty.amenities.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-lg bg-emerald-50 text-[#0D5C3A] font-semibold border border-emerald-100 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0D5C3A]" />
                        <span>{item}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Agent Contact & Contact Desk */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Assigned Agent</span>
                  <span className="font-extrabold text-slate-900 text-sm">{selectedProperty.agentName}</span>
                  <span className="text-slate-500 block text-xs">{selectedProperty.agentContact}</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${selectedProperty.agentContact}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 font-bold hover:bg-slate-100 shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#0D5C3A]" />
                    <span>Call Desk</span>
                  </a>
                </div>
              </div>

              {/* Enquiry Submission Box */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
                  <Send className="w-4 h-4 text-[#0D5C3A]" />
                  <span>Send Direct Enquiry to AnandHomes</span>
                </h4>
                <p className="text-slate-500 text-xs mb-3">
                  Submit your contact details and message to arrange a personalized site walkthrough.
                </p>

                {enquirySuccess && (
                  <div className="mb-3">
                    <SuccessMessage
                      title="Enquiry Submitted!"
                      message="Thank you! Our AnandHomes sales advisor will reach out to schedule your walkthrough."
                      onDismiss={() => setEnquirySuccess(false)}
                    />
                  </div>
                )}

                <form onSubmit={handleEnquirySubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Your Phone Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={enquiryPhone}
                      onChange={(e) => setEnquiryPhone(e.target.value)}
                      placeholder="+91 98401 23456"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Message / Request Details *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={enquiryMsg}
                      onChange={(e) => setEnquiryMsg(e.target.value)}
                      placeholder="I am interested in this property. Please share brochure, payment schedule, and arrange a visit."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0D5C3A] resize-none"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProperty(null)}
                    >
                      Close
                    </Button>
                    <Button
                      type="submit"
                      variant="brand"
                      size="sm"
                      isLoading={isSubmittingEnquiry}
                      icon={<Send className="w-3.5 h-3.5" />}
                    >
                      Submit Enquiry
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Property } from '@project/shared';
import { favoriteService } from '../services/favorite.service';
import { enquiryService } from '../services/enquiry.service';
import { CardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorMessage } from '../components/feedback/ErrorMessage';
import { SuccessMessage } from '../components/feedback/SuccessMessage';
import {
  Heart,
  Building2,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Phone,
  Mail,
  Send,
  X,
  Sparkles,
} from 'lucide-react';

export const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Selected property for details / enquiry modal
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [enquiryMessage, setEnquiryMessage] = useState<string>(
    'Hi, I am interested in this property. Please contact me with details.'
  );
  const [enquiryPhone, setEnquiryPhone] = useState<string>('');
  const [enquirySending, setEnquirySending] = useState<boolean>(false);
  const [enquirySuccess, setEnquirySuccess] = useState<boolean>(false);

  const fetchFavorites = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await favoriteService.getFavorites();
      setFavorites(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load your favorite properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (e: React.MouseEvent, propertyId: string) => {
    e.stopPropagation();
    try {
      await favoriteService.removeFavorite(propertyId);
      setFavorites((prev) => prev.filter((p) => p.id !== propertyId));
      setActionSuccess('Removed property from your saved favorites');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Could not remove favorite.');
    }
  };

  const handleSendEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty) return;

    setEnquirySending(true);
    try {
      await enquiryService.submitEnquiry({
        propertyId: selectedProperty.id,
        message: enquiryMessage,
        phone: enquiryPhone || undefined,
      });
      setEnquirySuccess(true);
      setTimeout(() => {
        setEnquirySuccess(false);
        setSelectedProperty(null);
      }, 2000);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to submit enquiry. Please try again.');
    } finally {
      setEnquirySending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Saved Favorites</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100 flex items-center gap-1">
              <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
              {favorites.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Properties you have marked as your favorite. Compare or submit direct enquiries.
          </p>
        </div>

        <Link
          to="/properties"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0D5C3A] hover:bg-[#0A482E] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Explore All Properties</span>
        </Link>
      </div>

      {actionSuccess && (
        <SuccessMessage
          message={actionSuccess}
          onDismiss={() => setActionSuccess(null)}
        />
      )}

      {error && (
        <ErrorMessage
          message={error}
          onRetry={fetchFavorites}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <EmptyState
          icon={<Heart className="w-7 h-7 text-rose-500" />}
          title="No Favorite Properties Yet"
          description="You haven't saved any properties to your favorites yet. Browse through our listings in Chennai and tap the heart icon to save homes you love!"
          actionLabel="Browse Properties"
          onAction={() => navigate('/properties')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {favorites.map((prop) => (
            <div
              key={prop.id}
              onClick={() => setSelectedProperty(prop)}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-emerald-600/30 transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer"
            >
              {/* Image & Badges */}
              <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
                <img
                  src={
                    prop.imageUrl ||
                    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80'
                  }
                  alt={prop.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                {/* Status Badge */}
                <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide bg-emerald-600/90 text-white backdrop-blur-xs shadow-xs">
                    {prop.propertyType}
                  </span>
                  {prop.featured && (
                    <span className="px-2 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide bg-amber-500 text-slate-900 flex items-center gap-1 shadow-xs">
                      <Sparkles className="w-2.5 h-2.5" /> Featured
                    </span>
                  )}
                </div>

                {/* Remove Favorite Button */}
                <button
                  type="button"
                  onClick={(e) => handleRemoveFavorite(e, prop.id)}
                  title="Remove from favorites"
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 text-rose-500 hover:bg-rose-50 flex items-center justify-center shadow-md transition-transform hover:scale-110"
                >
                  <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                </button>

                {/* Price Display */}
                <div className="absolute bottom-3 left-3 text-white">
                  <div className="text-lg font-black tracking-tight drop-shadow-sm">
                    {prop.priceFormatted || `₹${prop.price.toLocaleString('en-IN')}`}
                  </div>
                  <div className="text-[10px] text-slate-200 font-medium">
                    ₹{(prop.price / (prop.areaSqFt || 1000)).toFixed(0)} / sq.ft
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#0D5C3A] transition-colors line-clamp-1">
                    {prop.title}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{prop.location}</span>
                  </div>
                </div>

                {/* Specifications Bar */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="flex items-center justify-center gap-1 text-slate-600 bg-slate-50 py-1.5 rounded-lg">
                    <Bed className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-[11px]">{prop.bedrooms || '—'} BHK</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 text-slate-600 bg-slate-50 py-1.5 rounded-lg">
                    <Bath className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-[11px]">{prop.bathrooms || '—'} Bath</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 text-slate-600 bg-slate-50 py-1.5 rounded-lg">
                    <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-[11px]">{prop.areaSqFt} sqft</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedProperty(prop)}
                    className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors text-center"
                  >
                    Quick Enquiry
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveFavorite(e, prop.id)}
                    className="px-3 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Property Details & Enquiry Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="relative aspect-16/9 w-full bg-slate-900">
              <img
                src={selectedProperty.imageUrl}
                alt={selectedProperty.title}
                className="w-full h-full object-cover opacity-90"
              />
              <button
                type="button"
                onClick={() => setSelectedProperty(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 flex items-center justify-center backdrop-blur-xs transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-[#0D5C3A] text-white">
                  {selectedProperty.propertyType}
                </span>
                <h3 className="text-xl font-bold mt-1 text-white drop-shadow-md">
                  {selectedProperty.title}
                </h3>
                <p className="text-xs text-slate-200 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" /> {selectedProperty.location}
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs text-slate-400 font-medium">Asking Price</span>
                  <div className="text-2xl font-black text-slate-900">
                    {selectedProperty.priceFormatted || `₹${selectedProperty.price.toLocaleString('en-IN')}`}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-medium">Area</span>
                  <div className="text-base font-bold text-slate-800">
                    {selectedProperty.areaSqFt} sq.ft
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Property Overview
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedProperty.description || 'Spacious and premium property built by Anand Homes.'}
                </p>
              </div>

              {/* Amenities */}
              {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Amenities & Features
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProperty.amenities.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-[#0D5C3A] border border-emerald-100 text-[11px] font-semibold"
                      >
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Send Enquiry Form */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#0D5C3A]" />
                  <span>Send Direct Enquiry</span>
                </h4>

                {enquirySuccess ? (
                  <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200">
                    ✓ Your enquiry has been sent directly to the sales desk. Our advisor will reach out shortly!
                  </div>
                ) : (
                  <form onSubmit={handleSendEnquiry} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Contact Phone Number
                      </label>
                      <input
                        type="tel"
                        value={enquiryPhone}
                        onChange={(e) => setEnquiryPhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#0D5C3A]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Message / Query
                      </label>
                      <textarea
                        rows={3}
                        value={enquiryMessage}
                        onChange={(e) => setEnquiryMessage(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#0D5C3A]"
                        required
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedProperty(null)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={enquirySending}
                        className="px-5 py-2 rounded-xl bg-[#0D5C3A] hover:bg-[#0A482E] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{enquirySending ? 'Submitting...' : 'Submit Enquiry'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

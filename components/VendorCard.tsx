import React from 'react';
import type { Vendor } from '../types';
import Icon from './Icon';

interface VendorCardProps {
  vendor: Vendor;
  onViewDetails: (vendor: Vendor) => void;
}

const VendorCard: React.FC<VendorCardProps> = ({ vendor, onViewDetails }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 transform hover:scale-[1.02] transition-transform duration-300">
      <div className="flex items-start space-x-4">
        <img className="h-20 w-20 object-cover rounded-full" src={vendor.photos?.[0] || 'https://placehold.co/100x100'} alt={`${vendor.name}'s service photo`} />
        <div className="flex-grow">
          <p className="text-xl font-bold text-slate-900">{vendor.name}</p>
          <div className="flex items-center flex-wrap gap-2 mt-1">
            <div className="flex items-center space-x-1 text-sm text-slate-600">
                <Icon name="star" className="w-4 h-4 text-yellow-500" />
                <span>{vendor.rating.toFixed(1)}</span>
            </div>
            {vendor.verified && (
                <div className="flex items-center text-green-700 text-xs font-semibold bg-green-100 px-2 py-0.5 rounded-full" title="Verified">
                    <Icon name="verified" className="w-4 h-4 mr-1 text-green-600" />
                    <span>Verified</span>
                </div>
            )}
          </div>
          <p className="mt-2 text-sm text-slate-500 capitalize">🏷️ {vendor.service} • 📍 {vendor.area}</p>
        </div>
      </div>
      <p className="mt-4 text-slate-800 font-medium">{vendor.rates}</p>
      <div className="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
        <button
          onClick={() => onViewDetails(vendor)}
          className="flex-1 bg-white border border-slate-900 text-slate-900 font-bold py-3 px-4 rounded-xl hover:bg-slate-50 transition-colors duration-300"
        >
          View Details
        </button>
        <a
          href={`tel:${vendor.phone}`}
          className="flex-1 flex items-center justify-center bg-slate-900 text-white font-bold py-3 px-4 rounded-xl hover:bg-slate-800 transition-colors duration-300"
        >
           <Icon name="phone" className="w-5 h-5 mr-2" />
          Call Vendor
        </a>
      </div>
    </div>
  );
};

export default VendorCard;
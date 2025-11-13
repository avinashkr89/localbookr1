import React, { useState, useEffect, useCallback } from 'react';
import { Page } from './types';
import type { Vendor, SearchParams, BookingPayload } from './types';
import { SERVICE_OPTIONS } from './constants';
import { getVendors, createBooking } from './services/api';
import VendorCard from './components/VendorCard';
import Spinner from './components/Spinner';
import Icon from './components/Icon';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState<boolean>(false);
  const [bookingDetails, setBookingDetails] = useState({ 
    name: '', 
    phone: '', 
    email: '', 
    address: '', 
    datetime: '', 
    notes: '', 
    payLater: true 
  });

  const fetchVendors = useCallback(async () => {
    if (!searchParams) return;
    setIsLoading(true);
    setError(null);
    setUsingMockData(false);
    try {
      const result = await getVendors(searchParams);
      setVendors(result.items);
      if (result.usingMockData) {
          setUsingMockData(true);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (currentPage === Page.Results) {
      fetchVendors();
    }
  }, [currentPage, fetchVendors]);

  const handleSearch = (service: string, area: string) => {
    setSearchParams({ service, area });
    setCurrentPage(Page.Results);
  };

  const handleViewDetails = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setCurrentPage(Page.VendorDetails);
  };
  
  const handleNavigateToBooking = () => {
      if (selectedVendor) {
          setCurrentPage(Page.Booking);
      }
  }
  
  const handleConfirmBooking = async () => {
      if(!selectedVendor) return;
      setIsLoading(true);
      setError(null);
      const payload: BookingPayload = {
          vendorId: selectedVendor.id,
          vendorName: selectedVendor.name,
          ...bookingDetails
      }
      try {
          await createBooking(payload);
          setCurrentPage(Page.Confirmation);
      } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
          setError(errorMessage);
      } finally {
          setIsLoading(false);
      }
  }

  const resetToHome = () => {
    setSearchParams(null);
    setSelectedVendor(null);
    setVendors([]);
    setUsingMockData(false);
    setBookingDetails({ name: '', phone: '', email: '', address: '', datetime: '', notes: '', payLater: true });
    setCurrentPage(Page.Home);
  };
  
  const goBack = () => {
    setError(null);
    if (currentPage === Page.Results) {
        resetToHome();
    } else if (currentPage === Page.VendorDetails) {
        setCurrentPage(Page.Results);
    } else if (currentPage === Page.Booking) {
        setCurrentPage(Page.VendorDetails);
    }
  }

  const renderContent = () => {
    switch (currentPage) {
      case Page.Home:
        return <HomePage onSearch={handleSearch} />;
      case Page.Results:
        return (
          <ResultsPage
            vendors={vendors}
            isLoading={isLoading}
            error={error}
            searchParams={searchParams}
            onViewDetails={handleViewDetails}
            onBack={goBack}
            usingMockData={usingMockData}
          />
        );
       case Page.VendorDetails:
        return (
            <VendorDetailsPage
                vendor={selectedVendor}
                onBook={handleNavigateToBooking}
                onBack={goBack}
            />
        );
      case Page.Booking:
         return (
             <BookingPage 
                vendor={selectedVendor}
                isLoading={isLoading}
                error={error}
                bookingDetails={bookingDetails}
                setBookingDetails={setBookingDetails}
                onConfirmBooking={handleConfirmBooking}
                onBack={goBack}
             />
         );
      case Page.Confirmation:
          return <ConfirmationPage vendorName={selectedVendor?.name || ''} onDone={resetToHome} />;
      case Page.Admin:
          return <AdminPage onBack={resetToHome}/>;
      default:
        return <HomePage onSearch={handleSearch} />;
    }
  };

  return (
    <div className="min-h-screen font-sans text-[#0f172a] flex flex-col">
      <main className="flex-grow p-4 md:p-6 max-w-2xl mx-auto w-full">
        {renderContent()}
      </main>
      <footer className="text-center p-4 text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} LocalBookr. Built by Avinash.</p>
        <button onClick={() => setCurrentPage(Page.Admin)} className="text-slate-500 hover:text-slate-800 underline mt-1">
          Admin Access
        </button>
      </footer>
    </div>
  );
};

const HomePage: React.FC<{ onSearch: (service: string, area: string) => void }> = ({ onSearch }) => {
    const [service, setService] = useState(SERVICE_OPTIONS[0]);
    const [area, setArea] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(area.trim()) {
            onSearch(service, area.trim().toLowerCase());
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[75vh] text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900">LocalBookr</h1>
            <p className="mt-2 text-lg text-slate-600">Book Local Services Fast</p>
            <p className="mt-4 text-sm text-slate-500">Trusted local vendors in your area</p>
            <form onSubmit={handleSubmit} className="mt-10 w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg">
                <div className="space-y-6">
                    <div>
                        <label htmlFor="service" className="block text-left text-sm font-medium text-slate-700 mb-2">Select a service</label>
                        <select
                            id="service"
                            value={service}
                            onChange={(e) => setService(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition capitalize bg-white text-slate-900"
                        >
                            {SERVICE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="area" className="block text-left text-sm font-medium text-slate-700 mb-2">Enter your area / locality</label>
                        <input
                            id="area"
                            type="text"
                            value={area}
                            onChange={(e) => setArea(e.target.value)}
                            placeholder="e.g. Rohini Sector 7"
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition bg-white text-slate-900"
                            required
                        />
                    </div>
                </div>
                 <button type="submit" className="mt-8 w-full bg-slate-900 text-white font-bold py-4 px-6 rounded-xl hover:bg-slate-800 transition-all duration-300 shadow-md text-lg">
                    Search Vendors
                </button>
                <p className="mt-6 text-xs text-slate-400">Verified vendors curated by Avinash</p>
            </form>
        </div>
    );
}

const PageHeader: React.FC<{title: React.ReactNode, onBack: () => void}> = ({ title, onBack }) => (
    <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-200 mr-2">
            <Icon name="back" className="w-6 h-6" />
        </button>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{title}</h2>
    </div>
);

const ResultsPage: React.FC<{
    vendors: Vendor[];
    isLoading: boolean;
    error: string | null;
    searchParams: SearchParams | null;
    onViewDetails: (vendor: Vendor) => void;
    onBack: () => void;
    usingMockData: boolean;
}> = ({ vendors, isLoading, error, searchParams, onViewDetails, onBack, usingMockData }) => {
    return (
        <div>
            <PageHeader
              onBack={onBack}
              title={<>Results for <span className="capitalize">{searchParams?.service}</span></>}
            />
            
            {usingMockData && (
                <div className="mb-4 text-center text-sm text-orange-800 bg-orange-100 p-3 rounded-lg" role="alert">
                    <strong>Demo Mode:</strong> You are viewing sample data. To use your own vendors, please configure your Airtable credentials.
                </div>
            )}

            {isLoading && <Spinner />}
            {error && <p className="text-center text-red-500 bg-red-100 p-4 rounded-lg">{error}</p>}
            
            {!isLoading && !error && (
                <div className="space-y-4">
                    {vendors.length > 0 ? (
                        vendors.map(vendor => (
                            <VendorCard key={vendor.id} vendor={vendor} onViewDetails={onViewDetails} />
                        ))
                    ) : (
                        <div className="text-center text-slate-600 bg-white p-8 rounded-xl shadow-md">
                            <h3 className="font-bold text-lg">No Vendors Found</h3>
                            <p className="mt-2">We couldn't find any vendors for '{searchParams?.service}' in '{searchParams?.area}'. Please try a different area.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const VendorDetailsPage: React.FC<{
    vendor: Vendor | null;
    onBook: () => void;
    onBack: () => void;
}> = ({ vendor, onBook, onBack }) => {
    if (!vendor) return <p>Vendor not found. Please go back.</p>;

    return (
        <div>
            <PageHeader onBack={onBack} title={vendor.name} />
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <img src={vendor.photos?.[0] || 'https://placehold.co/600x400'} alt={vendor.name} className="w-full h-48 object-cover" />
                <div className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                           <p className="text-sm text-slate-500 capitalize">{vendor.service} • {vendor.area}</p>
                           <div className="flex items-center flex-wrap gap-2 mt-2">
                                <div className="flex items-center space-x-1 text-sm text-slate-600">
                                    <Icon name="star" className="w-4 h-4 text-yellow-500" />
                                    <span>{vendor.rating.toFixed(1)} Rating</span>
                                </div>
                                {vendor.verified && (
                                    <div className="flex items-center text-green-700 text-xs font-semibold bg-green-100 px-2 py-0.5 rounded-full" title="Verified">
                                        <Icon name="verified" className="w-4 h-4 mr-1 text-green-600" />
                                        <span>Verified</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <p className="text-lg font-bold text-slate-900">{vendor.rates}</p>
                    </div>

                    <div className="mt-6 border-t pt-6">
                        <h4 className="font-bold text-lg">About {vendor.name}</h4>
                        <p className="mt-2 text-slate-600 whitespace-pre-line">{vendor.description}</p>
                    </div>

                    <button onClick={onBook} className="mt-8 w-full bg-slate-900 text-white font-bold py-4 px-6 rounded-xl hover:bg-slate-800 transition-all duration-300 shadow-md text-lg">
                        Book This Vendor
                    </button>
                </div>
            </div>
        </div>
    );
};


const BookingPage: React.FC<{
    vendor: Vendor | null;
    isLoading: boolean;
    error: string | null;
    bookingDetails: any;
    setBookingDetails: (details: any) => void;
    onConfirmBooking: () => void;
    onBack: () => void;
}> = ({ vendor, isLoading, error, bookingDetails, setBookingDetails, onConfirmBooking, onBack }) => {
    
    if (!vendor) return <p>Vendor not found. Please go back.</p>;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setBookingDetails({ ...bookingDetails, [name]: (e.target as HTMLInputElement).checked });
        } else {
            setBookingDetails({ ...bookingDetails, [name]: value });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirmBooking();
    }

    return (
        <div>
             <PageHeader onBack={onBack} title="Booking Form" />

             <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
                <p className="text-lg font-bold text-slate-800">For: {vendor.name}</p>
                <p className="mt-1 text-sm text-slate-500 capitalize">{vendor.service} • {vendor.area}</p>
                
                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">Your Name*</label>
                        <input id="name" name="name" type="text" required value={bookingDetails.name} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition" />
                    </div>
                     <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">Your Phone*</label>
                        <input id="phone" name="phone" type="tel" required value={bookingDetails.phone} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition" />
                    </div>
                     <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">Email (optional)</label>
                        <input id="email" name="email" type="email" value={bookingDetails.email} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition" />
                    </div>
                     <div>
                        <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-2">Full Address (optional)</label>
                        <input id="address" name="address" type="text" value={bookingDetails.address} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition" />
                    </div>
                     <div>
                        <label htmlFor="datetime" className="block text-sm font-medium text-slate-700 mb-2">Preferred Date & Time*</label>
                        <input id="datetime" name="datetime" type="datetime-local" required value={bookingDetails.datetime} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition" />
                    </div>
                     <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-2">Notes (optional)</label>
                        <textarea id="notes" name="notes" rows={3} value={bookingDetails.notes} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition" />
                    </div>

                    <div className="flex items-center">
                        <input id="payLater" name="payLater" type="checkbox" checked={bookingDetails.payLater} onChange={handleChange} className="h-4 w-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900" />
                        <label htmlFor="payLater" className="ml-3 block text-sm font-medium text-slate-700">Pay Later (Cash/UPI after service)</label>
                    </div>

                    {error && <p className="text-center text-red-500">{error}</p>}
                    
                    <button type="submit" disabled={isLoading} className="w-full bg-slate-900 text-white font-bold py-4 px-6 rounded-xl hover:bg-slate-800 transition-all duration-300 shadow-md text-lg disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center">
                       {isLoading ? <Spinner /> : 'Confirm Booking'}
                    </button>
                </form>
             </div>
        </div>
    );
};

const ConfirmationPage: React.FC<{vendorName: string, onDone: () => void}> = ({ vendorName, onDone }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[75vh] text-center bg-white p-8 rounded-2xl shadow-lg">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Booking Sent!</h2>
            <p className="mt-4 text-slate-600 max-w-md">
                Your booking with <strong>{vendorName}</strong> has been created. Admin will confirm soon.
            </p>
            <button onClick={onDone} className="mt-8 w-full max-w-xs bg-slate-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-slate-800 transition-colors duration-300 shadow-md">
                Go Back Home
            </button>
            <p className="mt-6 text-xs text-slate-400">Support: @iamavi_89</p>
        </div>
    );
}

const AdminPage: React.FC<{onBack: () => void}> = ({ onBack }) => {
    return (
        <div>
            <PageHeader onBack={onBack} title="Admin Access" />
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                <h3 className="text-xl font-bold text-slate-900">Booking Management</h3>
                <p className="mt-4 text-slate-600 max-w-md mx-auto">
                   Bookings are visible in the Airtable backend. For the MVP, please open your Airtable base to view and manage all new bookings.
                </p>
                <p className="mt-4 text-slate-600 max-w-md mx-auto">
                   Instructions: <strong>Open Airtable → Bookings table</strong>
                </p>
            </div>
        </div>
    );
}

export default App;

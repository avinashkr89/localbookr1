import type { Vendor, BookingPayload, SearchParams } from '../types';

const mockVendors: Vendor[] = [
  {
    id: 'v1',
    name: 'Rajesh Kumar Plumbing',
    service: 'plumber',
    area: 'Rohini Sector 7',
    phone: '9876543210',
    verified: true,
    rating: 4.8,
    rates: 'Starting at ₹250',
    photos: ['https://placehold.co/600x400/0f172a/white?text=Plumber'],
    description: 'Rajesh Kumar is a trusted plumber with over 15 years of experience serving the Rohini area. Quick, reliable, and efficient service guaranteed for all your plumbing needs. Verified by LocalBookr (Avinash).',
  },
  {
    id: 'v2',
    name: 'Suresh Electric Works',
    service: 'electrician',
    area: 'Rohini Sector 7',
    phone: '9876543211',
    verified: true,
    rating: 4.5,
    rates: 'Inspection charge ₹150',
    photos: ['https://placehold.co/600x400/0f172a/white?text=Electrician'],
    description: 'Suresh provides expert electrical services, from minor repairs to complete wiring projects. Safety and quality are his top priorities. Kaam A1, service quick! Verified by LocalBookr (Avinash).',
  },
  {
    id: 'v3',
    name: 'Priya Boutique & Tailoring',
    service: 'tailor',
    area: 'Pitampura',
    phone: '9876543212',
    verified: false,
    rating: 4.2,
    rates: 'Blouse stitching from ₹500',
    photos: ['https://placehold.co/600x400/0f172a/white?text=Tailor'],
    description: 'Get perfectly fitted clothes from Priya Boutique. Specializing in ethnic and western wear for all occasions. Quality stitching and on-time delivery. Verified by LocalBookr (Avinash).',
  },
  {
    id: 'v4',
    name: 'Anil Carpenter Services',
    service: 'carpenter',
    area: 'Rohini Sector 7',
    phone: '9876543213',
    verified: true,
    rating: 4.9,
    rates: 'Custom furniture on demand',
    photos: ['https://placehold.co/600x400/0f172a/white?text=Carpenter'],
    description: 'For all your wooden furniture and repair needs, Anil is the man. Experienced and skilled in creating beautiful, durable items for your home. Verified by LocalBookr (Avinash).',
  },
  {
    id: 'v5',
    name: 'Cool Wave AC Repair',
    service: 'ac repair',
    area: 'Pitampura',
    phone: '9876543214',
    verified: true,
    rating: 4.7,
    rates: 'Service charge ₹499',
    photos: ['https://placehold.co/600x400/0f172a/white?text=AC+Repair'],
    description: 'Don\'t suffer in the heat! Cool Wave offers fast and effective AC repair, installation, and maintenance services. Expert technicians, cool prices. Verified by LocalBookr (Avinash).',
  },
  {
    id: 'v6',
    name: 'Gupta Plumbing Solutions',
    service: 'plumber',
    area: 'Pitampura',
    phone: '9876543215',
    verified: false,
    rating: 4.0,
    rates: 'No visiting charge',
    photos: ['https://placehold.co/600x400/0f172a/white?text=Plumber'],
    description: 'From leaky faucets to major pipe issues, Gupta Plumbing Solutions has you covered. Honest, affordable, and available for emergencies. Verified by LocalBookr (Avinash).',
  },
  {
    id: 'v7',
    name: 'Arctic Cool AC Services',
    service: 'ac repair',
    area: 'Rohini Sector 7',
    phone: '9876543216',
    verified: true,
    rating: 4.9,
    rates: 'Gas charging from ₹1500',
    photos: ['https://placehold.co/600x400/0f172a/white?text=Top+AC+Service'],
    description: 'Expert AC technician for all brands. Get your AC fixed today for a cool and comfortable summer. Quick service in Rohini. Verified by LocalBookr (Avinash).',
  },
];

export const getVendors = (params: SearchParams): Promise<Vendor[]> => {
  console.log('Fetching vendors for:', params);
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = mockVendors.filter(
        (vendor) =>
          vendor.service.toLowerCase() === params.service.toLowerCase() &&
          vendor.area.toLowerCase().includes(params.area.toLowerCase())
      );
      resolve(filtered);
    }, 1000);
  });
};

export const createBooking = (payload: BookingPayload): Promise<{ ok: boolean }> => {
  console.log('Creating booking:', payload);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ok: true });
    }, 1500);
  });
};
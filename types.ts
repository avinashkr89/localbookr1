export interface Vendor {
  id: string;
  name: string;
  service: string;
  area: string;
  phone: string;
  verified: boolean;
  rating: number;
  rates: string;
  photos?: string[];
  description: string;
}

export interface BookingPayload {
  vendorId: string;
  vendorName: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  datetime: string;
  notes: string;
  payLater: boolean;
}

export enum Page {
  Home,
  Results,
  VendorDetails,
  Booking,
  Confirmation,
  Admin,
}

export type SearchParams = {
  service: string;
  area: string;
}

export interface VendorApiResponse {
  items: Vendor[];
  usingMockData?: boolean;
}

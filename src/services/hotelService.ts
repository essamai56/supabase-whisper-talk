
import { supabase } from "@/integrations/supabase/client";

export interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  email: string;
  phone: string;
  website: string;
  check_in_time: string;
  check_out_time: string;
  amenities?: string[];
  lowest_price?: number;
}

export interface Room {
  id: string;
  hotel_id: string;
  room_type_id: string;
  room_number: string;
  floor: string;
  price_per_night: number;
  is_available: boolean;
  room_type?: {
    name: string;
    description: string;
    max_occupancy: number;
    amenities?: string[];
  };
}

export const getHotels = async (search?: string): Promise<Hotel[]> => {
  let query = supabase
    .from('hotels')
    .select(`
      *,
      hotel_amenities!inner (
        amenities (name)
      )
    `);
  
  if (search) {
    query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%,state.ilike.%${search}%`);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching hotels:', error);
    throw error;
  }
  
  // Transform data to get amenity names and lowest price
  const hotelsWithDetails = await Promise.all(data.map(async (hotel) => {
    // Get amenities
    const amenities = hotel.hotel_amenities.map((ha: any) => ha.amenities.name);
    
    // Get lowest price
    const { data: roomsData, error: roomsError } = await supabase
      .from('rooms')
      .select('price_per_night')
      .eq('hotel_id', hotel.id)
      .order('price_per_night', { ascending: true })
      .limit(1);
      
    if (roomsError) {
      console.error('Error fetching lowest price:', roomsError);
    }
    
    const lowest_price = roomsData && roomsData.length > 0 ? roomsData[0].price_per_night : null;
    
    return {
      ...hotel,
      amenities,
      lowest_price
    };
  }));
  
  return hotelsWithDetails;
};

export const getHotelById = async (id: string): Promise<Hotel | null> => {
  const { data, error } = await supabase
    .from('hotels')
    .select(`
      *,
      hotel_amenities (
        amenities (id, name, description, icon)
      )
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching hotel by ID:', error);
    throw error;
  }

  if (!data) return null;

  // Transform amenities data
  const amenities = data.hotel_amenities.map((ha: any) => ha.amenities);

  return {
    ...data,
    amenities
  };
};

export const getRoomsByHotelId = async (hotelId: string): Promise<Room[]> => {
  const { data, error } = await supabase
    .from('rooms')
    .select(`
      *,
      room_type:room_type_id (
        name, 
        description, 
        max_occupancy,
        room_amenities (
          amenity:amenity_id (
            name,
            icon,
            description
          )
        )
      )
    `)
    .eq('hotel_id', hotelId);
  
  if (error) {
    console.error('Error fetching rooms by hotel ID:', error);
    throw error;
  }
  
  // Transform room type amenities data
  return data.map((room: any) => {
    const amenities = room.room_type.room_amenities.map((ra: any) => ra.amenity);
    
    return {
      ...room,
      room_type: {
        ...room.room_type,
        amenities
      }
    };
  });
};

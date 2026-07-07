export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: 'super_admin' | 'zone_manager' | 'seller' | 'hub' | 'delivery_center' | 'franchise' | 'field_agent' | 'staff' | 'customer';
          full_name: string;
          email: string;
          phone: string | null;
          avatar_url: string | null;
          kyc_status: 'pending' | 'approved' | 'rejected';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      zones: {
        Row: {
          id: string;
          name: string;
          polygon: any; // Using any to avoid unresolved GeoJSON types in compilation
          pincodes: string[];
          delivery_charge: number;
          min_order_value: number;
          eta_minutes: number;
          free_delivery_threshold: number | null;
          manager_id: string | null;
          created_at: string;
        };
      };
      orders: {
        Row: {
          id: string;
          customer_id: string;
          seller_id: string;
          zone_id: string;
          status: 'placed' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'returned' | 'refunded';
          total_amount: number;
          payment_method: 'cod' | 'razorpay' | 'wallet';
          created_at: string;
        };
      };
    };
    Functions: {
      approve_kyc: {
        Args: { seller_id: string; approved: boolean; reason?: string };
        Returns: void;
      };
    };
  };
};

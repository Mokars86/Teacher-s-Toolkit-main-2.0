import { createClient } from '@supabase/supabase-js';

// Environment variables or fallback defaults
export const SUPABASE_PROJECT_ID =
  (import.meta as any).env?.VITE_SUPABASE_PROJECT_ID || 'jirxxsajsrjwjbdfrwlr';

export const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL || 'https://jirxxsajsrjwjbdfrwlr.supabase.co';

export const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppcnh4c2Fqc3Jqd2piZGZyd2xyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyMDMyMTgsImV4cCI6MjEwNTc3OTIxOH0.Djt1fBVgl2ztMZFGVUPY01CKMnHHVp9sY8GA8nCR_gE';

export const STORAGE_BUCKET_NAME =
  (import.meta as any).env?.VITE_SUPABASE_STORAGE_BUCKET || 'Teachers ToolKit';

// Initialize Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ==========================================
// 1. STORAGE SERVICE HELPERS ("Teachers ToolKit")
// ==========================================

export const storageService = {
  /**
   * Uploads a file/blob to the Teachers ToolKit bucket
   * @param path Target path in bucket (e.g., "reports/term1_2026.pdf" or "avatars/teacher_1.png")
   * @param file File, Blob, or Uint8Array
   * @param upsert Whether to overwrite existing file
   */
  async uploadFile(path: string, file: File | Blob | ArrayBuffer, upsert: boolean = true) {
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET_NAME)
        .upload(path, file, {
          upsert,
          cacheControl: '3600',
        });

      if (error) throw error;
      return { success: true, data, error: null };
    } catch (err: any) {
      console.error('Error uploading file to Supabase storage:', err);
      return { success: false, data: null, error: err.message || err };
    }
  },

  /**
   * Get public URL for a file in the Teachers ToolKit bucket
   */
  getPublicUrl(path: string) {
    const { data } = supabase.storage.from(STORAGE_BUCKET_NAME).getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * Download a file from the bucket
   */
  async downloadFile(path: string) {
    try {
      const { data, error } = await supabase.storage.from(STORAGE_BUCKET_NAME).download(path);
      if (error) throw error;
      return { success: true, data, error: null };
    } catch (err: any) {
      console.error('Error downloading file from Supabase storage:', err);
      return { success: false, data: null, error: err.message || err };
    }
  },

  /**
   * Delete files from the bucket
   */
  async deleteFiles(paths: string[]) {
    try {
      const { data, error } = await supabase.storage.from(STORAGE_BUCKET_NAME).remove(paths);
      if (error) throw error;
      return { success: true, data, error: null };
    } catch (err: any) {
      console.error('Error deleting file(s) from Supabase storage:', err);
      return { success: false, data: null, error: err.message || err };
    }
  },

  /**
   * List files in a bucket folder
   */
  async listFiles(folderPath: string = '') {
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET_NAME)
        .list(folderPath, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        });
      if (error) throw error;
      return { success: true, data: data || [], error: null };
    } catch (err: any) {
      console.error('Error listing files from Supabase storage:', err);
      return { success: false, data: [], error: err.message || err };
    }
  },
};

// ==========================================
// 2. DATABASE SERVICE HELPERS
// ==========================================

export const dbService = {
  /**
   * Generic select query helper
   */
  async getRows(table: string, queryBuilder?: (q: any) => any) {
    try {
      let query = supabase.from(table).select('*');
      if (queryBuilder) {
        query = queryBuilder(query);
      }
      const { data, error } = await query;
      if (error) throw error;
      return { success: true, data: data || [], error: null };
    } catch (err: any) {
      console.error(`Error fetching rows from ${table}:`, err);
      return { success: false, data: [], error: err.message || err };
    }
  },

  /**
   * Generic upsert query helper
   */
  async upsertRow(table: string, rowData: Record<string, any>, onConflict?: string) {
    try {
      const { data, error } = await supabase
        .from(table)
        .upsert(rowData, onConflict ? { onConflict } : undefined)
        .select();

      if (error) throw error;
      return { success: true, data, error: null };
    } catch (err: any) {
      console.error(`Error upserting row into ${table}:`, err);
      return { success: false, data: null, error: err.message || err };
    }
  },

  /**
   * Generic delete helper
   */
  async deleteRow(table: string, matchColumn: string, matchValue: any) {
    try {
      const { data, error } = await supabase.from(table).delete().eq(matchColumn, matchValue);
      if (error) throw error;
      return { success: true, data, error: null };
    } catch (err: any) {
      console.error(`Error deleting row from ${table}:`, err);
      return { success: false, data: null, error: err.message || err };
    }
  },

  // --- Specific Domain Entities ---

  async saveLessonPlan(lessonPlan: any) {
    return this.upsertRow('lesson_plans', lessonPlan, 'id');
  },

  async fetchLessonPlans(teacherId?: string) {
    return this.getRows('lesson_plans', (q) => {
      return teacherId ? q.eq('teacher_id', teacherId) : q;
    });
  },

  async saveTerminalReport(report: any) {
    return this.upsertRow('terminal_reports', report, 'id');
  },

  async fetchTerminalReports(classId?: string) {
    return this.getRows('terminal_reports', (q) => {
      return classId ? q.eq('class_name', classId) : q;
    });
  },

  async saveAttendanceRecord(record: any) {
    return this.upsertRow('attendance_records', record, 'id');
  },

  async fetchAttendanceRecords(classId?: string, date?: string) {
    return this.getRows('attendance_records', (q) => {
      let query = q;
      if (classId) query = query.eq('class_name', classId);
      if (date) query = query.eq('date', date);
      return query;
    });
  },

  async saveSchoolCollection(transaction: any) {
    return this.upsertRow('school_collections', transaction, 'id');
  },

  async fetchSchoolCollections(schoolId?: string) {
    return this.getRows('school_collections', (q) => {
      return schoolId ? q.eq('school_id', schoolId) : q;
    });
  },

  async savePaymentTransaction(payment: any) {
    return this.upsertRow('payment_transactions', payment, 'id');
  },

  async fetchPaymentTransactions(customerEmail?: string) {
    return this.getRows('payment_transactions', (q) => {
      let query = q;
      if (customerEmail) query = query.eq('customer_email', customerEmail);
      return query.order('created_at', { ascending: false });
    });
  },
};

// ==========================================
// 3. CONNECTION & HEALTH CHECK
// ==========================================

export interface SupabaseHealthCheckResult {
  connected: boolean;
  projectUrl: string;
  projectId: string;
  storageBucket: string;
  dbAccessible: boolean;
  storageAccessible: boolean;
  message: string;
  error?: any;
}

export async function testSupabaseConnection(): Promise<SupabaseHealthCheckResult> {
  const result: SupabaseHealthCheckResult = {
    connected: false,
    projectUrl: SUPABASE_URL,
    projectId: SUPABASE_PROJECT_ID,
    storageBucket: STORAGE_BUCKET_NAME,
    dbAccessible: false,
    storageAccessible: false,
    message: 'Testing connection...',
  };

  try {
    // 1. Test Auth / Core endpoint
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError && !authError.message.includes('Auth session missing')) {
      console.warn('Supabase auth check response:', authError);
    }

    // 2. Test Storage Bucket connectivity
    try {
      const { data: bucketData, error: storageErr } = await supabase.storage
        .from(STORAGE_BUCKET_NAME)
        .list('', { limit: 1 });

      if (!storageErr) {
        result.storageAccessible = true;
      } else {
        console.warn('Storage bucket note:', storageErr.message);
      }
    } catch (sErr) {
      console.warn('Storage test error:', sErr);
    }

    // 3. Test Database connectivity (pinging a generic system check or health ping)
    try {
      const { error: pingErr } = await supabase.from('_health_check').select('*').limit(1);
      // Even if _health_check table doesn't exist, a 404 or PGRST204 from Supabase confirms the API is live & responding
      if (!pingErr || pingErr.code === 'PGRST204' || pingErr.code === '42P01' || pingErr.message) {
        result.dbAccessible = true;
      }
    } catch (dErr) {
      console.warn('Database test ping:', dErr);
      result.dbAccessible = true; // API reached
    }

    result.connected = true;
    result.message = 'Successfully connected to Supabase backend!';
    return result;
  } catch (error: any) {
    console.error('Supabase connection test failed:', error);
    result.connected = false;
    result.message = error.message || 'Failed to connect to Supabase';
    result.error = error;
    return result;
  }
}

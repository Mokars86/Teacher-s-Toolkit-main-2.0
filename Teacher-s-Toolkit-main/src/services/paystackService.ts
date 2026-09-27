import { PaymentTransaction, MobileMoneyProvider } from '../types';
import { dbService } from './supabaseClient';

export const PAYSTACK_PUBLIC_KEY = 
  (import.meta as any).env?.VITE_PAYSTACK_PUBLIC_KEY || 
  "pk_live_ab1bdb953e81c8def7dd5c531400cdc67e1d59e2";

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: {
        key: string;
        email: string;
        amount: number; // in pesewas / smallest currency unit
        currency?: string;
        ref?: string;
        channels?: string[];
        metadata?: {
          custom_fields?: Array<{
            display_name: string;
            variable_name: string;
            value: any;
          }>;
          [key: string]: any;
        };
        callback: (response: {
          reference: string;
          status: string;
          trans?: string;
          transaction?: string;
          message?: string;
          [key: string]: any;
        }) => void;
        onClose: () => void;
      }) => {
        openIframe: () => void;
      };
    };
  }
}

/**
 * Ensures Paystack Inline JS script is loaded into DOM
 */
export async function loadPaystackScript(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (window.PaystackPop) return true;

  return new Promise((resolve) => {
    const existingScript = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      // In case it was already loaded
      if (window.PaystackPop) return resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Paystack Inline JS SDK');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export interface PaystackCheckoutOptions {
  email: string;
  amountGHS: number;
  itemTitle: string;
  planId?: string;
  phone?: string;
  provider?: MobileMoneyProvider;
  metadata?: Record<string, any>;
  onSuccess: (transaction: PaymentTransaction, rawResponse: any) => void;
  onCancel?: () => void;
  onError?: (errorMessage: string) => void;
}

/**
 * Initializes real Paystack Pop Modal for MoMo & Card Checkout
 */
export async function launchPaystackPayment(options: PaystackCheckoutOptions): Promise<void> {
  const {
    email,
    amountGHS,
    itemTitle,
    planId,
    phone,
    provider,
    metadata = {},
    onSuccess,
    onCancel,
    onError,
  } = options;

  if (amountGHS <= 0) {
    const freeTx: PaymentTransaction = {
      id: 'tx_free_' + Date.now(),
      planOrItemTitle: itemTitle,
      amountGHS: 0,
      provider: 'MTN MoMo',
      phoneNumber: phone || '',
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
      reference: 'FREE-TIER-ACTIVE',
    };
    onSuccess(freeTx, { status: 'success', reference: freeTx.reference });
    return;
  }

  // Ensure Paystack SDK is ready
  const isLoaded = await loadPaystackScript();
  if (!isLoaded || !window.PaystackPop) {
    const err = 'Paystack payment gateway could not be loaded. Please check your network connection.';
    if (onError) onError(err);
    else alert(err);
    return;
  }

  // Format email fallback if user is in offline/anonymous mode
  const validEmail = email && email.includes('@') ? email : 'teacher.user@teachers-toolkit.app';

  // Amount in Pesewas (1 GHS = 100 Pesewas)
  const amountInPesewas = Math.round(amountGHS * 100);

  // Generate unique transaction reference
  const generatedReference = `TT-PAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  try {
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: validEmail,
      amount: amountInPesewas,
      currency: 'GHS',
      ref: generatedReference,
      channels: ['card', 'mobile_money', 'qr', 'bank'],
      metadata: {
        custom_fields: [
          {
            display_name: 'Product / Plan',
            variable_name: 'product_plan',
            value: itemTitle,
          },
          {
            display_name: 'Plan ID',
            variable_name: 'plan_id',
            value: planId || itemTitle,
          },
          {
            display_name: 'Customer Phone',
            variable_name: 'customer_phone',
            value: phone || 'N/A',
          },
        ],
        ...metadata,
      },
      callback: async (response) => {
        const txRecord: PaymentTransaction = {
          id: `tx_${response.reference || Date.now()}`,
          planOrItemTitle: itemTitle,
          amountGHS: amountGHS,
          provider: provider || 'MTN MoMo',
          phoneNumber: phone || '',
          date: new Date().toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          status: 'completed',
          reference: response.reference || generatedReference,
        };

        // Save transaction to Supabase cloud
        try {
          await dbService.savePaymentTransaction({
            id: txRecord.id,
            reference: txRecord.reference,
            plan_title: itemTitle,
            amount_ghs: amountGHS,
            currency: 'GHS',
            customer_email: validEmail,
            customer_phone: phone || '',
            provider: provider || 'Paystack',
            status: 'completed',
            gateway: 'paystack',
            metadata: {
              ...metadata,
              paystack_response: response,
            },
          });
        } catch (dbErr) {
          console.warn('Could not record payment transaction to Supabase:', dbErr);
        }

        onSuccess(txRecord, response);
      },
      onClose: () => {
        if (onCancel) {
          onCancel();
        }
      },
    });

    handler.openIframe();
  } catch (err: any) {
    console.error('Paystack initialization error:', err);
    if (onError) onError(err.message || 'Failed to open Paystack checkout window.');
  }
}

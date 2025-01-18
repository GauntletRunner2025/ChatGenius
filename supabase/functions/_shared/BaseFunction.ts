import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './cors.ts';

export abstract class BaseFunction {
  protected supabaseClient: SupabaseClient;
  protected user: any;

  constructor() {
    this.supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
  }

  protected async handleCors(req: Request): Promise<Response | null> {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }
    return null;
  }

  protected async authenticateUser(req: Request): Promise<boolean> {
    const authHeader = req.headers.get('Authorization')?.split(' ')[1];
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await this.supabaseClient.auth.getUser(authHeader);
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    this.user = user;
    return true;
  }

  protected createResponse(body: any, status: number = 200): Response {
    return new Response(
      JSON.stringify(body),
      { 
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  protected createErrorResponse(error: string, status: number = 500): Response {
    return this.createResponse({ error }, status);
  }

  abstract handleRequest(req: Request): Promise<Response>;

  public async serve(req: Request): Promise<Response> {
    console.log('Request received:', {
      method: req.method,
      headers: Object.fromEntries(req.headers.entries()),
      url: req.url
    });

    try {
      // Handle CORS
      const corsResponse = await this.handleCors(req);
      if (corsResponse) return corsResponse;

      // Authenticate user
      await this.authenticateUser(req);

      // Handle the actual request
      return await this.handleRequest(req);

    } catch (error) {
      console.error('Error in function:', error);
      return this.createErrorResponse(error.message);
    }
  }

  public static getRequiredEnvVar(key: string): string {
    const value = Deno.env.get(key);
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }

  public static getOptionalEnvVar(key: string, defaultValue?: string): string | undefined {
    const value = Deno.env.get(key);
    return value ?? defaultValue;
  }
} 
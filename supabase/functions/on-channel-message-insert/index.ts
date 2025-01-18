import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"
import { WebhookPayload } from '../_shared/types/Webhook.ts'
import { BaseFunction } from '../_shared/BaseFunction.ts'

interface Message {
  id: string
  message: string
  embedding?: number[]
}

class MessageInsertFunction extends BaseFunction {
  public override async serve(req: Request): Promise<Response> {
    this.debug('Starting message insert webhook handler');
    this.debug(`Request URL: ${req.url}`);
    this.debug(`Request method: ${req.method}`);
    this.debug(`Request headers: ${JSON.stringify(Object.fromEntries(req.headers.entries()))}`);

    try {
      const corsResponse = await this.handleCors(req);
      if (corsResponse) {
        this.debug('Returning CORS response');
        return corsResponse;
      }

      return await this.handleRequest(req);
    } catch (error: any) {
      this.debug(`Error in serve: ${error.message}`);
      this.debug(`Error stack: ${error.stack}`);
      console.error('Error in function:', error);
      return this.createErrorResponse(error.message || 'Unknown error');
    }
  }

  async handleRequest(req: Request): Promise<Response> {
    this.debug('Starting handleRequest');
    
    const payload = await req.json() as WebhookPayload<Message>
    this.debug(`Received webhook payload type: ${payload.type}`);
    this.debug(`Received webhook table: ${payload.table}`);
    this.debug(`Received webhook schema: ${payload.schema}`);
    this.debug(`Received message: ${JSON.stringify(payload.record)}`);
    
    if (!payload.record?.message) {
      this.debug('Message text is missing');
      return this.createErrorResponse('Message text is required', 400)
    }

    // Call getEmbedding function
    const embedUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/getEmbedding`;
    this.debug(`Calling getEmbedding function at: ${embedUrl}`);
    this.debug(`Message text to embed: ${payload.record.message}`);

    const embeddingResponse = await fetch(embedUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: payload.record.message
      })
    })

    this.debug(`Embedding response status: ${embeddingResponse.status}`);
    if (!embeddingResponse.ok) {
      const errorText = await embeddingResponse.text();
      this.debug(`Failed to get embedding: ${errorText}`);
      this.debug(`Response headers: ${JSON.stringify(Object.fromEntries(embeddingResponse.headers.entries()))}`);
      return this.createErrorResponse('Failed to generate embedding', 500)
    }

    const responseData = await embeddingResponse.json();
    this.debug(`Embedding response data: ${JSON.stringify(responseData)}`);
    const { embedding } = responseData;
    this.debug(`Got embedding of length: ${embedding.length}`);

    // Update message with embedding
    this.debug(`Updating message ${payload.record.id} with embedding`);
    const { error: updateError } = await this.supabaseClient
      .from('message')
      .update({ embedding })
      .eq('id', payload.record.id)

    if (updateError) {
      this.debug(`Failed to update message: ${JSON.stringify(updateError)}`);
      return this.createErrorResponse('Failed to store embedding', 500)
    }

    this.debug('Successfully updated message with embedding');
    return this.createResponse({ success: true })
  }
}

const handler = new MessageInsertFunction()
serve((req: Request) => handler.serve(req))

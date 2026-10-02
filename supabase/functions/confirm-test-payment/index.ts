import { handle } from './payment-core.ts';
Deno.serve(req=>handle(req,'confirm'));

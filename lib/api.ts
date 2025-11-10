import { supabase } from './supabase';
import { Database } from './database.types';

type Item = Database['public']['Tables']['items']['Row'];
type ItemInsert = Database['public']['Tables']['items']['Insert'];
type ItemUpdate = Database['public']['Tables']['items']['Update'];
type Comment = Database['public']['Tables']['comments']['Row'];
type CommentInsert = Database['public']['Tables']['comments']['Insert'];
type AuditLog = Database['public']['Tables']['audit_logs']['Row'];
type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert'];

export const MOCK_USER_ID = 'user1';

export async function fetchItems(): Promise<Item[]> {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchItemById(id: string): Promise<Item | null> {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createItem(item: ItemInsert): Promise<Item> {
  const { data, error } = await supabase
    .from('items')
    .insert(item)
    .select()
    .single();

  if (error) {
    console.error('Error creating item:', error);
    console.error('Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    throw error;
  }
  return data;
}

export async function updateItem(id: string, updates: ItemUpdate, userId: string): Promise<Item> {
  const oldItem = await fetchItemById(id);

  const { data, error } = await supabase
    .from('items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  if (oldItem) {
    await logAudit({
      item_id: id,
      user_id: userId,
      action: 'item_update',
      old_value: oldItem as any,
      new_value: data as any,
    });
  }

  return data;
}

export async function updateItemStatus(
  id: string,
  newStatus: Item['status'],
  userId: string
): Promise<Item> {
  const oldItem = await fetchItemById(id);
  if (!oldItem) throw new Error('Item not found');

  const updates: ItemUpdate = { status: newStatus };

  if (newStatus === 'status2' && !oldItem.f1_locked_at) {
    updates.f1_locked_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  await logAudit({
    item_id: id,
    user_id: userId,
    action: 'status_change',
    old_value: { status: oldItem.status } as any,
    new_value: { status: newStatus } as any,
  });

  return data;
}

export async function fetchComments(itemId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('item_id', itemId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createComment(comment: CommentInsert): Promise<Comment> {
  const { data, error } = await supabase
    .from('comments')
    .insert(comment)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchAuditLogs(itemId: string): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('item_id', itemId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function logAudit(log: AuditLogInsert): Promise<AuditLog> {
  const { data, error } = await supabase
    .from('audit_logs')
    .insert(log)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteItem(id: string, userId: string): Promise<void> {
  await logAudit({
    item_id: id,
    user_id: userId,
    action: 'item_delete',
    old_value: null,
    new_value: null,
  });

  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
